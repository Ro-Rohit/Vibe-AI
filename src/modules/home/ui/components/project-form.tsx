'use client';
import {useForm} from 'react-hook-form';
import {zodResolver} from "@hookform/resolvers/zod"
import TextAreaAutoSize from 'react-textarea-autosize'
import { useState } from 'react';
import { ArrowUpIcon, Loader2Icon } from 'lucide-react';
import { useMutation,  useQueryClient } from '@tanstack/react-query';
import { Form, FormField } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { z } from "zod"
import { Button } from '@/components/ui/button';
import { useTRPC } from '@/trpc/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { PROJECT_TEMPLATES } from '@/lib/constant';
import { useClerk } from '@clerk/nextjs';
 
const formSchema = z.object({
  value: z.string().min(1, {message: "Message is required"}).max(1000, {message: "Message is too long"}),
})


const ProjectForm = () => {
    const trpc = useTRPC();
    const router = useRouter();
    const queryCLient = useQueryClient()
    const clerk  = useClerk();
    const [isFocused, setIsFocused] = useState(false);
    const form  = useForm<z.infer<typeof formSchema>>({
      resolver:zodResolver(formSchema),
      defaultValues:{
        value:""
      }
    });

    const onSubmit = async (input: z.infer<typeof formSchema>) =>{
      await createProject.mutateAsync({value:input.value})

    }

    const createProject = useMutation(trpc.projects.create.mutationOptions({
      onSuccess:(data) =>{
        form.reset();
        queryCLient.invalidateQueries(
          trpc.projects.getMany.queryOptions()
        )
        router.push(`/projects/${data.id}`);
        toast.success("Project created successfully!");
        // TODO: Invalidate usage Status
        queryCLient.invalidateQueries(
          trpc.usages.getUsageStatus.queryOptions()
        )
      },
      onError:(err) =>{
        // TODO: Redirect to pricing page
        console.error("Error creating project:", err);
        if(err.data?.code === "UNAUTHORIZED"){
          clerk.openSignIn();
          return;
        }
        else if(err.data?.code === 'TOO_MANY_REQUESTS'){
          toast.error("You have exceeded your usage limit. Please try again later.");
          router.push('/pricing');
          form.reset();
          return;
        }
        else{
          toast.error(err.message);
        }

      }
    }))
    const isPending = createProject.isPending;
    const isBtnDisabled = isPending || !form.formState.isValid;
    


    return ( 
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn('relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all',
            isFocused && "shadow-xs",
          )}
        >
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <TextAreaAutoSize 
              {...field} 
              onFocus={() => setIsFocused(true)}
              onBlur={()=> setIsFocused(false)}
              minRows={2}
              maxRows={8}
              className='pt-4 resize-none border-none w-full outline-none bg-transparent'
              placeholder='what would you like to build?'
              onKeyDown={(e) =>{
                if(e.key === "Enter" && (e.ctrlKey || e.metaKey)){
                  e.preventDefault();
                  form.handleSubmit(onSubmit)(e);
                }
              }}
              />
          )}
        />
        <div className='flex gap-2 items-end justify-between pt-2'>
          <div className='text-[10px] text-muted-foreground font-mono'>
            <kbd className='ml-auto pointer-events-none inline-flex h-5  select-none items-center gap-1 
              rounded border bg-muted px-1.5 font-mono text-[10px] font-medium'
            >
              <span>&#8984;</span>Enter
            </kbd>
            &nbsp; to submit
          </div>
          <Button disabled={isBtnDisabled} className={cn('size-8 rounded-full cursor-pointer', isBtnDisabled && "bg-muted-foreground border")}>
            {isPending ?(
              <Loader2Icon className='size-4 animate-spin' />
            ): (
            <ArrowUpIcon />
            )}
          </Button>
        </div>

        </form>

        <div className='flex-wrap justify-center gap-2 hidden md:flex max-w-3xl mx-auto mt-4'>
          {PROJECT_TEMPLATES.map((template, idx) => (
            <Button 
              key={idx} 
              variant={'outline'} 
              size={'sm'}
              className='bg-white dark:bg-sidebar' 
              onClick={() => {
                form.setValue('value', template.prompt, {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }}
            >
              {template.emoji} {template.title}
            </Button>
          ))}
        </div>
      </Form>
     );
}
 
export default ProjectForm;