"use client";

import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle
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
        } catch (e) {}
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
    <div className="w-full max-w-[950px] flex flex-col md:flex-row rounded-3xl overflow-hidden bg-white border border-[#DDD6C8] shadow-[0_32px_64px_-12px_rgba(28,43,58,0.12)] z-20 relative">
        {/* Left Side: Branding/Visual */}
        <div className="hidden md:flex flex-1 bg-[#1A4480] p-16 flex-col justify-between relative overflow-hidden">
          {/* Subtle bg.jpg overlay for branding side */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <img src="/images/bg.jpg" alt="" className="w-full h-full object-cover" />
          </div>
          
          <div className="absolute top-[-20%] right-[-20%] w-full h-full bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-16">
               <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center p-2 shadow-2xl">
                  <img src="/images/logo2-nobg.png" alt="ArticuLink" className="w-full h-full object-contain brightness-0 invert" />
               </div>
               <div className="flex flex-col">
                 <span className="text-xl font-bold text-white tracking-tight leading-none">ArticuLink</span>
                 <span className="text-[8px] font-bold text-[#2A8FA0] uppercase tracking-[0.3em] mt-1">Enterprise Interface</span>
               </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-5xl font-bold text-white leading-tight tracking-tight">
                Articulink <br /> 
                <span className="text-[#2A8FA0]">Speech Analytics</span>
              </h2>
              <p className="text-white/60 text-sm font-medium tracking-tight">
                Advanced communication speech monitor interface.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-12">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 w-fit backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-[#2A8FA0] animate-pulse shadow-[0_0_8px_rgba(42,143,160,0.5)]" />
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">System Online</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-center bg-white relative">
          {/* Logo for mobile view */}
          <div className="md:hidden flex items-center gap-3 mb-12">
            <img src="/images/logo2-nobg.png" alt="ArticuLink" className="w-10 h-10 object-contain" />
            <h1 className="text-xl font-bold text-[#1C2B3A]">ArticuLink</h1>
          </div>

          <div className="max-w-[340px] mx-auto w-full space-y-10">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-[#1C2B3A] tracking-tight">
                Operator Login
              </h1>
              <div className="text-[#4A5A6A] text-[10px] font-bold uppercase tracking-widest leading-relaxed flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#1A4480]" />
                Identity verification required
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {err && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold uppercase tracking-widest animate-shake">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} />
                    {err}
                  </div>
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest ml-4 block">
                    Biometric Identity (Email)
                  </label>
                  <div className="relative group">
                    <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#4A5A6A]/40 transition-colors group-focus-within:text-[#1A4480]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@articulink.com"
                      className="w-full bg-[#FAF8F4] border border-[#DDD6C8] rounded-xl py-4 pl-14 pr-6 text-[#1C2B3A] text-xs font-medium outline-none focus:bg-white focus:border-[#1A4480]/30 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest ml-4 block">
                    Security Neural Key
                  </label>
                  <div className="relative group">
                    <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#4A5A6A]/40 transition-colors group-focus-within:text-[#1A4480]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#FAF8F4] border border-[#DDD6C8] rounded-xl py-4 pl-14 pr-14 text-[#1C2B3A] text-xs font-medium outline-none focus:bg-white focus:border-[#1A4480]/30 transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#4A5A6A]/40 hover:text-[#1C2B3A] transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1A4480] text-white rounded-xl py-4 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-[#0F2847] shadow-lg shadow-[#1A4480]/20 disabled:opacity-50 group/btn active:scale-[0.98]"
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? "Validating Path..." : "Initialize Session"}
                  {!isLoading && <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />}
                </span>
              </button>
            </form>

            <div className="pt-6 text-center">
              <p className="text-[9px] font-bold text-[#4A5A6A]/30 uppercase tracking-[0.25em] flex items-center justify-center gap-3">
                <ShieldCheck size={12} />
                AES-256 Encryption Active
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F4] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background with bg.jpg */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/bg.jpg" 
          alt="" 
          className="w-full h-full object-cover opacity-[0.08]"
        />
        <div className="absolute inset-0 bg-[#FAF8F4]/60 backdrop-blur-[1px]" />
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#1A4480]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#2A8FA0]/10 blur-[120px]" />
      </div>

      <Suspense fallback={
        <div className="w-full max-w-[950px] h-[600px] bg-white rounded-3xl border border-[#DDD6C8] flex items-center justify-center z-20">
           <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1A4480]/10 border-t-[#1A4480]" />
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
      `}</style>
    </main>
  );
}
