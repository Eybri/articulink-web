// src/pages/Login.jsx
import React, { useState } from "react";
import { Container, Box, TextField, Button, Typography, Alert } from "@mui/material";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setErr(error.response?.data?.detail || "Login failed");
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
        <Typography variant="h5">ArticuLink Admin Login</Typography>
        {err && <Alert severity="error">{err}</Alert>}
        <TextField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button variant="contained" type="submit">Login</Button>
      </Box>
    </Container>
  );
}
