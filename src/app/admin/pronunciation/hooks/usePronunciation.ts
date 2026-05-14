"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { pronunciationAPI, userAPI } from "@/lib/api";
import type { DeactivationData } from "@/components/DeactivateModal";
import type { ConfirmationType } from "@/components/ConfirmationModal";

export function usePronunciation() {
  const [clips, setClips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedClip, setSelectedClip] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Deactivation modal state
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: ConfirmationType;
    confirmLabel: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: 'info',
    confirmLabel: "Confirm"
  });

  const closeConfirmModal = useCallback(() => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Live clock for countdown timers
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchClips = useCallback(async () => {
    try {
      setLoading(true);
      setClips([]);
      if (selectedUser) {
        const data = await pronunciationAPI.getAudioClips({
          skip: page * limit,
          limit,
          userId: selectedUser.user_id
        });
        if (data && data.items) {
          setClips(data.items);
          setTotal(data.total);
        }
      } else {
        const data = await pronunciationAPI.getPronunciationUsers({
          skip: page * limit,
          limit,
          search: searchTerm
        });
        setClips(data.items || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, selectedUser, searchTerm]);

  useEffect(() => {
    fetchClips();
  }, [page, limit, selectedUser]);

  const handlePlayPause = useCallback((clip: any) => {
    const clipId = clip.id || clip._id;
    if (playingId === clipId) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(clip.audio_url);
      audioRef.current.play();
      setPlayingId(clipId);
      audioRef.current.onended = () => setPlayingId(null);
    }
  }, [playingId]);

  const handleDelete = useCallback((id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Recording",
      message: "Are you sure you want to permanently delete this communication audio recording? This action cannot be undone.",
      type: 'danger',
      confirmLabel: "Delete Recording",
      onConfirm: async () => {
        try {
          setIsConfirming(true);
          await pronunciationAPI.deleteAudioClip(id);
          await fetchClips();
          closeConfirmModal();
        } catch (err) {
          console.error("Delete failed:", err);
        } finally {
          setIsConfirming(false);
        }
      }
    });
  }, [fetchClips]);

  const handleActivate = useCallback((userId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Restore User Access",
      message: "Restore full system intelligence access for this user? This will re-enable all speech processing capabilities.",
      type: 'success',
      confirmLabel: "Restore Access",
      onConfirm: async () => {
        try {
          setIsConfirming(true);
          await userAPI.activateUser(userId);
          if (selectedUser && (selectedUser.user_id === userId || selectedUser._id === userId)) {
            setSelectedUser({ ...selectedUser, user_info: { ...selectedUser.user_info, status: 'active' } });
          }
          await fetchClips();
          closeConfirmModal();
        } catch (err) {
          console.error("Activation failed:", err);
        } finally {
          setIsConfirming(false);
        }
      }
    });
  }, [selectedUser, fetchClips]);

  const handleDeactivateSubmit = useCallback(async (deactivationData: DeactivationData) => {
    if (!targetUser) return;
    try {
      const apiData = {
        ...deactivationData,
        deactivation_reason: deactivationData.deactivation_reason
          ? `[${deactivationData.reason_category}] ${deactivationData.deactivation_reason}`
          : deactivationData.reason_category
      };
      const response = await userAPI.deactivateUser(targetUser.user_id || targetUser._id, apiData);

      if (selectedUser && (selectedUser.user_id === targetUser.user_id || selectedUser._id === targetUser.user_id)) {
        setSelectedUser({
          ...selectedUser,
          user_info: {
            ...selectedUser.user_info,
            status: 'inactive',
            deactivation_type: response.deactivation_type,
            deactivation_end_date: response.deactivation_end_date
          }
        });
      }

      setShowDeactivateModal(false);
      fetchClips();
    } catch (err) {
      console.error("Deactivation failed:", err);
    }
  }, [targetUser, selectedUser, fetchClips]);

  const openDeactivateModal = useCallback((user: any) => {
    setTargetUser(user);
    setShowDeactivateModal(true);
  }, []);

  const selectUser = useCallback((user: any) => {
    setSelectedUser(user);
    setPage(0);
    setSearchTerm("");
  }, []);

  const goBackToList = useCallback(() => {
    setSelectedUser(null);
    setPage(0);
  }, []);

  return {
    // Data
    clips,
    loading,
    total,
    now,

    // Pagination
    page,
    setPage,
    limit,
    setLimit,

    // Search
    searchTerm,
    setSearchTerm,
    fetchClips,

    // View
    viewMode,
    setViewMode,

    // Selection
    selectedUser,
    selectUser,
    goBackToList,
    selectedClip,
    setSelectedClip,

    // Audio
    playingId,
    handlePlayPause,

    // Actions
    handleDelete,
    handleActivate,
    handleDeactivateSubmit,

    // Deactivation modal
    showDeactivateModal,
    setShowDeactivateModal,
    targetUser,
    openDeactivateModal,

    // Confirmation modal
    confirmModal,
    closeConfirmModal,
    isConfirming
  };
}
