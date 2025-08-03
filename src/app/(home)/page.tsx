import ProjectForm from "@/modules/home/ui/components/project-form";
import ProjectList from "@/modules/home/ui/components/project-list";
import Image from "next/image";

const Page = () => {
  return ( 
    <div className="flex flex-col min-w-5xl mx-auto w-full">
      <section className="space-y-6 py-[16vh] 2xl:py-48">
        <div className="flex flex-col items-center">
          <Image
            src="/logo.svg"
            alt="Vibe"
            width={50}
            height={50}
            className="hidden md:block"
          />
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center">
          Build something amazing with Vibe
        </h1>
        <p className="text-lg md:text-xl text-center text-muted-foreground">
          Create apps and websites by Chatting with AI.
        </p>
        <div className="max-w-3xl mx-auto w-full">
          <ProjectForm />
        </div>

        <div>
          <ProjectList  />
        </div>

      </section>

    </div>
  );
};

export default Page;
