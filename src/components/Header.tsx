"use client";

import React, { useState, useEffect } from "react";
import { Menu, Settings, User, LogOut, ChevronDown } from "lucide-react";
import { getUser, logout } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";

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
      className="fixed top-0 right-0 z-40 flex h-[64px] w-full items-center border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl transition-all duration-300 ease-in-out md:px-6 px-4"
    >
      <div className="flex w-full items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          onClick={handleDrawerToggle}
          className="mr-4 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition-all hover:bg-white/10 md:hidden"
        >
          <Menu size={18} />
        </button>

        {/* Title Section */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="hidden h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 sm:flex">
            <User size={18} />
          </div>
          <div className="flex flex-col">
            <h1 className="truncate text-lg font-bold text-white md:text-xl tracking-tight">
              {title}
            </h1>
            <span className="hidden text-[10px] font-semibold uppercase tracking-widest text-white/40 sm:block">
              Welcome, {getUserDisplayName()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/settings")}
            className="hidden h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition-all hover:bg-white/10 hover:text-white md:flex"
            title="Settings"
          >
            <Settings size={18} className="transition-transform duration-500 hover:rotate-45" />
          </button>

          <div className="group relative">
            <div className="flex items-center gap-2 cursor-pointer transition-all">
              <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-white/10 bg-zinc-900 transition-all group-hover:border-indigo-500/50">
                {getImageUrl(user?.profile_pic) ? (
                  <img
                    src={getImageUrl(user?.profile_pic)}
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
