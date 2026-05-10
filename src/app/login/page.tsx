"use client";

import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Cpu
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI, setToken, setUser, logout } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'admin_required') {
      setErr("Admin access required. Please login with admin credentials.");
    }
  }, [searchParams]);

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

      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      setErr(error.response?.data?.detail || "Invalid credentials. Access denied.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="w-full max-w-[1000px] flex flex-col-reverse md:flex-row rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] backdrop-blur-3xl z-10 shadow-2xl relative">
        {/* Left Side: Form */}
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-center relative bg-gradient-to-br from-white/[0.02] to-transparent">
          <div className="max-w-[400px] mx-auto w-full space-y-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Authentication
              </h1>
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                Secure entry protocol required for access.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {err && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest animate-shake">
                  {err}
                </div>
              )}

              <div className="space-y-6">
                <div className="group relative">
                  <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest ml-4 mb-2 block">
                    Identity
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3.5 pl-14 pr-6 text-white text-xs outline-none focus:bg-white/[0.05] focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="group relative">
                  <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest ml-4 mb-2 block">
                    Security Key
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3.5 pl-14 pr-14 text-white text-xs outline-none focus:bg-white/[0.05] focus:border-indigo-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white rounded-xl py-4 text-xs font-bold uppercase tracking-widest transition-all hover:bg-indigo-500 disabled:opacity-50 group/btn"
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? "Verifying..." : "Initialize Session"}
                  {!isLoading && <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />}
                </span>
              </button>
            </form>

            <div className="pt-8 flex items-center gap-3 text-white/20">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">End-to-End Cryptography Active</span>
            </div>
          </div>
        </div>

        {/* Right Side: Branding */}
        <div className="flex-[1.2] p-12 md:p-24 bg-zinc-900 border-l border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
          
          <div className="relative z-10 text-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                ArticuLink
              </h2>
              <p className="text-white/20 text-sm font-medium max-w-[280px] mx-auto leading-relaxed">
                Advanced clinical speech monitor interface for professional practitioners.
              </p>
            </div>
          </div>

          <div className="absolute bottom-8 right-8 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Status: Operational</span>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
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
