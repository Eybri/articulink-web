"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUser, isAdmin } from "@/lib/api";
import Header from "@/components/Header";
import Sidebar, { drawerWidth, miniDrawerWidth } from "@/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const token = getToken();
    const storedUser = getUser();

    if (!token || !storedUser || !isAdmin()) {
      router.push("/login");
    } else {
      setUser(storedUser);
      setLoading(false);
    }
  }, [router]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setSidebarMinimized(!sidebarMinimized);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  const currentDrawerWidth = sidebarMinimized ? miniDrawerWidth : drawerWidth;

  return (
    <div className="flex min-h-screen bg-[#FAF8F4] text-[#1C2B3A]">
      <Sidebar
        user={user}
        mobileOpen={mobileOpen}
        sidebarMinimized={sidebarMinimized}
        handleDrawerToggle={handleDrawerToggle}
        handleSidebarToggle={handleSidebarToggle}
        setUser={setUser}
      />

      <div className="flex flex-1 flex-col transition-all duration-300 relative z-10">
        <Header
          currentDrawerWidth={currentDrawerWidth}
          handleDrawerToggle={handleDrawerToggle}
          title="Admin Dashboard"
          user={user}
        />

        <main
          className="flex-1 p-6 md:p-8"
          style={{
            marginTop: "70px",
            marginLeft: mounted && typeof window !== 'undefined' && window.innerWidth >= 768 ? (sidebarMinimized ? "80px" : "280px") : "0px",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
