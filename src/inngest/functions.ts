import { inngest } from './client';
import {
  createAgent,
  createNetwork,
  createState,
  createTool,
  gemini,
  Message,
  Tool,
} from '@inngest/agent-kit';
import { Sandbox } from '@e2b/code-interpreter';
import { getSandbox, lastAssistantTextMessageContent } from '@/lib/utils';
import z from 'zod';
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from '@/lib/prompt';
import prisma from '@/lib/db';


const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const SANDBOX_API_KEY = process.env.E2B_API_KEY || '';
const SANDBOX_DURATION = 10 * 60 * 1000; // 10 minutes

interface AgentState {
  summary :string,
  files: {[path:string]:string},

}

const parseAgentOutput = (value: Message[] ) => {
  const output = value[0];
  if(output.type !== 'text'){
        return 'Here you go!';
  }
  if(Array.isArray(output.content)){
    return output.content.join(' ');
  }else{
    return output.content;
  }
};    

export const codeAgent = inngest.createFunction(
  { id: 'code-agent' },
  { event: 'code-agent/generate-code' },
  async ({ event, step }) => {
    let sandbox: Sandbox;

    const sandboxId = await step.run('get-sandbox-id', async () => {
      const sandboxEnvironment = await Sandbox.create('vibe-nextjs-rohit-06', {
        apiKey: SANDBOX_API_KEY,
      });
      await sandboxEnvironment.setTimeout(SANDBOX_DURATION); // 10 minutes
      return sandboxEnvironment.sandboxId;
    });

    sandbox = await getSandbox(sandboxId);

    const previousMessages = await step.run( 'get-previous-messages',
      async () => {
        const formattedMessages: Message[] = []
        const messages = await prisma.message.findMany({
          where: {
            projectId: event.data.projectId,
          },
          orderBy: {
            updatedAt: 'asc',
          },
          take: 5, // Limit to the last 5 messages
        });
        for (const message of messages) {
          formattedMessages.push({
            type: 'text',
            role: message.role === 'USER' ? 'user' : 'assistant',
            content: message.content,
          });
        }
        return formattedMessages;
    })

    const state  = createState<AgentState>({
      summary: '',
      files: {},
    },{
      messages: previousMessages,
    })
    const codeWriterAgent = createAgent<AgentState>({
      name: 'code-agent',
      description:
        'You are an expert coding agent. You write readable, maintainable code.',
      system: PROMPT,
      model: gemini({
        model: 'gemini-2.5-flash',
        apiKey: GEMINI_API_KEY,
        defaultParameters: {
          generationConfig: { temperature: 0.1 },
        },
      }),
      tools: [
        createTool({
          name: 'terminal',
          description: 'use the terminal to run commands',
          parameters: z.object({
            command: z.string(),
          }) as any,
          handler: async ({ command }, { step }) => {
            return await step?.run('terminal', async () => {
              const buffers = { stdout: '', stderr: '' };

              try {
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (err: string) => {
                    buffers.stderr += err;
                  },
                });
                return result.stdout;
              } catch (e) {
                console.error(
                  `Command failed: ${e} \nstdout: ${buffers.stdout} \n stderr:${buffers.stderr}`
                );
                return `Command failed: ${e} \nstdout: ${buffers.stdout} \n stderr:${buffers.stderr}`;
              }
            });
          },
        }),
        createTool({
          name: 'createOrUpdateFiles',
          description: 'Create or update files in the sandbox',
          parameters: z.array(
            z.object({
              path: z.string(),
              content: z.string(),
            })
          ) as any,
          handler: async ({ files }, { step, network }: Tool.Options<AgentState>) => {
            const newFiles = await step?.run(
              'createOrUpdateFiles',
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  for (const file of files) {
                    await sandbox.files.write( `/app/src/${file.path}`, file.content);
                    updatedFiles[`/app/src/${file.path}`] = file.content;
                  }
                  return updatedFiles;
                } catch (e) {
                  return `CREATEORUPDATE FILE Error: ${e}`;
                }
              }
            );
            if (typeof newFiles === 'object') {
              network.state.data.files = newFiles;
            }
          },
        }),
        createTool({
          name: 'readFiles',
          description: 'Read Files from the sandbox',
          parameters: z.object({
            files: z.array(z.string()),
          }) as any,
          handler: async ({ files }, { step }) => {
            const fileList = Array.isArray(files) ? files : [files];

            return await step?.run('readFiles', async () => {
              try {
                const contents = [];
                for (const file of fileList) {
                  const content = await sandbox.files.read(file);
                  contents.push(content);
                }
                return JSON.stringify(contents);
              } catch (e) {
                return `READ FILE ERROR: ${e}`;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantTextMessageText =
            lastAssistantTextMessageContent(result);
          if (lastAssistantTextMessageText && network) {
            if (lastAssistantTextMessageText.includes('<task_summary>')) {
              network.state.data.summary = lastAssistantTextMessageText;
            }
          }
          return result;
        },
      },
    });

    const network = createNetwork<AgentState>({
      name: 'coding-agent-network',
      agents: [codeWriterAgent],
      defaultState: state,
      maxIter: 15,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) return;
        return codeWriterAgent;
      },
    });

    const result = await network.run(event.data.value, {state: state});

    const fragmentTitleGenerator = createAgent({
      name: 'fragment-title-generator',
      description: 'Generate a title for the code fragment',
      system: FRAGMENT_TITLE_PROMPT,
      model: gemini({
        model: 'gemini-2.0-flash',
        apiKey: GEMINI_API_KEY,
        defaultParameters: {
          generationConfig: { temperature: 0.1 },
        },
      }),
    }); 

     const responseGenerator = createAgent({
      name: 'response-generator',
      description: 'Generate a response for the code fragment',
      system: RESPONSE_PROMPT,
      model: gemini({
        model: 'gemini-2.0-flash',
        apiKey: GEMINI_API_KEY,
        defaultParameters: {
          generationConfig: { temperature: 0.1 },
        },
      }),
    }); 

    const {output: fragmentTitleOutput} = await fragmentTitleGenerator.run(result.state.data.summary)
    const {output: fragmentResponseOutput} = await responseGenerator.run(result.state.data.summary)

    


    const sandboxUrl = await step.run('get-sandbox-url', async () => {
      return `https://${sandbox.getHost(3000)}`;
    });

    const isError = !result.state.data.summary || Object.keys(result.state.data.files || {}).length ===0;
    await step.run("save-result", async () =>{
      return await prisma.message.create({
        data:{
          projectId:event.data.projectId,
          content: parseAgentOutput(fragmentResponseOutput),
          role:"ASSISTANT",
          type:isError ? "ERROR" : 'RESULT',
          fragment: isError ? undefined: {
            create:{
              sandboxUrl: sandboxUrl,
              files: result.state.data.files,
              title:parseAgentOutput(fragmentTitleOutput),
            }
          }
        }
      })
    })
    return {
      url: sandboxUrl,
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);
