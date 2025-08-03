"use client";

import { Button } from "@/components/ui/button";
import UserControl from "@/components/user-control";
import useScroll from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";
import { SignedIn } from "@clerk/clerk-react";
import { SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
    const {scrolled} = useScroll({threshold: 50});
    return ( 
        <nav className={cn("p-4 z-[5] fixed top-0 left-0 right-0  transition-all duration-300 ease-in-out",
            scrolled ? "bg-background shadow  border-border" : "bg-transparent border-transparent"
        )}>
            <div className="max-w-5xl mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <Image src={'/logo.svg'} alt="Vibe Logo" height={24} width={24} />
                    <span className="text-lg font-semibold">Vibe</span>
                </Link>
                <SignedOut>
                    <div className="flex items-center space-x-4">
                        <SignUpButton>
                            <Button variant="outline" size={'sm'}>
                                Sign Up
                            </Button>
                        </SignUpButton>
                        <SignInButton>
                            <Button  size={'sm'}>
                                Sign In
                            </Button>
                        </SignInButton>
                    </div>
                </SignedOut>
                <SignedIn>
                    <UserControl showName />
                </SignedIn>

            </div>
        </nav>
     );
}
 
export default Navbar;