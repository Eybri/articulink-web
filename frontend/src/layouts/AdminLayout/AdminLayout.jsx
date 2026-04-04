// src/layouts/AdminLayout/AdminLayout.jsx
import { Box } from "@mui/material";
import Header from "../../components/Header";
import Sidebar, { drawerWidth, miniDrawerWidth } from "../../components/Sidebar";

export default function AdminLayout({ 
  children, 
  user, 
  setUser, 
  mobileOpen, 
  handleDrawerToggle, 
  sidebarMinimized, 
  handleSidebarToggle 
}) {
  const currentDrawerWidth = sidebarMinimized ? miniDrawerWidth : drawerWidth;

  return (
    <Box 
      sx={{ 
        display: "flex", 
        minHeight: "100vh", 
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 100%)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.05) 0%, transparent 50%)
          `,
          zIndex: 0,
          pointerEvents: "none",
        },
      }}
    >
      <Header
        currentDrawerWidth={currentDrawerWidth}
        handleDrawerToggle={handleDrawerToggle}
        title="Admin Dashboard"
        user={user}
      />

      <Sidebar
        user={user}
        mobileOpen={mobileOpen}
        sidebarMinimized={sidebarMinimized}
        handleDrawerToggle={handleDrawerToggle}
        handleSidebarToggle={handleSidebarToggle}
        setUser={setUser}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: {
            xs: "100%",
            md: `calc(100% - ${currentDrawerWidth}px)`,
          },
          minWidth: 0,
          mt: { xs: 8, md: 8 },
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: "translateZ(0)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
