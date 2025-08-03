import Image from "next/image";
import { useEffect, useState } from "react";
export const ShimmerMessages = () => {
    const loadingMessages = [
        'Assisting with your request...',
        'Building your website...',
        'Creating Components...',
        'Optimizing code...',
        'Adding final touches...',
        'Almost there...',
        'Finalizing your project...',
    ]
    const [currentLoadingMessageIdx, setCurrentLoadingMessageIdx] = useState(0);
    useEffect(() =>{
        const interval = setInterval(() =>{
            setCurrentLoadingMessageIdx((prev) => (prev +1) % loadingMessages.length)
        }, 2000)
        return () => clearInterval(interval);
    },[loadingMessages.length])
    return ( 
        <div className="flex items-center gap-2">
            <span className="text-base text-muted-foreground animate-pulse">
                {loadingMessages[currentLoadingMessageIdx]}
            </span>
        </div>
     );
}
 
const MessageLoading = () => {
    return ( 
        <div className="flex flex-col px-2 group pb-4">
            <div className="flex items-center gap-2 pl-2 mb-2">
                <Image src={'/logo.svg'}  width={18} height={18} alt="Vibe" className="shrink-0" />
                <span className="text-sm font-medium">Vibe</span>
            </div>
            <div className="pl-8.5 flex flex-col gap-y-4">
                <ShimmerMessages />
            </div>
        </div>
     );
}
 
export default MessageLoading;