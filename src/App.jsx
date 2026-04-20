// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard";
import UserList from "./pages/users";
import { SettingsPage as Settings } from "./pages/settings"; 
import Pronunciation from "./pages/features/pronunciation";
import PrivateRoute from "./components/PrivateRoute";
import AdminLayout from "./layouts/AdminLayout";
import { getUser, isAdmin } from "./api/api";

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user from localStorage on app start
    const storedUser = getUser();
    if (storedUser && isAdmin()) {
      setUser(storedUser);
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setSidebarMinimized(!sidebarMinimized);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={
          <PrivateRoute>
            <AdminLayout
              user={user}
              setUser={setUser}
              mobileOpen={mobileOpen}
              handleDrawerToggle={handleDrawerToggle}
              sidebarMinimized={sidebarMinimized}
              handleSidebarToggle={handleSidebarToggle}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={
                  <Dashboard user={user} setUser={setUser} />
                } />
                <Route path="/users" element={<UserList user={user} />} />
                <Route path="/settings" element={<Settings user={user} />} />
                <Route path="/pronunciation" element={<Pronunciation />} />
              </Routes>
            </AdminLayout>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}