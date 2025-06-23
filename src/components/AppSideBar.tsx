import { getUser } from "@/auth/server"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
  } from "@/components/ui/sidebar"
import { prisma } from "@/db/prisma";
import { Notes } from "@prisma/client";
import Link from "next/link";
import SidebarGroupContent from "./SidebarGroupContent";
  
  export async function AppSidebar() {

    const user=await getUser();
    let notes:Notes[]=[];

    if(user){
        notes=await prisma.notes.findMany({
            where:{
                authId:user.id,
            },
            orderBy:{
                updatedAt:"desc"
            }
        })
    }

    return (
      <Sidebar>
        {/* <SidebarHeader /> */}
        <SidebarContent className="custom-scroll">
            <SidebarGroup>
                <SidebarGroupLabel className="text-lg text-center  dark:text-red-200">{user?"Your Notes":
                    <p>
                        <Link href={"/login"} className="text-blue-500 hover:underline">Login</Link> to see your notes
                    </p>}
                </SidebarGroupLabel>
                {user && <SidebarGroupContent notes={notes}/>}
            </SidebarGroup>
        </SidebarContent>

      </Sidebar>
    )
  }
  