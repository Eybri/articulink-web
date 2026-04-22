"use client";

import React, { useState, useEffect } from "react";
import { Menu, Settings, User, LogOut, ChevronDown } from "lucide-react";
import { getUser, logout } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

interface HeaderProps {
  currentDrawerWidth: number;
  handleDrawerToggle: () => void;
  title?: string;
  user?: any;
}

export default function Header({
  currentDrawerWidth,
  handleDrawerToggle,
  title = "Dashboard Overview",
  user: propUser,
}: HeaderProps) {
  const [user, setUser] = useState(propUser);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    if (propUser) {
      setUser(propUser);
    } else {
      const storedUser = getUser();
      if (storedUser) {
        setUser(storedUser);
      }
    }
  }, [propUser]);

  const getUserInitials = () => {
    if (!user) return "A";
    if (user.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "A";
  };

  const getUserDisplayName = () => {
    if (!user) return "Admin User";
    if (user.username) return user.username;
    if (user.email) return user.email.split("@")[0];
    return "Admin User";
  };

  return (
    <header
      className="fixed top-0 right-0 z-40 flex h-[70px] w-full items-center border-b border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 ease-in-out md:px-6 px-4"
      style={{
        width: mounted && typeof window !== 'undefined' && window.innerWidth >= 768 ? `calc(100% - ${currentDrawerWidth}px)` : '100%',
        marginLeft: mounted && typeof window !== 'undefined' && window.innerWidth >= 768 ? `${currentDrawerWidth}px` : '0',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-emerald-500 opacity-60" />
      
      <div className="flex w-full items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          onClick={handleDrawerToggle}
          className="mr-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition-all hover:bg-white/10 hover:scale-105 md:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Title Section */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 sm:flex">
            <User size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="truncate bg-gradient-to-br from-white to-indigo-400 bg-clip-text text-xl font-bold text-transparent md:text-2xl">
              {title}
            </h1>
            <span className="hidden text-[10px] font-medium uppercase tracking-wider text-white/50 sm:block">
              Welcome, {getUserDisplayName()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/settings")}
            className="hidden h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition-all hover:scale-110 hover:bg-white/10 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] md:flex"
            title="Settings"
          >
            <Settings size={20} className="transition-transform duration-500 hover:rotate-90" />
          </button>

          <div className="group relative">
            <div className="flex items-center gap-2 cursor-pointer transition-all hover:scale-105">
              <div className="relative h-11 w-11 overflow-hidden rounded-xl border-2 border-white/10 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 transition-all group-hover:border-indigo-400/50 group-hover:shadow-indigo-500/40">
                {user?.profile_pic ? (
                  <img
                    src={user.profile_pic}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                    {getUserInitials()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
