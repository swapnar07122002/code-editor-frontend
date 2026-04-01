'use client';
import React, { useEffect, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '@/config/config';

interface User {
  id: string;
  name: string;
  email: string;
  profile_image?: string;
}

interface DecodedToken {
  sub?: string;
  exp?: number;
  [key: string]: any;
}



const UserAvatar = () => {

  const [user,setUser] = useState<User | null>(null);

   useEffect(() => {
      const token = localStorage.getItem("token");
  
      if (!token) {
        window.location.href = "/"; // redirect to landing 
        return;
      }
  
      try {
        // Decode the token
        const decoded = jwtDecode<DecodedToken>(token);
        console.log("decode: ",decoded);
  
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
    <div>
      <Popover>
          <PopoverTrigger>
            <Avatar className="cursor-pointer w-10 h-10 drop-shadow">
              {user?.profile_image ? (
                <AvatarImage src={user.profile_image} alt={user.name} />
              ) : (
                // if user has no profile image
                <AvatarFallback>
                  {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
                </AvatarFallback>
              )}
            </Avatar>
          </PopoverTrigger>
          <PopoverContent>
            <p className="semi-bold py-2">{user ? user.name : ""}</p>
            <div className="p-[0.5px] bg-gray-200"></div>

            <Button variant={'destructive'} className="w-full mt-4" onClick={handleLogout}>Logout</Button>
          </PopoverContent>
        </Popover>
    </div>
  )
}

export default UserAvatar