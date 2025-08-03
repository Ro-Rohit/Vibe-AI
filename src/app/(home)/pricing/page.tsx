"use client";
import { useCurrentTheme } from '@/hooks/use-current-theme';
import {PricingTable} from '@clerk/nextjs'
import { dark } from '@clerk/themes';
import Image from 'next/image';
const PricingPage = () => {
    const currentTheme = useCurrentTheme()
    return ( 
        <div className='flex flex-col max-w-3xl mx-auto w-full'>
            <section className='space-y-6 pt-[16vh] 2xl:pt-48'>
                <div className='flex flex-col items-center'>
                    <Image src={'/logo.svg'} height={50} width={50} alt='Vibe logo' className='hidden md:block' />
                </div>
                <h1 className='text-xl md:text-3xl font-bold text-center'>Pricing</h1>
                <p className='text-muted-foreground text-center text-sm md:text-base'>
                    Choose a plan that fits your needs. Vibe offers flexible pricing options to help you build and scale your projects efficiently.
                </p>
                <PricingTable appearance={{
                    theme: currentTheme === 'dark' ? dark : undefined,
                    elements:{
                        pricingTableCard: 'border! shadow-none! rounded-lg!',
                    }
                }} />
            </section>
        </div>
     );
}
 
export default PricingPage;