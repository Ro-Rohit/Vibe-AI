import { TreeItem } from "@/types";

interface Props{
data: TreeItem[],
value?: string | null,
onSelect?: (value:string) => void, 
}

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react";
import { Collapsible } from "@radix-ui/react-collapsible";
import { CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

const TreeView = ({data, value, onSelect}:Props) => {
    return ( 
    <SidebarProvider>
        <Sidebar collapsible="none" className="w-full">
        <SidebarHeader />
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {data.map((item, idx) =>(
                            <Tree 
                                key={idx} 
                                item={item} 
                                selectedValue={value} 
                                onSelect={onSelect} 
                                parentPath="" 
                            />
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
        </Sidebar>
    </SidebarProvider>
     );
}
 
export default TreeView;

interface TreeProps {
    item: TreeItem,
    selectedValue?:string | null,
    onSelect?: (value:string) => void,
    parentPath:string,
}

const Tree = ({item, selectedValue, parentPath, onSelect}: TreeProps) =>{
    const [name, ...items] = Array.isArray(item) ? item : [item];
    const currentPath = parentPath ?   `${parentPath}/${name}` : name;
    if(!items.length){
        //It's a file
        const isSelected = selectedValue === currentPath;
        return(
            <SidebarMenuButton 
                isActive={isSelected} 
                className="data-[active=true]:bg-transparent"
                onClick={() => onSelect?.(currentPath)}
            >
                <FileIcon />
                <span className=" truncate">{name}</span>
            </SidebarMenuButton>
        )
    }

    // It's a folder
    return(
        <SidebarMenuItem>
            <Collapsible 
                className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
                defaultOpen
            >
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                        <ChevronRightIcon className="transition-transform" />
                        <FolderIcon />
                        <span className=" truncate">{name}</span>
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {items.map((subItem, idx) => (
                                <Tree 
                                    key={idx} 
                                    item={subItem} 
                                    selectedValue={selectedValue} 
                                    onSelect={onSelect} 
                                    parentPath={currentPath}
                                />
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuItem>
    )
}