"use client";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { basicSetup, EditorView } from "codemirror";
import { EditorState } from "@codemirror/state";
import { html } from "@codemirror/lang-html";
import { javascript, javascriptLanguage } from "@codemirror/lang-javascript";
import { css, cssLanguage } from "@codemirror/lang-css";
import { toast } from "sonner";
import { API_URL } from "@/config/config";
import { jwtDecode } from "jwt-decode";
import { useEditorContext } from "../_provider/EditorProvider";
import debounce from "@/lib/debounce";

const CodeEditor = () => {
  const searchParams = useSearchParams();
  const file = searchParams.get("file");

  const [element, setElement] = useState<HTMLElement | null>(null);
  const { projectId } = useParams();
  const [content, setContent] = useState<string>();
  const [fileId, setFileId] = useState<number | null>(null);
  const { setIsLoading } = useEditorContext();

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    setElement(node);
  }, []);

  
  useEffect(() => {
    if (!file) {
      setElement(null);
      setContent(undefined);
      setFileId(null);
    }
  }, [file]);

  const fetchData = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Session expired. Please login again.");
      window.location.href = "/";
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/files/${projectId}/${file}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to open file");

      const data = await response.json();

      setContent(data.content);
      setFileId(data.id);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // fetch file
  useEffect(() => {
    if (file && projectId) {
      fetchData();
    }
  }, [file, projectId]);

  // autosave
  const autosave = async (newContent: string) => {
    const token = localStorage.getItem("token");

    if (!token || !fileId) return;

    try {
      setIsLoading(true);

      await fetch(`${API_URL}/api/files/${fileId}/content`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newContent }),
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const autosaveDebounce = debounce((doc: string) => {
    autosave(doc);
  }, 1000);

  const extensionArray = file?.split(".") || [];
  const extension = extensionArray[extensionArray.length - 1];

  
  useEffect(() => {
    if (!element || !file || content === undefined) return;

    const state = EditorState.create({
      doc: content,
      extensions: [
        basicSetup,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            autosaveDebounce(update.state.doc.toString());
          }
        }),
        extension === "js"
          ? javascript()
          : extension === "css"
          ? css()
          : html({
              autoCloseTags: true,
              selfClosingTags: true,
              nestedLanguages: [
                { tag: "style", parser: cssLanguage.parser },
                { tag: "script", parser: javascriptLanguage.parser },
              ],
            }),
      ],
    });

    const view = new EditorView({
      state,
      parent: element,
    });

    return () => {
      view.destroy(); 
    };
  }, [file, element, content]);

  return (
    <div className="p-2 pb-10">
      {!file ? (
        <div className="flex items-center justify-center flex-col bg-white rounded-md p-4 pb-7">
          <Image
            src={"/editor file.svg"}
            width={320}
            height={320}
            alt="editor"
          />
          <p className="text-slate-400">No file is open</p>
        </div>
      ) : (
        <div
          key={file || "empty"} 
          className="relative flex-1 h-full min-h-[calc(100vh-3.5rem)] bg-white w-full"
          ref={ref}
        />
      )}
    </div>
  );
};

export default CodeEditor;