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
  Users,
  X,
  Eye,
  EyeOff
} from "lucide-react";
import { authAPI, getUser, setUser as setLocalUser } from "@/lib/api";
import { getImageUrl } from "@/lib/utils";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    gender: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Load from local storage for immediate UI
        const localData = getUser();
        if (localData) {
          setUser(localData);
          setFormData({
            first_name: localData.first_name || "",
            last_name: localData.last_name || "",
            username: localData.username || "",
            gender: localData.gender || ""
          });
          // Only stop loading if we have local data, otherwise wait for API
          setLoading(false);
        }

        // Fetch fresh data from DB
        const data = await authAPI.getProfile();
        if (data) {
          setUser(data);
          setLocalUser(data); // Sync local storage
          setFormData({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            username: data.username || "",
            gender: data.gender || ""
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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

  const handlePasswordUpdate = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert("New passwords do not match.");
      return;
    }
    try {
      setPasswordSaving(true);
      await authAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      alert("Security credentials updated successfully.");
      setShowPasswordModal(false);
      setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      console.error("Password update failed:", err);
      alert("Verification failed. Please check your current password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest mb-1">
            System Configuration
          </h2>
          <h1 className="text-2xl font-bold text-[#1C2B3A] tracking-tight">
            Account Settings
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-4 space-y-6">
           <div className="relative rounded-xl bg-white border border-[#DDD6C8] p-8 shadow-sm overflow-hidden group">
              <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-lg bg-[#FAF8F4] border border-[#DDD6C8] p-1">
                       <div className="w-full h-full rounded-md overflow-hidden bg-white border border-black/5 flex items-center justify-center">
                          {getImageUrl(user?.profile_pic) ? (
                            <img src={getImageUrl(user.profile_pic)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User size={32} className="text-[#4A5A6A]/20" />
                          )}
                       </div>
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-[#1A4480] text-white flex items-center justify-center shadow-lg hover:bg-[#0F2847] transition-all">
                       <Camera size={14} />
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-[#1C2B3A] tracking-tight mb-0.5">{user?.first_name} {user?.last_name}</h3>
                  <p className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest mb-6">{user?.role} status: verified</p>

                  <div className="w-full space-y-3 pt-6 border-t border-[#DDD6C8]">
                    <div className="flex items-center justify-between">
                       <span className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest">ID</span>
                       <span className="text-[9px] font-bold text-[#1C2B3A] uppercase tracking-widest">{user?.id?.slice(-8).toUpperCase() || 'UNKNOWN'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest">Enrollment</span>
                       <span className="text-[9px] font-bold text-[#1C2B3A] uppercase tracking-widest">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
              </div>
           </div>

           <div className="rounded-xl bg-red-50 border border-red-100 p-8">
              <h4 className="text-[9px] font-bold text-red-600 uppercase tracking-widest mb-4">Critical Actions</h4>
              <button className="w-full flex items-center justify-between p-4 rounded-xl bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white transition-all group">
                 <span className="text-xs font-bold uppercase tracking-widest">Terminate Registry</span>
                 <Trash2 size={16} className="group-hover:rotate-12 transition-transform" />
              </button>
           </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-8 space-y-8">
           <div className="rounded-xl bg-white border border-[#DDD6C8] p-8 shadow-sm relative">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-10 h-10 rounded-lg bg-[#1A4480]/10 border border-[#1A4480]/20 flex items-center justify-center text-[#1A4480]">
                    <Fingerprint size={20} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-[#1C2B3A] tracking-tight">Identity Details</h3>
                    <p className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest leading-relaxed mt-0.5">Core biometric and credential data sync</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest ml-4 block">First Name</label>
                    <input 
                      type="text" 
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="w-full bg-[#FAF8F4] border border-[#DDD6C8] rounded-lg p-3 text-xs font-medium text-[#1C2B3A] outline-none focus:bg-white focus:border-[#1A4480]/30 transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest ml-4 block">Last Name</label>
                    <input 
                      type="text" 
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="w-full bg-[#FAF8F4] border border-[#DDD6C8] rounded-lg p-3 text-xs font-medium text-[#1C2B3A] outline-none focus:bg-white focus:border-[#1A4480]/30 transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest ml-4 block">Username</label>
                    <input 
                       type="text" 
                       value={formData.username}
                       onChange={(e) => setFormData({...formData, username: e.target.value})}
                       className="w-full bg-[#FAF8F4] border border-[#DDD6C8] rounded-lg p-3 text-xs font-medium text-[#1C2B3A] outline-none focus:bg-white focus:border-[#1A4480]/30 transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest ml-4 block">Email (Read-Only)</label>
                    <div className="w-full bg-[#FAF8F4] border border-[#DDD6C8] rounded-lg p-3 text-xs font-medium text-[#4A5A6A]/60 flex items-center gap-3">
                       <Mail size={16} />
                       {user?.email}
                    </div>
                 </div>
              </div>

              <div className="mt-10 flex justify-end">
                 <button 
                   onClick={handleSave}
                   disabled={saving}
                   className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#1A4480] text-white text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-[#0F2847] shadow-lg shadow-[#1A4480]/20 disabled:opacity-50"
                 >
                    {saving ? "Updating..." : "Save Changes"}
                    <Save size={16} />
                 </button>
              </div>
           </div>

           {/* Security Section */}
           <div className="rounded-xl bg-white border border-[#DDD6C8] p-8 shadow-sm relative">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                    <Shield size={20} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-[#1C2B3A] tracking-tight">Security</h3>
                    <p className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest leading-relaxed mt-0.5">Manage access credentials and session keys</p>
                 </div>
              </div>

              <div className="space-y-3">
                 <button 
                   onClick={() => setShowPasswordModal(true)}
                   className="w-full flex items-center justify-between p-4 rounded-lg bg-[#FAF8F4] border border-[#DDD6C8] hover:bg-white hover:shadow-sm transition-all group"
                 >
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-md bg-white border border-[#DDD6C8] flex items-center justify-center text-[#4A5A6A]">
                          <Lock size={14} />
                       </div>
                       <div className="text-left">
                          <h5 className="text-[11px] font-bold text-[#1C2B3A] uppercase tracking-tight">Change Password</h5>
                          <p className="text-[9px] font-medium text-[#4A5A6A] mt-0.5">Last updated 30 days ago</p>
                       </div>
                    </div>
                    <ChevronRight size={16} className="text-[#4A5A6A] group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C2B3A]/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-md bg-white rounded-2xl border border-[#DDD6C8] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between p-6 border-b border-[#DDD6C8]">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1A4480]/10 flex items-center justify-center text-[#1A4480]">
                       <Lock size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-[#1C2B3A] uppercase tracking-widest">Update Credentials</h3>
                 </div>
                 <button 
                   onClick={() => setShowPasswordModal(false)}
                   className="p-2 rounded-lg text-[#4A5A6A] hover:bg-[#FAF8F4] transition-all"
                 >
                    <X size={18} />
                 </button>
              </div>

              <div className="p-6 space-y-5">
                 <div className="space-y-2">
                    <label className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest ml-1">Current Password</label>
                    <div className="relative">
                       <input 
                         type={showPasswords.current ? "text" : "password"}
                         value={passwordData.current_password}
                         onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                         className="w-full bg-[#FAF8F4] border border-[#DDD6C8] rounded-lg p-3 text-xs font-medium text-[#1C2B3A] outline-none focus:bg-white focus:border-[#1A4480]/30 transition-all pr-10"
                         placeholder="••••••••"
                       />
                       <button 
                         onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5A6A] hover:text-[#1A4480] transition-colors"
                       >
                          {showPasswords.current ? <EyeOff size={14} /> : <Eye size={14} />}
                       </button>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest ml-1">New Neural Key</label>
                    <div className="relative">
                       <input 
                         type={showPasswords.new ? "text" : "password"}
                         value={passwordData.new_password}
                         onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                         className="w-full bg-[#FAF8F4] border border-[#DDD6C8] rounded-lg p-3 text-xs font-medium text-[#1C2B3A] outline-none focus:bg-white focus:border-[#1A4480]/30 transition-all pr-10"
                         placeholder="Min. 8 characters"
                       />
                       <button 
                         onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5A6A] hover:text-[#1A4480] transition-colors"
                       >
                          {showPasswords.new ? <EyeOff size={14} /> : <Eye size={14} />}
                       </button>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest ml-1">Confirm New Key</label>
                    <div className="relative">
                       <input 
                         type={showPasswords.confirm ? "text" : "password"}
                         value={passwordData.confirm_password}
                         onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                         className="w-full bg-[#FAF8F4] border border-[#DDD6C8] rounded-lg p-3 text-xs font-medium text-[#1C2B3A] outline-none focus:bg-white focus:border-[#1A4480]/30 transition-all pr-10"
                         placeholder="Repeat new key"
                       />
                       <button 
                         onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5A6A] hover:text-[#1A4480] transition-colors"
                       >
                          {showPasswords.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                       </button>
                    </div>
                 </div>
              </div>

              <div className="p-6 bg-[#FAF8F4] border-t border-[#DDD6C8] flex justify-end gap-3">
                 <button 
                   onClick={() => setShowPasswordModal(false)}
                   className="px-4 py-2 rounded-lg text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest hover:bg-[#DDD6C8]/20 transition-all"
                 >
                    Cancel
                 </button>
                 <button 
                   onClick={handlePasswordUpdate}
                   disabled={passwordSaving || !passwordData.new_password}
                   className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#1A4480] text-white text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-[#0F2847] shadow-lg shadow-[#1A4480]/20 disabled:opacity-50"
                 >
                    {passwordSaving ? "Synchronizing..." : "Update Key"}
                    {!passwordSaving && <ChevronRight size={14} />}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
