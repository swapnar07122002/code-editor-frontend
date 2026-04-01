"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { API_URL } from "@/config/config";
import { getFileIcon } from "@/lib/getFileIcon";
import { jwtDecode } from "jwt-decode";
import { FilePlus } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

type TProjectFile = {
  id: number;
  name: string;
  extension: string;
  projectId: number;
};

const EditorSidebar = () => {
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { projectId } = useParams();
  const [openCreateFile, setOpenCreateFile] = useState(false);
  const [files, setFiles] = useState<TProjectFile[]>([]);
  const router = useRouter();
  const [hoveredFileId, setHoveredFileId] = useState<number | null>(null);

  const handleDeleteFile = async (id: number) => {
    const confirmDelete = confirm("Delete this file?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/api/files/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete file");

      setFiles((prev) => prev.filter((file) => file.id !== id));

      toast.success("File deleted");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const fetchFiles = async () => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Session expired. Please login again.");
        window.location.href = "/";
        return;
      }

      const response = await fetch(
        `${API_URL}/api/files/project/${projectId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }

      const data = await response.json();

      setFiles(data);
    } catch (error: any) {
      toast.error(error.message || "Error loading files");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleCreateFile = async () => {
    if (!fileName.trim()) {
      return alert("Please enter a file name");
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Session expired. Please login again.");
        window.location.href = "/";
        return;
      }

      const decoded = jwtDecode(token);
      // console.log(decoded);
      const ownerId = decoded.sub;

      const response = await fetch(`${API_URL}/api/files`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: fileName,
          ownerId,
          projectId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create file");
      }

      const data = await response.json();
      // console.log('File created:', data);

      setFileName("");

      toast.success(data.message);

      setOpenCreateFile(false);

      fetchFiles();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sidebar className="h-[calc(100vh-3.5rem)] max-h-[calc(100vh-3.5rem)] top-14">
      <SidebarHeader className="bg-primary/10 flex flex-row items-center py-1">
        <div className="">
          <p>Files</p>
        </div>
        <div className="ml-auto">
          <Dialog open={openCreateFile} onOpenChange={setOpenCreateFile}>
            <DialogTrigger asChild>
              <Button size={"icon"} variant={"ghost"}>
                <FilePlus />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Create File</DialogTitle>
              <Input
                disabled={isLoading}
                placeholder="Enter file name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
              <Button disabled={isLoading} onClick={handleCreateFile}>
                {isLoading ? "Creating..." : "Create File"}
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {isLoading ? (
          <p className="text-gray-400 py-4 mx-auto w-fit">Loading...</p>
        ) : files.length < 1 ? (
          <p className="text-gray-400 py-4 mx-auto w-fit">No File</p>
        ) : (
          <SidebarMenu className="py-4">
            {files.map((file) => {
              return (
                <SidebarMenuItem key={file.id}>
                  <div
                    className="relative w-full flex items-center hover:bg-gray-100 rounded-md"
                    onMouseEnter={() => setHoveredFileId(file.id)}
                    onMouseLeave={() => setHoveredFileId(null)}
                  >
                    <SidebarMenuButton
                      className="cursor-pointer w-full pr-10"
                      onClick={() =>
                        router.push(`/editor/${projectId}?file=${file.name}`)
                      }
                    >
                      <div className="w-4 h-4">
                        <Image
                          alt={file.name}
                          width={18}
                          height={18}
                          src={getFileIcon(file.extension)}
                        />
                      </div>
                      <p>{file.name}</p>
                    </SidebarMenuButton>

                    {/* delete button */}
                    {hoveredFileId === file.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(file.id);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 
                        z-10 p-2 rounded-md hover:bg-gray-200 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                  </div>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export default EditorSidebar;
