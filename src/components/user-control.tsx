"use client";

import { useCurrentTheme } from "@/hooks/use-current-theme";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
interface UserControlProps {
    showName?: boolean;
}

const UserControl = ({showName}: UserControlProps) => {
    const currentTheme = useCurrentTheme();

    return ( 
        <UserButton
            showName={showName} 
            appearance={{
                baseTheme: currentTheme === "dark" ? dark : undefined,
                elements: {
                    userButtonTrigger: "rounded-md!",
                    userButtonAvatarBox: "rounded-md! size-8!",
                    userButtonBox: "rounded-md!",
                }}
            } 
        />

     );
}
 
export default UserControl;