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
import { cn, getImageUrl } from "@/lib/utils";

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
    <div className="flex h-full flex-col bg-gradient-to-b from-[#0B1D35] to-[#0F2847] text-white relative overflow-hidden">
      {/* Subtle decorative glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#1A4480]/20 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-24 h-24 bg-[#2A8FA0]/10 rounded-full blur-[50px] pointer-events-none" />

      {/* Header */}
      <div className={cn(
        "flex h-[64px] items-center border-b border-white/[0.06] transition-all duration-300 relative",
        sidebarMinimized ? "justify-center px-2" : "justify-between px-5"
      )}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src="/images/icon-white.png" alt="Logo" className="w-8 h-8 object-contain relative z-10" />
            <div className="absolute inset-0 bg-[#7DD3E8]/20 rounded-full blur-md" />
          </div>
          {!sidebarMinimized && (
            <div className="flex flex-col">
              <span className="text-[15px] font-bold tracking-tight text-white leading-none">
                ArticuLink
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#7DD3E8]/70 mt-0.5">
                Administration
              </span>
            </div>
          )}
        </div>
        
        {!sidebarMinimized && (
          <button
            onClick={handleSidebarToggle}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.06] text-white/40 transition-all hover:bg-white/[0.12] hover:text-white/70"
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* Section label */}
      {!sidebarMinimized && (
        <div className="px-5 pt-5 pb-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
            Navigation
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn("flex-1 space-y-1 px-3", sidebarMinimized ? "pt-4" : "pt-1")}>
        {menuItems.map((item) => {
          const active = pathname === item.path;
          return (
            <Link
              key={item.text}
              href={item.path}
              className={cn(
                "group relative flex h-10 items-center rounded-lg transition-all duration-200",
                sidebarMinimized ? "justify-center px-0" : "px-3 gap-3",
                active
                  ? "bg-white/[0.1] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                  : "text-white/50 hover:bg-white/[0.05] hover:text-white/80"
              )}
            >
              {/* Active indicator bar */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#7DD3E8]" />
              )}
              <div className={cn(
                "shrink-0 transition-colors duration-200",
                active ? "text-[#7DD3E8]" : "text-white/40 group-hover:text-[#7DD3E8]/70"
              )}>
                {item.icon}
              </div>
              {!sidebarMinimized && (
                <span className="text-sm font-medium">
                  {item.text}
                </span>
              )}
            </Link>
          );
        })}
        {sidebarMinimized && (
          <button
            onClick={handleSidebarToggle}
            className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-white/30 transition-all hover:bg-white/[0.12] hover:text-white/60 mt-4"
          >
            <ChevronRight size={14} />
          </button>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] p-3">
        <div className={cn(
          "flex items-center rounded-lg bg-white/[0.04] p-2.5 transition-all",
          sidebarMinimized ? "flex-col gap-2.5" : "gap-3"
        )}>
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-white/10 ring-offset-1 ring-offset-[#0F2847]">
            {getImageUrl(user?.profile_pic) ? (
              <img src={getImageUrl(user.profile_pic)} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#1A4480] text-[10px] font-bold text-white">
                {getUserInitials()}
              </div>
            )}
          </div>
          {!sidebarMinimized && (
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-xs font-semibold text-white/90">
                {getUserDisplayName()}
              </span>
              <span className="truncate text-[10px] text-white/30">
                {getUserEmail()}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              "flex shrink-0 items-center justify-center rounded-md transition-all",
              sidebarMinimized
                ? "h-8 w-8 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"
                : "h-7 w-7 bg-white/[0.06] text-white/30 hover:bg-red-500/20 hover:text-red-400"
            )}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen transition-all duration-300 hidden md:block shadow-[4px_0_24px_-4px_rgba(0,0,0,0.2)]",
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
          "absolute left-0 top-0 h-full w-[280px] transition-transform duration-300 shadow-[4px_0_32px_-4px_rgba(0,0,0,0.4)]",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {sidebarContent}
        </aside>
      </div>
    </>
  );
}
