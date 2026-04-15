"use client"

import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  useTheme, 
  Box,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from "@mui/material"
import { 
  Menu as MenuIcon, 
  Settings,
  Person,
  ManageAccounts
} from "@mui/icons-material"
import { useState, useEffect } from "react"
import { getUser } from "../api/api"
import { useNavigate, useLocation } from "react-router-dom";

export default function Header({ 
  currentDrawerWidth, 
  handleDrawerToggle, 
  title = "Dashboard Overview",
  user: propUser 
}) {
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState(null)
  const [user, setUser] = useState(propUser)
  const navigate = useNavigate();
  const location = useLocation();

  // Sync with prop changes and localStorage
  useEffect(() => {
    if (propUser) {
      setUser(propUser)
    } else {
      // Fallback to localStorage if prop is not available
      const storedUser = getUser()
      if (storedUser) {
        setUser(storedUser)
      }
    }
  }, [propUser])

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleSettings = () => {
    navigate('/settings');
    handleProfileMenuClose()
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "A"
    if (user.username) {
      return user.username.slice(0, 2).toUpperCase()
    }
    if (user.email) {
      return user.email[0].toUpperCase()
    }
    return "A"
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "Admin User"
    if (user.username) {
      return user.username
    }
    if (user.email) {
      return user.email.split('@')[0]
    }
    return "Admin User"
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { xs: "100%", md: `calc(100% - ${currentDrawerWidth}px)` },
        ml: { xs: 0, md: `${currentDrawerWidth}px` },
        background: "rgba(255, 255, 255, 0.02)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: theme.zIndex.drawer + 1,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: "linear-gradient(90deg, transparent, #646cff, #10b981, transparent)",
          opacity: 0.6,
        },
      }}
    >
      <Toolbar sx={{ minHeight: "70px !important", px: { xs: 2, md: 3 } }}>
        {/* Mobile Menu Button */}
        <IconButton
          color="inherit"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            mr: 2,
            display: { md: "none" },
            color: "rgba(255, 255, 255, 0.8)",
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            "&:hover": {
              background: "rgba(255, 255, 255, 0.1)",
              transform: "scale(1.05)",
            },
            transition: "all 0.2s ease",
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Title Section */}
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              background: "linear-gradient(135deg, #646cff20, #646cff10)",
              color: "#646cff",
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Person sx={{ fontSize: 20 }} />
          </Box>
          
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #fff 0%, #646cff 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Poppins', sans-serif",
                lineHeight: 1.2,
                mb: 0.5,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: { xs: "none", sm: "block" },
              }}
            >
              Welcome, {getUserDisplayName()}
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Settings Button - Now clickable to navigate to /settings */}
          <Tooltip title="Settings" arrow>
            <IconButton
              onClick={handleSettings}
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                width: 44,
                height: 44,
                display: { xs: "none", md: "flex" },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  background: "rgba(156, 163, 175, 0.2)",
                  color: "#9ca3af",
                  transform: "translateY(-2px) rotate(90deg)",
                  boxShadow: "0 4px 20px rgba(156, 163, 175, 0.3)",
                },
              }}
            >
              <Settings sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {/* Profile Avatar - Removed onClick, not clickable anymore */}
          <Tooltip title="Profile" arrow>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                background: user?.profile_pic 
                  ? "transparent"
                  : "linear-gradient(135deg, #646cff 0%, #535bf2 100%)",
                boxShadow: "0 4px 16px rgba(100, 108, 255, 0.3)",
                border: "2px solid rgba(255, 255, 255, 0.1)",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: "default", // Changed from pointer to default
                "&:hover": {
                  transform: "scale(1.1) translateY(-2px)",
                  boxShadow: "0 8px 32px rgba(100, 108, 255, 0.5)",
                  border: "2px solid rgba(100, 108, 255, 0.4)",
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                ml: 1,
              }}
              src={user?.profile_pic}
            >
              {getUserInitials()}
            </Avatar>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  )
}