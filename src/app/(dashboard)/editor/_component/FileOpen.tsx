"use client";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { X } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useTransition } from "react";

const FileOpen = () => {
  const searchParams = useSearchParams();
  const fileName = searchParams.get("file");
  const router = useRouter();
  const { projectId } = useParams();

  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    startTransition(() => {
      router.replace(`/editor/${projectId}`); // 🔥 replace instead of push
    });
  };

  return (
    <div className="flex items-center gap-2 bg-primary/10 h-11 sticky top-14 z-50 backdrop-blur-1xl">
      <SidebarTrigger />

      {fileName && (
        <div className="flex items-center gap-1 bg-primary/5 px-2 py-1 border-b-2 border-primary rounded-sm">
          <p className="max-w-sm text-ellipsis line-clamp-1">
            {fileName}
          </p>

          <Button
            size="icon"
            variant="ghost"
            onClick={handleClose}
            disabled={isPending}
          >
            <X size={16} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileOpen;