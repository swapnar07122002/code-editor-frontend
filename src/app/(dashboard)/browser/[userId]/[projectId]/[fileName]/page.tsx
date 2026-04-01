"use client";
import { API_URL } from "@/config/config";
import { useParams } from "next/navigation";
import React from "react";

const BrowserPage = () => {
  const { userId, projectId, fileName } = useParams();

  console.log("browser page", userId, projectId, fileName);

  return (
    <iframe
      className="w-full h-full min-h-screen min-w-screen"
      src={`${API_URL}/api/files/serve/${projectId}/${fileName}`}
    />
  );
};

export default BrowserPage;