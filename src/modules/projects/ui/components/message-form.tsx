"use client";
import {useForm} from 'react-hook-form';
import {zodResolver} from "@hookform/resolvers/zod"
import TextAreaAutoSize from 'react-textarea-autosize'
import { useState } from 'react';
import { ArrowUpIcon, Loader2Icon } from 'lucide-react';
import { useMutation,  useQuery,  useQueryClient } from '@tanstack/react-query';
import { Form, FormField } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { z } from "zod"
import { Button } from '@/components/ui/button';
import { useTRPC } from '@/trpc/client';
import { toast } from 'sonner';
import Usage from './usage';
import { useRouter } from 'next/navigation';
 
const formSchema = z.object({
  value: z.string().min(1, {message: "Message is required"}).max(1000, {message: "Message is too long"}),
})



interface Props {
    projectId:string
}

const MessageForm = ({projectId}:Props) => {
    const trpc = useTRPC();
    const queryCLient = useQueryClient()
    const [isFocused, setIsFocused] = useState(false);
    const router = useRouter();
    
    const {data:usageData} = useQuery(trpc.usages.getUsageStatus.queryOptions())
    const showUsage = !!usageData;

    const form  = useForm<z.infer<typeof formSchema>>({
      resolver:zodResolver(formSchema),
      defaultValues:{
        value:""
      }
    });

    const onSubmit = async (input: z.infer<typeof formSchema>) =>{
      await createMessage.mutateAsync({value:input.value, projectId:projectId})

    }

    const createMessage = useMutation(trpc.messages.create.mutationOptions({
      onSuccess:(data) =>{
        form.reset();
        queryCLient.invalidateQueries(
          trpc.messages.getMany.queryOptions({projectId})
        )
        // TODO: Invalidate usage Status
        queryCLient.invalidateQueries(
          trpc.usages.getUsageStatus.queryOptions()
        )
      },
      onError:(err) =>{
        // TODO: Redirect to pricing page
        if(err.data?.code === 'TOO_MANY_REQUESTS'){
          toast.error("You have exceeded your usage limit. Please try again later.");
          router.push('/pricing');
          form.reset();
          return;
        }else{
          toast.error(err.message);
        }
      }
    }))
    const isPending = createMessage.isPending;
    const isBtnDisabled = isPending || !form.formState.isValid;
    


    return ( 
      <Form {...form}>
        {showUsage && ( <Usage points={usageData.remainingPoints} msBeforeNext={usageData.msBeforeNext} /> )}
        <form 
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn('relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all',
            isFocused && "shadow-xs",
            showUsage && "rounded-l-none"
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
        <div className='flex gap-2 justify-between items-end pt-2'>
          <div className='text-[10px] text-muted-foreground font-mono'>
            <kbd className='ml-auto pointer-events-none inline-flex h-5  select-none items-center gap-1 
              rounded border bg-muted px-1.5 font-mono text-[10px] font-medium'
            >
              <span>&#8984;</span>Enter
            </kbd>
            &nbsp; to submit
          </div>
          <Button disabled={isBtnDisabled} className={cn('size-8 rounded-full', isBtnDisabled && "bg-muted-foreground border")}>
            {isPending ?(
              <Loader2Icon className='size-4 animate-spin' />
            ): (
            <ArrowUpIcon />
            )}
          </Button>
        </div>
        </form>
      </Form>
     );
}
 
export default MessageForm;