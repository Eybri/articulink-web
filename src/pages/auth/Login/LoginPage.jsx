"use client"

// src/pages/Login.jsx
import { useState, useEffect } from "react"
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
import api, { setToken, setUser } from "../../../api/api"
import { useNavigate, useSearchParams } from "react-router-dom"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Check for admin access error in URL
    const error = searchParams.get('error')
    if (error === 'admin_required') {
      setErr("Admin access required. Please login with admin credentials.")
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr("")
    setIsLoading(true)
    
    try {
      const res = await api.post("/api/admin/auth/login", { email, password })
      
      // Store token and user data
      setToken(res.data.access_token)
      setUser(res.data.user)
      
      // Verify user is admin
      if (res.data.user?.role !== 'admin') {
        setErr("Admin access required. Please contact system administrator.")
        api.logout()
        return
      }
      
      navigate("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          "Login failed. Please check your credentials."
      setErr(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        background: "#050505",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at center, black, transparent 80%)",
          zIndex: 1,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 30%, rgba(100, 108, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)
          `,
          zIndex: 1,
        }
      }}
    >
      {/* Animated Glowing Orbs */}
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          left: "15%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(100, 108, 255, 0.08) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "floatSlow 15s ease-in-out infinite",
          zIndex: 1,
          "@keyframes floatSlow": {
            "0%, 100%": { transform: "translate(0, 0) scale(1)" },
            "33%": { transform: "translate(30px, -50px) scale(1.1)" },
            "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          },
        }}
      />
      
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 10 }}>
        <Paper
          elevation={0}
          sx={{
            padding: { xs: 4, sm: 6 },
            borderRadius: 6,
            background: "rgba(255, 255, 255, 0.02)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              padding: "1px",
              borderRadius: 6,
              background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02), rgba(100,108,255,0.1))",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              pointerEvents: "none",
            },
          }}
        >
          {/* Header Section */}
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Box
              sx={{
                position: "relative",
                display: "inline-block",
                mb: 4,
                animation: "floatLogo 6s ease-in-out infinite",
                "@keyframes floatLogo": {
                  "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
                  "50%": { transform: "translateY(-15px) rotate(2deg)" },
                },
              }}
            >
              <Box
                component="img"
                src="/images/whitelogo.png"
                alt="ArticuLink Logo"
                sx={{
                  width: 120,
                  height: "auto",
                  filter: "drop-shadow(0 0 15px rgba(255, 255, 255, 0.2))",
                }}
              />
            </Box>
            
            <Typography
              variant="h2"
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 900,
                fontSize: { xs: '2.5rem', sm: '3.5rem' },
                background: "linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.6) 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              ArticuLink
            </Typography>
            
            <Box 
              sx={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: 1, 
                px: 2, 
                py: 0.5, 
                borderRadius: "20px", 
                bgcolor: "rgba(100, 108, 255, 0.1)",
                border: "1px solid rgba(100, 108, 255, 0.2)",
                mb: 2
              }}
            >
              <SecurityOutlined sx={{ color: "#646cff", fontSize: 14 }} />
              <Typography
                variant="caption"
                sx={{
                  color: "#646cff",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.65rem'
                }}
              >
                Secured Admin Portal
              </Typography>
            </Box>
          </Box>

          {/* Form Section */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 3 }}>
            {err && (
              <Alert
                severity="error"
                sx={{
                  borderRadius: 3,
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  color: "#fca5a5",
                  backdropFilter: "blur(10px)",
                }}
              >
                {err}
              </Alert>
            )}

            <TextField
              label="ADMIN ACCOUNT"
              type="email"
              required
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderWidth: "1px",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#646cff",
                    borderWidth: "2px",
                    boxShadow: "0 0 25px rgba(100, 108, 255, 0.15)",
                  },
                  "& .MuiOutlinedInput-input": {
                    py: 1.5,
                  }
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.4)",
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  letterSpacing: '0.1em',
                  "&.Mui-focused": {
                    color: "#646cff",
                  },
                  "&.MuiInputLabel-shrink": {
                    transform: 'translate(14px, -9px) scale(0.9)',
                  }
                },
              }}
            />

            <TextField
              label="PASSWORD ACCESS"
              type={showPassword ? "text" : "password"}
              required
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      sx={{ color: "rgba(255, 255, 255, 0.3)" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#646cff",
                    borderWidth: "2px",
                    boxShadow: "0 0 25px rgba(100, 108, 255, 0.15)",
                  },
                  "& .MuiOutlinedInput-input": {
                    py: 1.5,
                  }
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.4)",
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  letterSpacing: '0.1em',
                  "&.Mui-focused": {
                    color: "#646cff",
                  },
                  "&.MuiInputLabel-shrink": {
                    transform: 'translate(14px, -9px) scale(0.9)',
                  }
                },
              }}
            />

            <Button
              variant="contained"
              type="submit"
              disabled={isLoading}
              fullWidth
              sx={{
                mt: 1,
                py: 2,
                borderRadius: 3,
                background: "linear-gradient(135deg, #646cff 0%, #4c44e6 100%)",
                boxShadow: "0 10px 40px -10px rgba(100, 108, 255, 0.5)",
                fontSize: "0.9rem",
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: "uppercase",
                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                "&:hover": {
                  background: "linear-gradient(135deg, #4c44e6 0%, #3f36d4 100%)",
                  boxShadow: "0 15px 45px -10px rgba(100, 108, 255, 0.6)",
                  transform: "scale(1.02) translateY(-2px)",
                },
                "&:active": { transform: "scale(0.98)" },
              }}
            >
              {isLoading ? "Validating..." : "Enter Portal"}
            </Button>
          </Box>

          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255, 255, 255, 0.2)",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: '0.05em'
              }}
            >
              SYSTEM VERSION 2.0.4 • ENCRYPTED SESSION
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
