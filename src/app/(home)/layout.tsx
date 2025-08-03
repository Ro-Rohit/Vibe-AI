import Navbar from "@/modules/home/ui/components/navbar";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children}: LayoutProps) => {
    return ( 
        <main className="flex flex-col min-h-screen">
            <Navbar />
            <div className="absolute inset-0 -z-10 h-full bg-background w-full 
                dark:bg-[radial-gradient(#393e4a_1px,transparent_1px)]
                bg-[radial-gradient(#dadde2_1px, transparent_1px)] [background-size:2rem_2rem]" 
            />
            <div className="flex-1 flex-col flex px-4 pb-4">
                {children}
            </div>

        </main>
     );
}
 
export default Layout;