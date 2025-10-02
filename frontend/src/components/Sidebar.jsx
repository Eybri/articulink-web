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
  Chip,
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
  NotificationsActive,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"

const drawerWidth = 280
const miniDrawerWidth = 80

export default function Sidebar({
  user,
  mobileOpen,
  sidebarMinimized,
  handleDrawerToggle,
  handleSidebarToggle,
  setUser, // Changed from logout to setUser
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const navigate = useNavigate()
  const currentDrawerWidth = sidebarMinimized ? miniDrawerWidth : drawerWidth

  // Logout function inside the component
  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    setUser(null) // Clear user state
    navigate("/login") // Navigate to login page
  }

  const menuItems = [
    { 
      text: "Dashboard", 
      icon: <DashboardIcon />, 
      active: true,
      badge: null
    },
    { 
      text: "Analytics", 
      icon: <Analytics />,
      active: false,
      badge: null
    },
    { 
      text: "Users", 
      icon: <People />,
      active: false,
      badge: "1.2K"
    },
    { 
      text: "Pronunciation", 
      icon: <VolumeUp />,
      active: false,
      badge: null
    },
    { 
      text: "Reports", 
      icon: <Assessment />,
      active: false,
      badge: "New"
    },
    { 
      text: "Settings", 
      icon: <Settings />,
      active: false,
      badge: null
    },
  ]

  const drawer = (
    <Box 
      sx={{ 
        height: "100%", 
        background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
        color: "white", 
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 50% 0%, rgba(100, 108, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 0% 50%, rgba(255, 119, 198, 0.05) 0%, transparent 50%)
          `,
          pointerEvents: "none",
        },
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
          position: "relative",
          background: "rgba(255, 255, 255, 0.02)",
          backdropFilter: "blur(10px)",
        }}
      >
        {!sidebarMinimized && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
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
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              <AdminPanelSettings sx={{ fontSize: 12 }} />
              Admin Dashboard
            </Typography>
          </Box>
        )}
        
        {!isMobile && (
          <Tooltip 
            title={sidebarMinimized ? "Expand Sidebar" : "Minimize Sidebar"} 
            placement="right"
          >
            <IconButton
              onClick={handleSidebarToggle}
              sx={{
                color: "#646cff",
                background: "rgba(100, 108, 255, 0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(100, 108, 255, 0.2)",
                width: 36,
                height: 36,
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "rgba(100, 108, 255, 0.2)",
                  transform: "scale(1.1)",
                  boxShadow: "0 4px 20px rgba(100, 108, 255, 0.3)",
                },
              }}
            >
              {sidebarMinimized ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Navigation Menu */}
      <List sx={{ pt: 3, px: 2 }}>
        {menuItems.map((item, index) => (
          <Tooltip 
            key={item.text} 
            title={sidebarMinimized ? item.text : ""} 
            placement="right" 
            arrow
          >
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
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  background: item.active 
                    ? "linear-gradient(135deg, #535bf2 0%, #4c44e6 100%)" 
                    : "rgba(255, 255, 255, 0.05)",
                  transform: sidebarMinimized ? "scale(1.1)" : "translateX(8px)",
                  boxShadow: item.active 
                    ? "0 8px 32px rgba(100, 108, 255, 0.4)" 
                    : "0 4px 16px rgba(255, 255, 255, 0.1)",
                },
                "&::before": item.active ? {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "linear-gradient(45deg, rgba(255,255,255,0.1), transparent)",
                  pointerEvents: "none",
                } : {},
              }}
            >
              <ListItemIcon
                sx={{
                  color: item.active ? "white" : "#646cff",
                  minWidth: sidebarMinimized ? "auto" : 40,
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                  "& svg": {
                    filter: item.active ? "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" : "none",
                  },
                }}
              >
                {item.icon}
              </ListItemIcon>
              
              {!sidebarMinimized && (
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
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
                      {item.badge && (
                        <Chip
                          label={item.badge}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            background: item.active 
                              ? "rgba(255, 255, 255, 0.2)" 
                              : "linear-gradient(135deg, #646cff 0%, #535bf2 100%)",
                            color: "white",
                            border: "none",
                            "& .MuiChip-label": {
                              px: 1,
                            },
                          }}
                        />
                      )}
                    </Box>
                  }
                />
              )}
              
              {/* Active indicator */}
              {item.active && (
                <Box
                  sx={{
                    position: "absolute",
                    right: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 3,
                    height: 20,
                    background: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "2px 0 0 2px",
                  }}
                />
              )}
            </ListItem>
          </Tooltip>
        ))}
      </List>

      {/* User Profile Section */}
      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          left: 0,
          right: 0,
          px: sidebarMinimized ? 1 : 2,
        }}
      >
        <Divider 
          sx={{ 
            bgcolor: "rgba(255, 255, 255, 0.1)", 
            mb: 3,
            mx: sidebarMinimized ? 1 : 0,
          }} 
        />
        
        {!sidebarMinimized ? (
          <Box>
            {/* User Info Card */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                p: 2.5,
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                mb: 2,
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "1px",
                  background: "linear-gradient(90deg, transparent, #646cff, transparent)",
                },
              }}
            >
              <Avatar 
                sx={{ 
                  width: 42, 
                  height: 42, 
                  mr: 2, 
                  background: "linear-gradient(135deg, #646cff 0%, #535bf2 100%)",
                  boxShadow: "0 4px 16px rgba(100, 108, 255, 0.3)",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                }}
              >
                {user?.email?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "white",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    fontFamily: "'Inter', sans-serif",
                    mb: 0.5,
                  }}
                >
                  {user?.email?.split('@')[0] || 'Admin'}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#10b981",
                      boxShadow: "0 0 8px rgba(16, 185, 129, 0.6)",
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255, 255, 255, 0.6)",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.75rem",
                    }}
                  >
                    Online • Administrator
                  </Typography>
                </Box>
              </Box>
              <Tooltip title="Notifications" placement="top">
                <IconButton
                  size="small"
                  sx={{
                    color: "#646cff",
                    "&:hover": {
                      background: "rgba(100, 108, 255, 0.1)",
                    },
                  }}
                >
                  <NotificationsActive sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
            
            {/* Logout Button */}
            <Button
              onClick={logout} // Using the internal logout function
              startIcon={<Logout />}
              fullWidth
              sx={{
                color: "#ff6b6b",
                border: "1px solid rgba(255, 107, 107, 0.3)",
                background: "rgba(255, 107, 107, 0.05)",
                backdropFilter: "blur(10px)",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                py: 1.5,
                borderRadius: 3,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  background: "linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)",
                  color: "white",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(255, 107, 107, 0.4)",
                  border: "1px solid #ff6b6b",
                },
              }}
            >
              Sign Out
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <Tooltip title={`${user?.email?.split('@')[0] || 'Admin'} (Online)`} placement="right" arrow>
              <Avatar 
                sx={{ 
                  width: 44, 
                  height: 44, 
                  background: "linear-gradient(135deg, #646cff 0%, #535bf2 100%)",
                  boxShadow: "0 4px 16px rgba(100, 108, 255, 0.3)",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  border: "2px solid rgba(16, 185, 129, 0.5)",
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#10b981",
                    border: "2px solid #0a0a0a",
                    boxShadow: "0 0 8px rgba(16, 185, 129, 0.6)",
                  },
                }}
              >
                {user?.email?.charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>
            
            <Tooltip title="Notifications" placement="right" arrow>
              <IconButton
                sx={{
                  color: "#646cff",
                  background: "rgba(100, 108, 255, 0.1)",
                  border: "1px solid rgba(100, 108, 255, 0.2)",
                  width: 40,
                  height: 40,
                  "&:hover": {
                    background: "rgba(100, 108, 255, 0.2)",
                    transform: "scale(1.1)",
                  },
                }}
              >
                <NotificationsActive sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Sign Out" placement="right" arrow>
              <IconButton
                onClick={logout} // Using the internal logout function
                sx={{
                  color: "#ff6b6b",
                  background: "rgba(255, 107, 107, 0.1)",
                  border: "1px solid rgba(255, 107, 107, 0.3)",
                  width: 40,
                  height: 40,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)",
                    color: "white",
                    transform: "scale(1.1)",
                    boxShadow: "0 4px 16px rgba(255, 107, 107, 0.4)",
                  },
                }}
              >
                <Logout sx={{ fontSize: 18 }} />
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
            transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            overflow: "hidden",
            boxShadow: "4px 0 20px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  )
}

export { drawerWidth, miniDrawerWidth }