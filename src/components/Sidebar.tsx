"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Mic,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { logout, getUser } from "@/lib/api";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const drawerWidth = 280;
export const miniDrawerWidth = 80;

interface SidebarProps {
  user?: any;
  mobileOpen: boolean;
  sidebarMinimized: boolean;
  handleDrawerToggle: () => void;
  handleSidebarToggle: () => void;
  setUser: (user: any) => void;
}

export default function Sidebar({
  user: propUser,
  mobileOpen,
  sidebarMinimized,
  handleDrawerToggle,
  handleSidebarToggle,
  setUser,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setLocalUser] = useState(propUser);

  useEffect(() => {
    if (propUser) {
      setLocalUser(propUser);
    } else {
      const storedUser = getUser();
      if (storedUser) {
        setLocalUser(storedUser);
      }
    }
  }, [propUser]);

  const handleLogout = () => {
    logout();
    setUser(null);
    router.push("/login");
  };

  const menuItems = [
    { text: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/admin/dashboard" },
    { text: "Users", icon: <Users size={20} />, path: "/admin/users" },
    { text: "Pronunciation", icon: <Mic size={20} />, path: "/admin/pronunciation" },
    { text: "Settings", icon: <Settings size={20} />, path: "/admin/settings" },
  ];

  const currentDrawerWidth = sidebarMinimized ? miniDrawerWidth : drawerWidth;

  const getUserDisplayName = () => {
    if (!user) return "Admin";
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
    if (user.email) return user.email.split("@")[0];
    return "Admin";
  };

  const getUserEmail = () => user?.email || "admin@articulink.com";

  const getUserInitials = () => {
    if (!user) return "A";
    if (user.first_name && user.last_name) return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    if (user.email) return user.email[0].toUpperCase();
    return "A";
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-zinc-950 text-white">
      {/* Header */}
      <div className={cn(
        "flex h-[75px] items-center border-b border-white/5 bg-white/5 backdrop-blur-xl transition-all duration-300",
        sidebarMinimized ? "justify-center px-2" : "justify-between px-6"
      )}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 p-1 shadow-lg shadow-indigo-500/20">
             <img src="/images/whitelogo.png" alt="Logo" className="w-8 h-8 object-contain" />
          </div>
          {!sidebarMinimized && (
            <div className="flex flex-col">
              <span className="bg-gradient-to-br from-white to-indigo-400 bg-clip-text text-lg font-black tracking-tight text-transparent">
                ArticuLink
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                Admin
              </span>
            </div>
          )}
        </div>
        
        {!sidebarMinimized && (
          <button
            onClick={handleSidebarToggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 transition-all hover:bg-indigo-500/20"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const active = pathname === item.path;
          return (
            <Link
              key={item.text}
              href={item.path}
              className={cn(
                "group flex h-12 items-center rounded-xl transition-all duration-300",
                sidebarMinimized ? "justify-center px-0" : "px-4",
                active 
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30" 
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className={cn(
                "transition-transform duration-300 group-hover:scale-110",
                active ? "text-white" : "text-indigo-400"
              )}>
                {item.icon}
              </div>
              {!sidebarMinimized && (
                <span className="ml-3 text-sm font-semibold tracking-wide">
                  {item.text}
                </span>
              )}
            </Link>
          );
        })}
        {sidebarMinimized && (
          <button
            onClick={handleSidebarToggle}
            className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 transition-all hover:bg-indigo-500/20 mt-4"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/5 p-4">
        <div className={cn(
          "flex items-center rounded-2xl bg-white/5 p-3 transition-all",
          sidebarMinimized ? "flex-col gap-3" : "gap-3"
        )}>
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/10 ring-2 ring-indigo-500/20">
            {user?.profile_pic ? (
              <img src={user.profile_pic} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-indigo-600 text-xs font-bold">
                {getUserInitials()}
              </div>
            )}
          </div>
          {!sidebarMinimized && (
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-bold text-white">
                {getUserDisplayName()}
              </span>
              <span className="truncate text-[11px] text-zinc-500">
                {getUserEmail()}
              </span>
            </div>
          )}
          {!sidebarMinimized ? (
            <button
              onClick={handleLogout}
              className="group flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 transition-all hover:bg-red-500 hover:text-white"
            >
              <LogOut size={16} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          ) : (
            <button
               onClick={handleLogout}
               className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 transition-all hover:bg-red-500 hover:text-white"
            >
               <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen transition-all duration-300 hidden md:block border-r border-white/5",
          sidebarMinimized ? "w-[80px]" : "w-[280px]"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden transition-opacity duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleDrawerToggle} />
        <aside className={cn(
          "absolute left-0 top-0 h-full w-[280px] transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {sidebarContent}
        </aside>
      </div>
    </>
  );
}
