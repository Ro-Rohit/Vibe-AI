"use client";
import { useEffect, useState } from "react";

const useScroll = ({threshold}: {threshold:number}) => {
    const [scrolled, setScrolled] = useState(false)
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > threshold);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [])
    return {scrolled};
}
 
export default useScroll;