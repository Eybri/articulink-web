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
  Chip
} from "@mui/material"
import { 
  Menu as MenuIcon, 
  Notifications, 
  Search,
  Settings,
  Brightness4,
  Brightness7,
  AdminPanelSettings
} from "@mui/icons-material"

export default function Header({ currentDrawerWidth, handleDrawerToggle, title = "Dashboard Overview" }) {
  const theme = useTheme()

  return (
    <AppBar
      position="fixed"
      sx={{
        width: {
          xs: "100%",
          md: `calc(100% - ${currentDrawerWidth}px)`,
        },
        ml: {
          xs: 0,
          md: `${currentDrawerWidth}px`,
        },
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
            <AdminPanelSettings sx={{ fontSize: 20 }} />
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
              Real-time Analytics & Control Panel
            </Typography>
          </Box>
        </Box>

        {/* Status Chip */}
        <Chip
          label="Live"
          size="small"
          sx={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "white",
            fontWeight: 600,
            fontSize: "0.7rem",
            mr: 2,
            boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
            display: { xs: "none", sm: "flex" },
            "&::before": {
              content: '""',
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              marginRight: "6px",
              animation: "pulse 2s infinite",
            },
            "@keyframes pulse": {
              "0%": { opacity: 1 },
              "50%": { opacity: 0.5 },
              "100%": { opacity: 1 },
            },
          }}
        />

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
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  background: "rgba(100, 108, 255, 0.2)",
                  color: "#646cff",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 20px rgba(100, 108, 255, 0.3)",
                },
              }}
            >
              <Search sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {/* Theme Toggle */}
          <Tooltip title="Toggle Theme" arrow>
            <IconButton
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                width: 44,
                height: 44,
                display: { xs: "none", sm: "flex" },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  background: "rgba(255, 193, 7, 0.2)",
                  color: "#ffc107",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 20px rgba(255, 193, 7, 0.3)",
                },
              }}
            >
              <Brightness4 sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications (3 new)" arrow>
            <IconButton
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                width: 44,
                height: 44,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  background: "rgba(255, 107, 107, 0.2)",
                  color: "#ff6b6b",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 20px rgba(255, 107, 107, 0.3)",
                },
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
                    animation: "bounce 2s infinite",
                  },
                  "@keyframes bounce": {
                    "0%, 100%": { transform: "scale(1)" },
                    "50%": { transform: "scale(1.2)" },
                  },
                }}
              >
                <Notifications sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>

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

          {/* Quick Profile Avatar */}
          <Tooltip title="Profile Menu" arrow>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                background: "linear-gradient(135deg, #646cff 0%, #535bf2 100%)",
                boxShadow: "0 4px 16px rgba(100, 108, 255, 0.3)",
                border: "2px solid rgba(255, 255, 255, 0.1)",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                ml: 1,
                "&:hover": {
                  transform: "scale(1.1) translateY(-2px)",
                  boxShadow: "0 8px 32px rgba(100, 108, 255, 0.5)",
                  border: "2px solid rgba(100, 108, 255, 0.4)",
                },
              }}
            >
              A
            </Avatar>
          </Tooltip>
        </Box>

        {/* Floating Action Indicator */}
        <Box
          sx={{
            position: "absolute",
            bottom: -2,
            left: "50%",
            transform: "translateX(-50%)",
            width: 60,
            height: 2,
            background: "linear-gradient(90deg, transparent, #646cff, transparent)",
            borderRadius: 1,
            opacity: 0.7,
          }}
        />
      </Toolbar>
    </AppBar>
  )
}