"use client";
import React, { useEffect, useRef, useState } from "react";
import { useEditorContext } from "../_provider/EditorProvider";
import * as motion from "motion/react-client";
import { Resizable } from "re-resizable";
import { ExternalLink, RotateCw, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useParams, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "@/config/config";
import { toast } from "sonner";

const BrowerRunCode = ({ children }: { children: React.ReactNode }) => {
  const { openBrowser, setOpenBrowser } = useEditorContext();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState(false);

  const searchParams = useSearchParams();
  const fileName = searchParams.get("file");

  const [input, setInput] = useState("");
  const { projectId } = useParams();

  const [runTrigger, setRunTrigger] = useState(0);

  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      toast.error("Session expired. Please login again.");
      setTimeout(() => (window.location.href = "/"), 700);
    }
  }, [token]);

  useEffect(() => {
    setInput("index.html");
  }, []);

  let userId = "";
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      userId = decoded?.sub ?? "";
    } catch (err) {
      console.error("Invalid token", err);
    }
  }

  const handleMouseDown = () => setDrag(true);
  const handleMouseUp = () => setDrag(false);

  const handleRun = () => {
    setRunTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    if (openBrowser && input) {
      handleRun();
    }
  }, [openBrowser, input]);

  return (
    <div ref={containerRef}>
      {children}

      {openBrowser && (
        <motion.div
          drag={drag}
          dragConstraints={containerRef}
          dragElastic={0.2}
          className="absolute right-2 top-0 z-50"
        >
          <Resizable className="min-h-56 min-w-80 pb-2 shadow-lg overflow-clip rounded-sm z-50 bg-white">
            {/* header */}
            <div
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              className="bg-primary h-7 flex items-center cursor-grab px-1"
            >
              <X
                className="ml-auto cursor-pointer"
                onClick={() => setOpenBrowser(false)}
              />
            </div>

            <div className="relative">
              <Input
                className="h-8 rounded-t-none text-slate-600 pl-9 pr-9"
                value="index.html"
                readOnly
              />

              <RotateCw
                size={16}
                className="absolute top-2 left-2 cursor-pointer hover:text-primary"
                onClick={handleRun}
              />

              <Link
                href={`/browser/${userId}/${projectId}/${input}`}
                target="_blank"
              >
                <ExternalLink className="absolute top-2 right-2 cursor-pointer hover:text-primary" />
              </Link>
            </div>

            {/* iframe */}
            <div className="h-full w-full">
              {input && (
                <iframe
                  key={runTrigger}
                  className="w-full h-full min-h-full min-w-full"
                  src={`${API_URL}/api/files/serve/${projectId}/index.html?t=${runTrigger}`}
                />
              )}
            </div>
          </Resizable>
        </motion.div>
      )}
    </div>
  );
};

export default BrowerRunCode;
