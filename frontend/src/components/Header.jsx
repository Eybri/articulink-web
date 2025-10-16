"use client"

import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  useTheme, 
  Box,
  Badge,
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
  Notifications, 
  Search,
  Settings,
  Person,
  ManageAccounts
} from "@mui/icons-material"
import { useState, useEffect } from "react"
import { getUser } from "../api/api"

export default function Header({ 
  currentDrawerWidth, 
  handleDrawerToggle, 
  title = "Dashboard Overview",
  user: propUser 
}) {
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState(null)
  const [notificationsAnchor, setNotificationsAnchor] = useState(null)
  const [user, setUser] = useState(propUser)

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

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget)
  }

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null)
  }

  const handleProfile = () => {
    console.log("Navigate to profile")
    handleProfileMenuClose()
  }

  const handleSettings = () => {
    console.log("Navigate to settings")
    handleProfileMenuClose()
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

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "Admin User"
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
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
          {/* Search Button */}
          <Tooltip title="Search" arrow>
            <IconButton
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                width: 44,
                height: 44,
                "&:hover": {
                  background: "rgba(100, 108, 255, 0.2)",
                  color: "#646cff",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 20px rgba(100, 108, 255, 0.3)",
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <Search sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications" arrow>
            <IconButton
              onClick={handleNotificationsOpen}
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                width: 44,
                height: 44,
                "&:hover": {
                  background: "rgba(255, 107, 107, 0.2)",
                  color: "#ff6b6b",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 20px rgba(255, 107, 107, 0.3)",
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <Badge
                badgeContent={3}
                sx={{
                  "& .MuiBadge-badge": {
                    background: "linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)",
                    color: "white",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    minWidth: 18,
                    height: 18,
                    boxShadow: "0 2px 8px rgba(255, 107, 107, 0.4)",
                  },
                }}
              >
                <Notifications sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Notifications Menu */}
          <Menu
            anchorEl={notificationsAnchor}
            open={Boolean(notificationsAnchor)}
            onClose={handleNotificationsClose}
            PaperProps={{
              sx: {
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 3,
                mt: 1,
                minWidth: 300,
                "& .MuiMenuItem-root": {
                  fontFamily: "'Inter', sans-serif",
                  color: "rgba(255, 255, 255, 0.8)",
                  "&:hover": { background: "rgba(255, 255, 255, 0.05)" },
                },
              },
            }}
          >
            <MenuItem onClick={handleNotificationsClose}>
              <ListItemText primary="New user registration" secondary="5 minutes ago" />
            </MenuItem>
            <MenuItem onClick={handleNotificationsClose}>
              <ListItemText primary="System update available" secondary="1 hour ago" />
            </MenuItem>
            <MenuItem onClick={handleNotificationsClose}>
              <ListItemText primary="Performance alert" secondary="2 hours ago" />
            </MenuItem>
          </Menu>

          {/* Settings */}
          <Tooltip title="Settings" arrow>
            <IconButton
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

          {/* Profile Avatar with Menu */}
          <Tooltip title="Profile Menu" arrow>
            <Avatar
              onClick={handleProfileMenuOpen}
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
                cursor: "pointer",
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

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              sx: {
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 3,
                mt: 1,
                minWidth: 220,
                "& .MuiMenuItem-root": {
                  fontFamily: "'Inter', sans-serif",
                  color: "rgba(255, 255, 255, 0.8)",
                  "&:hover": { background: "rgba(255, 255, 255, 0.05)" },
                },
              },
            }}
          >
            {/* User Info Section */}
            <MenuItem disabled>
              <ListItemText 
                primary={getUserDisplayName()}
                secondary={user?.email || "Admin User"}
                primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: 600 }}
                secondaryTypographyProps={{ 
                  fontSize: "0.75rem", 
                  color: "rgba(255, 255, 255, 0.6)" 
                }}
              />
            </MenuItem>
            
            <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)", my: 1 }} />

            {/* Menu Items */}
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <Person sx={{ color: "#646cff", fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText>My Profile</ListItemText>
            </MenuItem>

            <MenuItem onClick={handleSettings}>
              <ListItemIcon>
                <ManageAccounts sx={{ color: "#10b981", fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText>Account Settings</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}