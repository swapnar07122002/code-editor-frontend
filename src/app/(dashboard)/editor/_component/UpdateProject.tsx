"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { API_URL } from "@/config/config";
import { Pencil } from "lucide-react";

type TUpdateProject = {
  projectId: number;
  name: string;
  onUpdated?: (newName: string) => void;
};

const UpdateProject = ({ projectId, name, onUpdated }: TUpdateProject) => {
  const [projectName, setProjectName] = useState<string>(name);
  const [isLoading, setisLoading] = useState(false);
  const [open, setOpen] = useState(false);
  

  const handleUpdateProject = async (e: any) => {
    e.preventDefault();

    if (!projectName) {
      toast.error("Project name is required");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Session expired. Please login again.");
      window.location.href = "/";
      return;
    }

    try {
      setisLoading(true);

      const response = await fetch(`${API_URL}/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: projectName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update project");
      }

      toast.success(data.message);
      
      if (onUpdated) {
        onUpdated(data.project.name);
      }

      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setisLoading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"ghost"}
          size={"icon"}
          className="invisible group-hover:visible"
        >
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <form className="my-4 grid gap-4">
            <Input
              disabled={isLoading}
              placeholder="Enter your project name"
              value={projectName ?? ""}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <Button disabled={isLoading} onClick={handleUpdateProject}>
              {isLoading ? "Loading..." : "Update Project"}
            </Button>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProject;
