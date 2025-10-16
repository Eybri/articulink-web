"use client"

import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  IconButton,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
} from "@mui/material"
import {
  Dashboard as DashboardIcon,
  Analytics,
  People,
  Settings,
  Logout,
  VolumeUp,
  Assessment,
  ChevronLeft,
  ChevronRight,
  AdminPanelSettings,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { logout, getUser } from "../api/api"
import { useState, useEffect } from "react"

const drawerWidth = 280
const miniDrawerWidth = 80

export default function Sidebar({
  user: propUser,
  mobileOpen,
  sidebarMinimized,
  handleDrawerToggle,
  handleSidebarToggle,
  setUser,
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const navigate = useNavigate()
  const [user, setLocalUser] = useState(propUser)
  const currentDrawerWidth = sidebarMinimized ? miniDrawerWidth : drawerWidth

  // Sync with prop changes and localStorage
  useEffect(() => {
    if (propUser) {
      setLocalUser(propUser)
    } else {
      // Fallback to localStorage if prop is not available
      const storedUser = getUser()
      if (storedUser) {
        setLocalUser(storedUser)
      }
    }
  }, [propUser])

  const handleLogout = () => {
    logout()
    setUser(null)
    navigate("/login")
  }

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, active: true },
    { text: "Analytics", icon: <Analytics />, active: false },
    { text: "Users", icon: <People />, active: false },
    { text: "Pronunciation", icon: <VolumeUp />, active: false },
    { text: "Reports", icon: <Assessment />, active: false },
    { text: "Settings", icon: <Settings />, active: false },
  ]

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "Admin"
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    if (user.email) {
      return user.email.split('@')[0]
    }
    return "Admin"
  }

  // Get user email
  const getUserEmail = () => {
    return user?.email || "admin@articulink.com"
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "A"
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }
    if (user.email) {
      return user.email[0].toUpperCase()
    }
    return "A"
  }

  const drawer = (
    <Box 
      sx={{ 
        height: "100%", 
        background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
        color: "white", 
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          p: sidebarMinimized ? 1.5 : 3,
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: sidebarMinimized ? "center" : "space-between",
          background: "rgba(255, 255, 255, 0.02)",
          backdropFilter: "blur(10px)",
        }}
      >
        {!sidebarMinimized && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                background: "linear-gradient(135deg, #646cff 0%, #535bf2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(100, 108, 255, 0.3)",
              }}
            >
              <AdminPanelSettings sx={{ fontSize: 20, color: "white" }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #fff 0%, #646cff 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              ArticuLink
            </Typography>
          </Box>
        )}
        
        {!isMobile && (
          <Tooltip title={sidebarMinimized ? "Expand" : "Minimize"} placement="right">
            <IconButton
              onClick={handleSidebarToggle}
              sx={{
                color: "#646cff",
                background: "rgba(100, 108, 255, 0.1)",
                border: "1px solid rgba(100, 108, 255, 0.2)",
                "&:hover": {
                  background: "rgba(100, 108, 255, 0.2)",
                  transform: "scale(1.1)",
                },
              }}
            >
              {sidebarMinimized ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Navigation Menu */}
      <List sx={{ pt: 3, px: 2, flex: 1 }}>
        {menuItems.map((item) => (
          <Tooltip key={item.text} title={sidebarMinimized ? item.text : ""} placement="right">
            <ListItem
              sx={{
                mb: 1,
                borderRadius: 3,
                background: item.active 
                  ? "linear-gradient(135deg, #646cff 0%, #535bf2 100%)" 
                  : "transparent",
                justifyContent: sidebarMinimized ? "center" : "flex-start",
                px: sidebarMinimized ? 1 : 2.5,
                py: 1.5,
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: item.active 
                    ? "linear-gradient(135deg, #535bf2 0%, #4c44e6 100%)" 
                    : "rgba(255, 255, 255, 0.05)",
                  transform: sidebarMinimized ? "scale(1.1)" : "translateX(8px)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: item.active ? "white" : "#646cff",
                  minWidth: sidebarMinimized ? "auto" : 40,
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>
              
              {!sidebarMinimized && (
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontWeight: item.active ? 700 : 500,
                        fontSize: "0.9rem",
                        fontFamily: "'Inter', sans-serif",
                        color: item.active ? "white" : "rgba(255, 255, 255, 0.8)",
                      }}
                    >
                      {item.text}
                    </Typography>
                  }
                />
              )}
            </ListItem>
          </Tooltip>
        ))}
      </List>

      {/* User & Logout Section */}
      <Box sx={{ p: sidebarMinimized ? 1 : 2 }}>
        <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.1)", mb: 2 }} />
        
        {!sidebarMinimized ? (
          <Box>
            {/* User Info */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, p: 2, borderRadius: 3, background: "rgba(255, 255, 255, 0.03)" }}>
              <Avatar 
                sx={{ 
                  width: 42, 
                  height: 42, 
                  mr: 2, 
                  background: user?.profile_pic 
                    ? "transparent"
                    : "linear-gradient(135deg, #646cff 0%, #535bf2 100%)",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                }}
                src={user?.profile_pic}
              >
                {getUserInitials()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ color: "white", fontSize: "0.9rem", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                  {getUserDisplayName()}
                </Typography>
                <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.75rem", fontFamily: "'Inter', sans-serif" }}>
                  {getUserEmail()}
                </Typography>
              </Box>
            </Box>
            
            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              startIcon={<Logout />}
              fullWidth
              sx={{
                color: "#ff6b6b",
                border: "1px solid rgba(255, 107, 107, 0.3)",
                background: "rgba(255, 107, 107, 0.05)",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                py: 1.5,
                borderRadius: 3,
                "&:hover": {
                  background: "linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)",
                  color: "white",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Sign Out
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            {/* User Avatar */}
            <Tooltip title={getUserDisplayName()} placement="right">
              <Avatar 
                sx={{ 
                  width: 44, 
                  height: 44, 
                  background: user?.profile_pic 
                    ? "transparent"
                    : "linear-gradient(135deg, #646cff 0%, #535bf2 100%)",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                }}
                src={user?.profile_pic}
              >
                {getUserInitials()}
              </Avatar>
            </Tooltip>
            
            {/* Logout Button */}
            <Tooltip title="Sign Out" placement="right">
              <IconButton
                onClick={handleLogout}
                sx={{
                  color: "#ff6b6b",
                  background: "rgba(255, 107, 107, 0.1)",
                  border: "1px solid rgba(255, 107, 107, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)",
                    color: "white",
                    transform: "scale(1.1)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <Logout />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  )

  return (
    <Box
      component="nav"
      sx={{
        width: { md: currentDrawerWidth },
        flexShrink: { md: 0 },
        zIndex: theme.zIndex.drawer,
      }}
    >
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: isMobile ? drawerWidth : currentDrawerWidth,
            border: "none",
            transition: "width 0.3s ease",
            overflow: "hidden",
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  )
}

export { drawerWidth, miniDrawerWidth }