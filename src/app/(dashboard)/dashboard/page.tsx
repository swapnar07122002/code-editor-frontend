"use client";
import { API_URL } from "@/config/config";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import CreateProject from "./_component/CreateProject";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

const DashboardPage = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setisLoading] = useState(false);

  const router = useRouter();

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("Are you sure you want to delete this project?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/api/projects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete project");

      
      setProjects(prev => prev.filter(p => p.id !== id));

      // notify sidebar
      window.dispatchEvent(new Event("projectDeleted")); 
      
      toast.success("Project deleted successfully");

    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const fetchData = async () => {
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

      const response = await fetch(`${API_URL}/api/projects/user/${ownerId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch user projects");

      const data = await response.json();
      console.log("projects data: ", data);
      setProjects(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setisLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {isLoading ? (
        <p className="my-4 w-fit mx-auto">Loading...</p>
      ) : !(Array.isArray(projects) && projects.length > 0) ? (
        <div className="flex flex-col justify-center items-center min-h-screen">
          <Image
            alt={"Create project"}
            src={"/project.svg"}
            width={300}
            height={300}
          />
          <p className="text-gray-500 my-4">
            Create project effortlessly with our intuitive editor.{" "}
          </p>
          <CreateProject buttonVariant="default" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 p-4 lg:p-6">
          {projects.map((item) => {
            return (
              <Card
                key={item.id}
                className="cursor-pointer overflow-hidden group max-h-60 relative"
                onClick={() => router.push(`/editor/${item.id}`)}
              >
                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); 
                    handleDelete(item.id);
                  }}
                  className="absolute top-3 right-3 z-10 p-1.5 rounded-md bg-red-100 hover:bg-red-200 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>

                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                </CardHeader>
                <CardContent className="min-h-36">
                  <div className="border rounded-lg min-h-60 overflow-hidden top-15 group-hover:top-4 transition-all relative shadow drop-shadow-2xl">
                    <iframe
                      className="w-full h-full"
                      src={`${API_URL}/api/files/serve/${item.id}/index.html`}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
