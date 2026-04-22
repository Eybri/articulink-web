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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050505",
        padding: { xs: 2, md: 0 },
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Background Effects */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at 0% 0%, rgba(100, 108, 255, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)
          `,
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column-reverse", md: "row" },
          width: "100%",
          maxWidth: "1100px",
          minHeight: { md: "600px" },
          borderRadius: 8,
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Left Side: Form (The "Page") */}
        <Box
          sx={{
            flex: 1,
            padding: { xs: 4, sm: 6, md: 8 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            background: "rgba(255, 255, 255, 0.02)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRight: "none",
            borderTopLeftRadius: 32,
            borderBottomLeftRadius: 32,
            animation: "swipeLeft 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            "@keyframes swipeLeft": {
              "0%": { transform: "translateX(50%)", opacity: 0 },
              "100%": { transform: "translateX(0)", opacity: 1 },
            },
          }}
        >
          <Box 
            sx={{ 
              maxWidth: "400px", 
              mx: "auto", 
              width: "100%",
              animation: "contentFade 0.5s ease-out 0.8s forwards",
              opacity: 0,
              "@keyframes contentFade": {
                "0%": { opacity: 0, transform: "translateY(10px)" },
                "100%": { opacity: 1, transform: "translateY(0)" }
              }
            }}
          >
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: "white",
                  mb: 1,
                  letterSpacing: "-0.02em",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Welcome Back
              </Typography>
              <Typography sx={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.95rem" }}>
                Admin access only. Please enter your credentials to manage the portal.
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 3 }}>
              {err && (
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: 3,
                    bgcolor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    color: "#fca5a5",
                  }}
                >
                  {err}
                </Alert>
              )}

              <TextField
                label="ADMIN ID"
                type="email"
                required
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                InputLabelProps={{ shrink: true }}
                sx={formControlStyles}
              />

              <TextField
                label="SECRET KEY"
                type={showPassword ? "text" : "password"}
                required
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        sx={{ color: "rgba(255, 255, 255, 0.3)" }}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={formControlStyles}
              />

              <Button
                variant="contained"
                type="submit"
                disabled={isLoading}
                fullWidth
                endIcon={!isLoading && <ArrowForward fontSize="small" />}
                sx={{
                  mt: 1,
                  py: 1.8,
                  borderRadius: 3,
                  background: "linear-gradient(135deg, #646cff 0%, #4c44e6 100%)",
                  boxShadow: "0 10px 30px -10px rgba(100, 108, 255, 0.5)",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #4c44e6 0%, #3f36d4 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 15px 40px -10px rgba(100, 108, 255, 0.6)",
                  },
                }}
              >
                {isLoading ? "Verifying..." : "Access Dashboard"}
              </Button>
            </Box>

            <Box sx={{ mt: 6, display: "flex", alignItems: "center", gap: 1.5, opacity: 0.3 }}>
              <SecurityOutlined sx={{ color: "white", fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: "white", fontWeight: 700, letterSpacing: "0.1em" }}>
                END-TO-END ENCRYPTED
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right Side: Logo & Branding (The "Cover") */}
        <Box
          sx={{
            flex: { md: 1.2 },
            padding: { xs: 6, md: 8 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            background: "rgba(100, 108, 255, 0.05)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderTopRightRadius: 32,
            borderBottomRightRadius: 32,
            animation: "swipeRight 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            "@keyframes swipeRight": {
              "0%": { transform: "translateX(-50%)", opacity: 0 },
              "100%": { transform: "translateX(0)", opacity: 1 },
            },
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              backgroundImage: 'url("/images/grid.png")', 
              backgroundSize: "20px 20px",
              opacity: 0.1,
            },
          }}
        >
          {/* Spine Effect */}
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "15px",
              background: "linear-gradient(90deg, rgba(0,0,0,0.4) 0%, transparent 100%)",
              zIndex: 2,
              display: { xs: "none", md: "block" },
            }}
          />

          <Box
            sx={{
              position: "relative",
              zIndex: 3,
              textAlign: "center",
              animation: "contentFade 0.5s ease-out 0.8s forwards",
              opacity: 0,
            }}
          >
            <Box
              component="img"
              src="/images/whitelogo.png"
              alt="ArticuLink Logo"
              sx={{
                width: { xs: 140, md: 200 },
                height: "auto",
                filter: "drop-shadow(0 0 30px rgba(100, 108, 255, 0.3))",
                mb: 4,
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 900,
                fontSize: { xs: "3rem", md: "4.5rem" },
                color: "white",
                letterSpacing: "-0.04em",
                lineHeight: 0.9,
                mb: 2,
              }}
            >
              ArticuLink
            </Typography>
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "1.1rem",
                fontWeight: 500,
                maxWidth: "320px",
                mx: "auto",
              }}
            >
              Precision clinical speech monitoring and management system.
            </Typography>
          </Box>

          <Box
            sx={{
              position: "absolute",
              bottom: 40,
              right: 40,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              padding: "8px 16px",
              borderRadius: "50px",
              bgcolor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              animation: "contentFade 0.5s ease-out 1s forwards",
              opacity: 0,
            }}
          >
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#10b981", boxShadow: "0 0 10px #10b981" }} />
            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.5)", fontWeight: 700, letterSpacing: "0.05em" }}>
              PRODUCTION
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

const formControlStyles = {
  "& .MuiOutlinedInput-root": {
    color: "white",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 3,
    transition: "all 0.3s ease",
    "& fieldset": {
      borderColor: "rgba(255, 255, 255, 0.08)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#646cff",
      borderWidth: "2px",
    },
    "& .MuiOutlinedInput-input": {
      py: 1.8,
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255, 255, 255, 0.3)",
    fontWeight: 700,
    fontSize: "0.75rem",
    letterSpacing: "0.1em",
    "&.Mui-focused": {
      color: "#646cff",
    },
    "&.MuiInputLabel-shrink": {
      transform: "translate(14px, -9px) scale(0.9)",
    },
  },
}
