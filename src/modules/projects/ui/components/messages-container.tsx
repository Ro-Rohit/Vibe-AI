import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import MessageCard from "./message-card";
import MessageForm from "./message-form";
import { useEffect, useRef } from "react";
import { Fragment } from "@/generated/prisma";
import MessageLoading from "./message-loading";

interface Props {
    projectId:string;
    activeFragment: Fragment | null,
    setActiveFragment: (fragment : Fragment | null) => void
}

const MessagesContainer = ({projectId, setActiveFragment, activeFragment}: Props) => {
    const bottomRef = useRef<HTMLDivElement>(null);
    const trpc  = useTRPC();
    const lastAssistantMessRef = useRef<string | null>(null);
    const {data:messages} = useSuspenseQuery(
        trpc.messages.getMany.queryOptions({projectId}, {
            refetchInterval: 5000,
        }))

    useEffect(() =>{
        const lastAssistantMessage = messages.findLast((msg) => msg.role === "ASSISTANT");
        if(lastAssistantMessage?.fragment && lastAssistantMessRef.current !== lastAssistantMessage.id){
            lastAssistantMessRef.current = lastAssistantMessage.id;
            setActiveFragment(lastAssistantMessage.fragment);
        }
    }, [messages, setActiveFragment])

    useEffect(() =>{
        bottomRef.current?.scrollIntoView();
    }, [messages.length])

    const lastMessage = messages[messages.length -1];
    const isLastMessageUser = lastMessage.role === "USER";

    return (
        <div className="flex flex-col min-h-0 flex-1">
            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="pt-2 pr-1">
                    {messages.map((message) => (
                        <MessageCard 
                            key={message.id} 
                            content={message.content}
                            role={message.role}
                            type={message.type}
                            fragment={message.fragment}
                            createdAt={message.createdAt}
                            isActiveFragment={activeFragment?.id === message.fragment?.id}
                            onFragmentClick={() =>setActiveFragment(message.fragment)}
                        />
                    ))}
                    {isLastMessageUser && <MessageLoading />}
                    <div ref={bottomRef} />
                </div>
            </div>

            <div className="relative p-3 pt-1">
                <div className=" absolute -top-6 left-0 h-6 bg-gradient-to-b from-transparent to-background/70 pointer-events-none">
                </div>
                <MessageForm projectId={projectId} />
            </div>
        </div>
    );
}
 
export default MessagesContainer;