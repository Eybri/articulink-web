// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Button } from "@mui/material";
import api from "../api/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchMe();

    // For demo: sample mispronunciation data (replace with backend endpoint later)
    setData([
      { phoneme: "s→θ", count: 40 },
      { phoneme: "th→s", count: 15 },
      { phoneme: "nasal vowels", count: 23 },
      { phoneme: "n→m", count: 8 },
    ]);
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Admin Dashboard</Typography>
        <Button onClick={logout} variant="outlined">Logout</Button>
      </Box>

      <Typography sx={{ mt: 2 }}>Welcome, {user?.email}</Typography>

      <Box sx={{ mt: 4, height: 300 }}>
        <Typography variant="h6">Top Mispronounced Phonemes</Typography>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <XAxis dataKey="phoneme" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Container>
  );
}
