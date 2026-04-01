"use client";
import Logo from "@/components/Logo";
import { API_URL } from "@/config/config";
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger, SidebarTriggerDashboard } from "@/components/ui/sidebar";
import UserAvatar from "@/components/UserAvatar";

interface DecodedToken {
  sub?: string;
  exp?: number;
  [key: string]: any;
}

interface User {
  id: string;
  name: string;
  email: string;
  profile_image?: string;
}

const DashboardHeader = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/"; // redirect to landing 
      return;
    }

    try {
      // Decode the token
      const decoded = jwtDecode<DecodedToken>(token);
      // console.log("decode: ",decoded);

      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
         console.log("Token expired"); 
         localStorage.removeItem("token"); 
         window.location.href = "/"; 
      }


      const userId = decoded.sub;
      // console.log(userId);

      if (!userId) return;

      const fetchUser = async () => {
        const response = await fetch(`${API_URL}/api/users/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user");

        const data = await response.json();
        console.log("Fetched user:", data);
        setUser(data);
      };

      fetchUser();
    } catch (error) {
      console.error("Error decoding  user details", error);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  }

  return (
    <div className="h-14 bg-white flex items-center px-4 sticky top-0 z-40">
      <div className="md:hidden">
        <Logo w={80} />
      </div>

      <div className="hidden md:block">
        <span className="font-semibold">Hi, Welcome</span>{" "}
        {user ? user.name : ""}
      </div>

      <div className="ml-auto hidden md:block">
        <UserAvatar />
      </div>

      <div className="md:hidden ml-auto">
        <SidebarTriggerDashboard />
      </div>
    </div>
  );
};

export default DashboardHeader;
