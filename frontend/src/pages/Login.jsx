"use client"

// src/pages/Login.jsx
import { useState } from "react"
import { Container, Box, TextField, Button, Typography, Alert, Paper, InputAdornment, IconButton } from "@mui/material"
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  SecurityOutlined,
  ArrowForward
} from "@mui/icons-material"
import api from "../api/api"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr("")
    setIsLoading(true)
    
    try {
      const res = await api.post("/auth/login", { email, password })
      localStorage.setItem("access_token", res.data.access_token)
      localStorage.setItem("refresh_token", res.data.refresh_token)
      navigate("/dashboard")
    } catch (error) {
      console.error(error)
      setErr(error.response?.data?.detail || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%)
          `,
          zIndex: 1,
        },
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(100, 108, 255, 0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "float 6s ease-in-out infinite",
          zIndex: 1,
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-20px)" },
          },
        }}
      />
      
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 2 }}>
        <Paper
          elevation={0}
          sx={{
            padding: { xs: 3, sm: 5 },
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(100, 108, 255, 0.8), transparent)",
            },
          }}
        >
          {/* Header Section */}
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Box
              sx={{
                position: "relative",
                display: "inline-block",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #646cff 0%, #535bf2 50%, #ff6b9d 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  boxShadow: `
                    0 20px 40px rgba(100, 108, 255, 0.3),
                    0 0 80px rgba(100, 108, 255, 0.1),
                    inset 0 0 0 1px rgba(255, 255, 255, 0.1)
                  `,
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: -2,
                    left: -2,
                    right: -2,
                    bottom: -2,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #646cff, #ff6b9d, #535bf2)",
                    opacity: 0.3,
                    zIndex: -1,
                    filter: "blur(8px)",
                  },
                }}
              >
                <LoginIcon sx={{ fontSize: 48, color: "white" }} />
              </Box>
            </Box>
            
            <Typography
              variant="h3"
              sx={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 800,
                background: "linear-gradient(135deg, #fff 0%, #646cff 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
                letterSpacing: "-0.02em",
              }}
            >
              ArticuLink
            </Typography>
            
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 1 }}>
              <SecurityOutlined sx={{ color: "#646cff", fontSize: 20 }} />
              <Typography
                variant="h6"
                sx={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                }}
              >
                Admin Dashboard
              </Typography>
            </Box>
            
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                fontFamily: "'Inter', sans-serif",
                maxWidth: "300px",
                margin: "0 auto",
              }}
            >
              Secure access to your administration panel
            </Typography>
          </Box>

          {/* Form Section */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 3.5 }}>
            {err && (
              <Alert
                severity="error"
                sx={{
                  borderRadius: 3,
                  backgroundColor: "rgba(244, 67, 54, 0.08)",
                  border: "1px solid rgba(244, 67, 54, 0.2)",
                  color: "#ff8a80",
                  backdropFilter: "blur(10px)",
                  "& .MuiAlert-icon": {
                    color: "#ff6b6b",
                  },
                }}
              >
                {err}
              </Alert>
            )}

            <Box sx={{ position: "relative" }}>
              <TextField
                label="Email Address"
                type="email"
                required
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: "#646cff" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    borderRadius: 3,
                    backdropFilter: "blur(10px)",
                    transition: "all 0.3s ease",
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.15)",
                      borderWidth: "1px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#646cff",
                      borderWidth: "1px",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#646cff",
                      borderWidth: "2px",
                      boxShadow: "0 0 20px rgba(100, 108, 255, 0.2)",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "rgba(255, 255, 255, 0.7)",
                    fontFamily: "'Inter', sans-serif",
                    "&.Mui-focused": {
                      color: "#646cff",
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    color: "white",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "1rem",
                    padding: "16px 14px",
                  },
                }}
              />
            </Box>

            <Box sx={{ position: "relative" }}>
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                required
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "#646cff" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ 
                          color: "rgba(255, 255, 255, 0.7)",
                          "&:hover": {
                            color: "#646cff",
                            backgroundColor: "rgba(100, 108, 255, 0.1)",
                          },
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    borderRadius: 3,
                    backdropFilter: "blur(10px)",
                    transition: "all 0.3s ease",
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.15)",
                      borderWidth: "1px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#646cff",
                      borderWidth: "1px",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#646cff",
                      borderWidth: "2px",
                      boxShadow: "0 0 20px rgba(100, 108, 255, 0.2)",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "rgba(255, 255, 255, 0.7)",
                    fontFamily: "'Inter', sans-serif",
                    "&.Mui-focused": {
                      color: "#646cff",
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    color: "white",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "1rem",
                    padding: "16px 14px",
                  },
                }}
              />
            </Box>

            <Button
              variant="contained"
              type="submit"
              size="large"
              disabled={isLoading}
              fullWidth
              sx={{
                mt: 2,
                py: 2,
                borderRadius: 3,
                background: "linear-gradient(135deg, #646cff 0%, #535bf2 100%)",
                boxShadow: "0 8px 32px rgba(100, 108, 255, 0.3)",
                fontSize: "1.1rem",
                fontWeight: 700,
                fontFamily: "'Inter', sans-serif",
                textTransform: "none",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  background: "linear-gradient(135deg, #535bf2 0%, #4c44e6 100%)",
                  boxShadow: "0 12px 40px rgba(100, 108, 255, 0.4)",
                  transform: "translateY(-2px)",
                },
                "&:disabled": {
                  background: "rgba(100, 108, 255, 0.3)",
                  color: "rgba(255, 255, 255, 0.5)",
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: -100,
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                  transition: "left 0.6s",
                },
                "&:hover::before": {
                  left: "100%",
                },
              }}
              endIcon={!isLoading && <ArrowForward sx={{ ml: 1 }} />}
            >
              {isLoading ? "Signing In..." : "Sign In to Dashboard"}
            </Button>
          </Box>

          {/* Footer Section */}
          <Box sx={{ textAlign: "center", mt: 4, pt: 3, borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255, 255, 255, 0.4)",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <SecurityOutlined sx={{ fontSize: 16 }} />
              Protected by enterprise-grade security
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}