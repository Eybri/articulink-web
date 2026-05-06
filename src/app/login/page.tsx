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
    <main className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="w-full max-w-[1100px] flex flex-col-reverse md:flex-row rounded-[2.5rem] overflow-hidden border border-white/5 bg-white/[0.02] backdrop-blur-3xl z-10 shadow-2xl relative group">
        {/* Left Side: Form */}
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-center relative bg-gradient-to-br from-white/[0.02] to-transparent">
          <div className="max-w-[400px] mx-auto w-full space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                Welcome Back
              </h1>
              <p className="text-white/40 text-sm font-medium uppercase tracking-widest leading-relaxed">
                Vault entry required. Enter admin credentials to proceed.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {err && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider animate-shake">
                  {err}
                </div>
              )}

              <div className="space-y-6">
                <div className="group relative">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-4 mb-2 block transition-all group-focus-within:text-indigo-400">
                    Administrator ID
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 transition-all group-focus-within:text-indigo-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@articulink.com"
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm outline-none transition-all focus:bg-white/[0.05] focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>

                <div className="group relative">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-4 mb-2 block transition-all group-focus-within:text-indigo-400">
                    Secret Key
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 transition-all group-focus-within:text-indigo-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-14 text-white text-sm outline-none transition-all focus:bg-white/[0.05] focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl py-5 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02] hover:shadow-indigo-600/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group/btn"
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? "Verifying Access..." : "Initialize Session"}
                  {!isLoading && <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />}
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
        <div className="flex-[1.2] p-12 md:p-24 bg-indigo-600/5 border-l border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
          
          <div className="relative z-10 text-center space-y-8">
            <div className="flex justify-center">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-emerald-500 p-8 shadow-2xl shadow-indigo-500/40 animate-float">
                <Cpu size="100%" className="text-white drop-shadow-lg" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                ArticuLink
              </h2>
              <p className="text-white/40 text-lg md:text-xl font-medium max-w-[320px] mx-auto leading-relaxed">
                Precision clinical speech monitoring interface.
              </p>
            </div>
          </div>

          <div className="absolute bottom-12 right-12 flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Core Status: Stable</span>
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
