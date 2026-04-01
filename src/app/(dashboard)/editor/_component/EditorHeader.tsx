"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import UserAvatar from "@/components/UserAvatar";
import { API_URL } from "@/config/config";
import { jwtDecode } from "jwt-decode";
import { AppWindow, ArrowLeft, Database, Pencil, PlayCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import UpdateProject from "./UpdateProject";
import { useEditorContext } from "../_provider/EditorProvider";
import { cn } from "@/lib/utils";

const EditorHeader = () => {
  const router = useRouter();
  const { projectId } = useParams();

  const [projectName, setProjectName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    isLoading: editorAutoSaveLoading,
    openBrowser,
    setOpenBrowser,
  } = useEditorContext();

  const fetchData = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Session expired. Please login again.");
      window.location.href = "/";
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        `${API_URL}/api/projects/${projectId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch project name");

      const data = await response.json();
      setProjectName(data.name);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchData();
  }, [!!projectId]);

  return (
    <header className="bg-white h-14 sticky top-0 z-40 flex items-center px-4">
      {/* left side */}
      <div className="flex items-center max-w-sm gap-4">
        <Button
          onClick={() => router.push("/dashboard")}
          className="cursor-pointer"
        >
          <ArrowLeft />
        </Button>

        <h2 className="font-semibold relative">
          {isLoading ? (
            <span className="text-slate-400">Loading...</span>
          ) : (
            <div className="flex items-center gap-1 group">
              <span>{projectName}</span>

              <UpdateProject
                name={projectName}
                projectId={Number(projectId)}
                onUpdated={(newName) => setProjectName(newName)}
              />
            </div>
          )}
        </h2>

        <div
          className={cn(
            "flex items-center gap-1 opacity-100",
            editorAutoSaveLoading && "animate-pulse opacity-30"
          )}
        >
          <Database size={16} />
          {editorAutoSaveLoading ? "Saving..." : "Saved"}
        </div>
      </div>

      {/* right side */}
      <div className="ml-auto w-fit flex items-center gap-6">
        <div
          onClick={() => setOpenBrowser(!openBrowser)}
          className={cn(
            "p-1 cursor-pointer rounded-full drop-shadow-2xl",
            openBrowser && "text-primary"
          )}
        >
          <AppWindow />
        </div>

        <UserAvatar />
      </div>
    </header>
  );
};

export default EditorHeader;