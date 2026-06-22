"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Mic,
  BarChart3,
  Users,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI, setToken, setUser, logout } from "@/lib/api";
import { Suspense } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user is already authenticated
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      const userStr = localStorage.getItem("user");
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === 'admin') {
            router.replace("/admin/dashboard");
          }
        } catch (e) { }
      }
    }

    const error = searchParams.get('error');
    if (error === 'admin_required') {
      setErr("Admin access required. Please login with admin credentials.");
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setIsLoading(true);

    try {
      const data = await authAPI.login(email, password);

      setToken(data.access_token);
      setUser(data.user);

      if (data.user?.role !== 'admin') {
        setErr("Admin access required. Access denied.");
        logout();
        return;
      }

      router.replace("/admin/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      setErr(error.response?.data?.detail || "Invalid credentials. Access denied.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1000px] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-[0_32px_64px_-12px_rgba(11,29,53,0.25)] z-20 relative">

      {/* Left Side: Image & Branding */}
      <div className="hidden md:flex flex-1 relative overflow-hidden animate-slideInLeft">
        {/* Full background image */}
        <img
          src="/images/bg.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1D35]/90 via-[#0B1D35]/50 to-[#1A4480]/40" />

        {/* Decorative circles */}
        <div className="absolute top-[-15%] right-[-15%] w-[50%] h-[50%] rounded-full bg-[#7DD3E8]/10 blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#1A4480]/20 blur-[60px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full h-full min-h-[560px]">
          {/* Top: Logo */}
          <div className="flex items-center gap-3">
            <img src="/images/icon-white.png" alt="ArticuLink" className="w-10 h-10 object-contain" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight leading-none">ArticuLink</span>
              <span className="text-[9px] font-semibold text-white/40 uppercase tracking-[0.25em] mt-0.5">Admin Portal</span>
            </div>
          </div>

          {/* Middle: Feature highlights */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white leading-tight tracking-tight">
              Articulink Analytics<br />
              <span className="text-[#7DD3E8]">Dashboard</span>
            </h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-[280px]">
              Monitor and analyze communication patterns with advanced speech recognition.
            </p>

            {/* Feature pills */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3 text-white/60 text-xs">
                <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Mic size={14} className="text-[#7DD3E8]" />
                </div>
                <span>Cleft speech monitoring</span>
              </div>
              <div className="flex items-center gap-3 text-white/60 text-xs">
                <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <BarChart3 size={14} className="text-[#7DD3E8]" />
                </div>
                <span>Advanced analytics & reports</span>
              </div>
              <div className="flex items-center gap-3 text-white/60 text-xs">
                <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Users size={14} className="text-[#7DD3E8]" />
                </div>
                <span>User management tools</span>
              </div>
            </div>
          </div>

          {/* Bottom: Copyright */}
          <p className="text-white/20 text-[10px]">© 2026 ArticuLink. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full md:w-[380px] flex-shrink-0 p-8 md:p-10 flex flex-col justify-center bg-white relative animate-slideInRight">

        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-3 mb-8">
          <img src="/images/icon-white.png" alt="ArticuLink" className="w-9 h-9 object-contain" />
          <h1 className="text-lg font-bold text-[#1C2B3A]">ArticuLink</h1>
        </div>

        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-[#1C2B3A] tracking-tight">
              Welcome back
            </h1>
            <p className="text-[#6B7280] text-sm">
              Sign in to your admin account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {err && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-xs animate-shake">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{err}</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#374151] block">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition-colors group-focus-within:text-[#1A4480]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white border border-[#D1D5DB] rounded-md py-2.5 pl-10 pr-3 text-[#1C2B3A] text-sm outline-none focus:border-[#1A4480] focus:ring-2 focus:ring-[#1A4480]/10 transition-all placeholder:text-[#9CA3AF]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#374151] block">
                  Password
                </label>
                <div className="relative group">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition-colors group-focus-within:text-[#1A4480]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-[#D1D5DB] rounded-md py-2.5 pl-10 pr-10 text-[#1C2B3A] text-sm outline-none focus:border-[#1A4480] focus:ring-2 focus:ring-[#1A4480]/10 transition-all placeholder:text-[#9CA3AF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151] transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1A4480] text-white rounded-md py-2.5 text-sm font-medium transition-all hover:bg-[#153A6E] active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <div className="pt-4 text-center border-t border-[#F3F4F6]">
            <p className="text-[10px] text-[#9CA3AF] flex items-center justify-center gap-1.5">
              <ShieldCheck size={11} />
              Secured with end-to-end encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#F0EDE8] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Subtle background texture */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(26,68,128,0.06)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(42,143,160,0.06)_0%,transparent_50%)]" />
      </div>

      <Suspense fallback={
        <div className="w-full max-w-[1000px] h-[560px] bg-white rounded-2xl flex items-center justify-center z-20">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#1A4480]/10 border-t-[#1A4480]" />
        </div>
      }>
        <LoginForm />
      </Suspense>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
        @keyframes slideOutLeft {
          0% {
            opacity: 0;
            transform: translateX(50%);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOutRight {
          0% {
            opacity: 0;
            transform: translateX(-50%);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideInLeft {
          animation: slideOutLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slideInRight {
          animation: slideOutRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards;
          opacity: 0;
        }
      `}</style>
    </main>
  );
}
