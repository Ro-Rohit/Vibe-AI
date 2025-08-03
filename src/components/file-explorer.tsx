import { useState, useCallback, useMemo, Fragment} from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Hint from "./hint";
import { Button } from "./ui/button";
import { CopyCheckIcon, CopyIcon } from "lucide-react";
import CodeView from "./code-view";
import { convertFilesToTreeItems } from "@/lib/utils";
import TreeView from "./tree-view";
import { toast } from "sonner";

type FileCollection = {[path:string]: string}
function getLanguageFromExtension(filename: string):string {
    const extension = filename.split(".").pop()?.toLowerCase();
    return extension || "text";
}
interface FileExplorerProps {
    files: FileCollection,
}


const FileExplorer = ({files}: FileExplorerProps) => {
    const [copied, setCopied] = useState(false);
    const [selectedFile, setSelectedFile] = useState<string| null>(() => {
        const filekeys = Object.keys(files);
        return filekeys.length >0 ? filekeys[0] : null;
    })

    const treeData = useMemo(() =>{
        return convertFilesToTreeItems(files)
    }, [files])

    const handleFileSelect = useCallback(( filePath:string) =>{
        const formattedPath = filePath.startsWith("/") ? filePath : `/${filePath}`;
        if(files[formattedPath]){
            setSelectedFile(formattedPath)
        }
    }, [files])

    const handleCopy = useCallback(() => {
        if (selectedFile && files[selectedFile]) {
            navigator.clipboard.writeText(files[selectedFile])
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
                    toast.success("File content copied to clipboard");
                })
                .catch((err) => console.error('Failed to copy text: ', err));
        }}, [selectedFile, files]);

    return ( 
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={30} minSize={30} className="bg-sidebar">
                <TreeView data={treeData} value={selectedFile} onSelect={handleFileSelect} />
            </ResizablePanel>
            <ResizableHandle withHandle className="hover:bg-primary transition-colors" />
            <ResizablePanel defaultSize={70} minSize={50}>
                {selectedFile && files[selectedFile] ? (
                    <div className="h-full w-full flex flex-col">
                        <div className="border-b bg-sidebar px-4 py-2 flex justify-between items-center gap-x-2">
                            <FileBreadcrumb filePath={selectedFile} />
                            <Hint text="Copy to clipboard" side="bottom">
                                <Button 
                                    className="ml-auto" 
                                    variant={'outline'} 
                                    size={'icon'} 
                                    disabled={copied} 
                                    onClick={handleCopy}
                                >
                                    {copied ? <CopyCheckIcon /> : <CopyIcon />}
                                </Button>
                            </Hint>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <CodeView 
                                lang={getLanguageFromExtension(selectedFile)} 
                                code={files[selectedFile]} 
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        Select a file to view it&apos;s content
                    </div>
                )}
            </ResizablePanel>
        </ResizablePanelGroup>
     );
}
 
export default FileExplorer;


interface FileBreadcrumbProps{
    filePath:string,
}
const FileBreadcrumb = ({filePath}:FileBreadcrumbProps) =>{
    const pathSegments = filePath.split('/');
    const maxSegements = 3;

    const renderBreadCrumbItems = () =>{
        if(pathSegments.length <= maxSegements){
            //show all segments if 3 or less
            return pathSegments.map((segment, idx) =>{
                const isLast = idx === pathSegments.length -1;
                return (
                    <Fragment key={idx}>
                        <BreadcrumbItem>
                            {
                                isLast ? (
                                    <BreadcrumbPage className="font-medium">
                                            {segment}
                                    </BreadcrumbPage>
                                ) :(
                                    <span className="text-muted-foreground">
                                        {segment}
                                    </span>
                                )
                            }
                        </BreadcrumbItem>
                        {!isLast && <BreadcrumbSeparator />}
                    </Fragment>
                    
                )
            })
        }else{
            const firstSegment = pathSegments[0];
            const lastSegment = pathSegments[pathSegments.length -1];
            return(
                <>
                    <BreadcrumbItem>
                        <span className=" text-muted-foreground">
                            {firstSegment}
                        </span>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbEllipsis />
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="font-medium">
                                {lastSegment}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                
                    </BreadcrumbItem>
                </>
            )
        }
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
            {renderBreadCrumbItems()}
            </BreadcrumbList>
        </Breadcrumb>
    )
    
}