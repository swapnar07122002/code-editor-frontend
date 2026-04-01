"use client";
import Logo from "@/components/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { API_URL } from "@/config/config";
import { cn } from "@/lib/utils";
import { jwtDecode } from "jwt-decode";
import { FileIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import CreateProject from "./CreateProject";
import UserAvatar from "@/components/UserAvatar";

interface DecodedToken {
  sub?: string;
  exp?: number;
  [key: string]: any;
}

const DashboardSidebar = () => {
  const pathname = usePathname();
  const [recentProjects, setRecentProjects] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      // Decode the token
      const decoded = jwtDecode<DecodedToken>(token);
      // console.log("decode: ",decoded);

      const userId = decoded.sub;
      // console.log(userId);

      if (!userId) return;

      // fetch recent projects
      const fetchRecentProject = async () => {
        const response = await fetch(
          `${API_URL}/api/projects/user/${userId}/recent`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) throw new Error("Failed to fetch recent projects");

        const data = await response.json();
        // console.log("Fetched recent projects:", data);
        setRecentProjects(data);
      };

      fetchRecentProject();

      // delete event
      const handleUpdate = () => fetchRecentProject();
      window.addEventListener("projectDeleted", handleUpdate);

      return () => {
        window.removeEventListener("projectDeleted", handleUpdate);
      };
      
    } catch (error) {
      console.error("Error decoding recent projects", error);
    }
  }, []);

  return (
    <Sidebar className="overflow-hidden">
      <SidebarHeader className="px-4">
        <Logo w={100} />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <CreateProject />

        <div className="px-2 w-full">
          <SidebarMenu>
            <SidebarMenuItem>
              <Link
                href={"/dashboard"}
                className={cn(
                  "w-full min-w-full block px-2 rounded-md",
                  pathname === "/dashboard" && "bg-slate-100",
                )}
              >
                Dashboard
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Recent Project</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {recentProjects.map((item: any) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <Link href={`/editor/${item.id}`}>
                      <FileIcon />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="lg:hidden">
        <UserAvatar />
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
