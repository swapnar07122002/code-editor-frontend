"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { API_URL } from "@/config/config";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

type TCreateProject = {
  buttonVariant? : "outline" | "default"
}

const CreateProject = ({buttonVariant} : TCreateProject) => {

  const [projectName, setProjectName] = useState<string>("");
  const [isLoading, setisLoading] = useState(false);
  const router = useRouter();

  const handleCreateProject = async (e : any) => {
    e.preventDefault()

    if(!projectName) {
      toast.error("Project name is required");
    }

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Session expired. Please login again.");
      window.location.href = "/";
      return;
    }

    try {

      setisLoading(true);

      const decoded = jwtDecode(token);

      const ownerId = decoded.sub;


      const response = await fetch(`${API_URL}/api/projects/create/${ownerId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
           name: projectName 
        }),
      });

      const project = await response.json();

      if (!response.ok) {
        throw new Error(project.message || "Failed to create project");
      }

      toast.success(project.message);
      

      router.push(`/editor/${project.project.id}`);
      
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setisLoading(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild> 
        <Button variant={buttonVariant ?? 'outline'} className='my-4 mx-2'>Create Project</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <form className="my-4 grid gap-4">
            <Input disabled={isLoading} placeholder="Enter your project name" value={projectName ?? ""} onChange={(e) => setProjectName(e.target.value)}/>
            <Button disabled={isLoading} onClick={handleCreateProject}>
              {
                isLoading ? "Loading..." : "Create Project"
              }
            </Button>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProject;
