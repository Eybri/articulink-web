// src/components/PrivateRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/api";

export default function PrivateRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setAuthed(false);
        setLoading(false);
        return;
      }
      try {
        await api.get("/auth/me");
        setAuthed(true);
      } catch (e) {
        setAuthed(false);
      } finally {
        setLoading(false);
      }
    };
    check();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!authed) return <Navigate to="/login" replace />;
  return children;
}
