"use client";

import React, { useState, useEffect } from "react";
import { Menu, Settings, User, LogOut, Bell, Search } from "lucide-react";
import { getUser, logout } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";
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

  const getPageLabel = () => {
    if (pathname?.includes("/dashboard")) return "Overview";
    if (pathname?.includes("/users")) return "User Management";
    if (pathname?.includes("/pronunciation")) return "Speech Analytics";
    if (pathname?.includes("/settings")) return "Configuration";
    return "Overview";
  };

  return (
    <header
      className="fixed top-0 right-0 z-40 flex h-[64px] items-center border-b border-[#E5E0D8] bg-[#FAF8F4]/90 backdrop-blur-xl transition-all duration-300 ease-in-out"
      style={{
        left: mounted && typeof window !== 'undefined' && window.innerWidth >= 768 ? `${currentDrawerWidth}px` : '0px',
      }}
    >
      <div className="flex w-full items-center justify-between px-4 md:px-6">
        {/* Left: Mobile menu + Title */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Menu Button */}
          <button
            onClick={handleDrawerToggle}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#DDD6C8] bg-white text-[#1C2B3A] transition-all hover:bg-[#F0EDE8] md:hidden"
          >
            <Menu size={18} />
          </button>

          {/* Breadcrumb-style title */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1A4480]/8 text-[#1A4480] sm:flex">
              <User size={16} />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-semibold text-[#1C2B3A] tracking-tight">
                  {title}
                </h1>
                <span className="hidden lg:inline-flex items-center rounded-full bg-[#1A4480]/8 px-2.5 py-0.5 text-[10px] font-semibold text-[#1A4480] uppercase tracking-wider">
                  {getPageLabel()}
                </span>
              </div>
              <span className="hidden text-[11px] text-[#6B7280] sm:block">
                Welcome, {getUserDisplayName()}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Settings */}
          <button
            onClick={() => router.push("/admin/settings")}
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-[#E5E0D8] bg-white text-[#6B7280] transition-all hover:bg-[#F0EDE8] hover:text-[#1C2B3A] md:flex"
            title="Settings"
          >
            <Settings size={16} className="transition-transform duration-500 hover:rotate-45" />
          </button>

          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-[#E5E0D8] mx-1" />

          {/* Profile */}
          <div className="group relative">
            <div className="flex items-center gap-2.5 cursor-pointer rounded-lg px-2 py-1.5 transition-all hover:bg-[#F0EDE8]">
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-[#E5E0D8] ring-offset-1 ring-offset-[#FAF8F4] transition-all group-hover:ring-[#1A4480]/30">
                {getImageUrl(user?.profile_pic) ? (
                  <img
                    src={getImageUrl(user?.profile_pic)}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#1A4480] text-[11px] font-bold text-white">
                    {getUserInitials()}
                  </div>
                )}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-semibold text-[#1C2B3A]">{getUserDisplayName()}</span>
                <span className="text-[10px] text-[#9CA3AF]">Administrator</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
