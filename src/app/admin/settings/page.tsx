"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Camera, 
  Trash2, 
  Save, 
  Lock,
  ChevronRight,
  Fingerprint,
  Users
} from "lucide-react";
import { authAPI, getUser, setUser as setLocalUser } from "@/lib/api";
import { getImageUrl } from "@/lib/utils";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    gender: ""
  });

  useEffect(() => {
    const data = getUser();
    if (data) {
      setUser(data);
      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        username: data.username || "",
        gender: data.gender || ""
      });
    }
    setLoading(false);
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await authAPI.updateProfile(formData);
      setUser(updated);
      setLocalUser(updated);
      alert("Neural profile updated successfully.");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Synchronization failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1">
            System Configuration
          </h2>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Account Settings
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-4 space-y-6">
           <div className="relative rounded-xl bg-zinc-900 border border-white/5 p-8 backdrop-blur-3xl overflow-hidden group">
              
              <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-1">
                       <div className="w-full h-full rounded-md overflow-hidden bg-zinc-900 border border-white/10 flex items-center justify-center">
                          {getImageUrl(user?.profile_pic) ? (
                            <img src={getImageUrl(user.profile_pic)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User size={32} className="text-white/10" />
                          )}
                       </div>
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-500 transition-all">
                       <Camera size={14} />
                    </button>
                 </div>

                 <h3 className="text-lg font-bold text-white tracking-tight mb-0.5">{user?.first_name} {user?.last_name}</h3>
                 <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-6">{user?.role} status: verified</p>

                 <div className="w-full space-y-3 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between">
                       <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">ID</span>
                       <span className="text-[9px] font-bold text-white uppercase tracking-widest">{user?.id?.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Enrollment</span>
                       <span className="text-[9px] font-bold text-white uppercase tracking-widest">{new Date(user?.created_at).toLocaleDateString()}</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="rounded-xl bg-red-500/5 border border-red-500/10 p-8">
              <h4 className="text-[9px] font-bold text-red-500 uppercase tracking-[0.3em] mb-4">Critical Actions</h4>
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all group">
                 <span className="text-xs font-black uppercase tracking-widest">Terminate Registry</span>
                 <Trash2 size={16} className="group-hover:rotate-12 transition-transform" />
              </button>
           </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-8 space-y-8">
           <div className="rounded-xl bg-zinc-900 border border-white/5 p-8 backdrop-blur-3xl relative">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Fingerprint size={20} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Identity Details</h3>
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-relaxed mt-0.5">Core biometric and credential data sync</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest ml-4 block">First Name</label>
                    <input 
                      type="text" 
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-lg p-3 text-xs font-medium text-white outline-none focus:bg-white/[0.06] focus:border-indigo-500/50 transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest ml-4 block">Last Name</label>
                    <input 
                      type="text" 
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-lg p-3 text-xs font-medium text-white outline-none focus:bg-white/[0.06] focus:border-indigo-500/50 transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest ml-4 block">Username</label>
                    <input 
                       type="text" 
                       value={formData.username}
                       onChange={(e) => setFormData({...formData, username: e.target.value})}
                       className="w-full bg-white/[0.03] border border-white/5 rounded-lg p-3 text-xs font-medium text-white outline-none focus:bg-white/[0.06] focus:border-indigo-500/50 transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest ml-4 block">Email (Read-Only)</label>
                    <div className="w-full bg-white/[0.01] border border-white/5 rounded-lg p-3 text-xs font-medium text-white/30 flex items-center gap-3">
                       <Mail size={16} />
                       {user?.email}
                    </div>
                 </div>
              </div>

              <div className="mt-10 flex justify-end">
                 <button 
                   onClick={handleSave}
                   disabled={saving}
                   className="flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-indigo-500 disabled:opacity-50"
                 >
                    {saving ? "Updating..." : "Save Changes"}
                    <Save size={16} />
                 </button>
              </div>
           </div>

           {/* Security Section */}
           <div className="rounded-xl bg-zinc-900 border border-white/5 p-8 backdrop-blur-3xl relative">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Shield size={20} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Security</h3>
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-relaxed mt-0.5">Manage access credentials and session keys</p>
                 </div>
              </div>

              <div className="space-y-3">
                 <button className="w-full flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center text-white/20">
                          <Lock size={14} />
                       </div>
                       <div className="text-left">
                          <h5 className="text-[11px] font-bold text-white uppercase tracking-tight">Change Password</h5>
                          <p className="text-[9px] font-medium text-white/10 mt-0.5">Last updated 30 days ago</p>
                       </div>
                    </div>
                    <ChevronRight size={16} className="text-white/20 group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
