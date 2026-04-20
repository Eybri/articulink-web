// src/pages/Settings.jsx
import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  Chip,
} from "@mui/material"
import {
  Edit,
  CameraAlt,
  Delete,
  Save,
  Cancel,
  Person,
  Email,
  Cake,
  Male,
  Female,
  Transgender,
  Lock,
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  Schedule,
} from "@mui/icons-material"
import { authAPI } from "../../api/api"

export default function Settings({ user: initialUser }) {
  const [user, setUser] = useState(initialUser)
  const [loading, setLoading] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  })
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)

  const [profileData, setProfileData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    birthdate: "",
    gender: ""
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (user) {
      // Format birthdate for input field (YYYY-MM-DD)
      const formattedBirthdate = safeFormatDateForInput(user.birthdate)
      
      setProfileData({
        username: user.username || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        birthdate: formattedBirthdate,
        gender: user.gender || ""
      })
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const profile = await authAPI.getProfile()
      setUser(profile)
      
      // Format birthdate for input field
      const formattedBirthdate = safeFormatDateForInput(profile.birthdate)
      
      setProfileData({
        username: profile.username || "",
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        birthdate: formattedBirthdate,
        gender: profile.gender || ""
      })
    } catch (err) {
      setError("Failed to load profile")
      console.error('Profile fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditModalOpen(true)
    setError("")
    setSuccess("")
  }

  const handleCancel = () => {
    setEditModalOpen(false)
    // Format birthdate for input field when canceling
    const formattedBirthdate = safeFormatDateForInput(user.birthdate)
    
    setProfileData({
      username: user.username || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      birthdate: formattedBirthdate,
      gender: user.gender || ""
    })
    setError("")
    setSuccess("")
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Prepare update data - handle empty strings by converting to null
      const updateData = {
        username: profileData.username?.trim() || null,
        first_name: profileData.first_name?.trim() || null,
        last_name: profileData.last_name?.trim() || null,
        gender: profileData.gender || null,
      }

      // Only include birthdate if it's not empty and is valid
      if (profileData.birthdate) {
        // Validate date format
        const date = new Date(profileData.birthdate)
        if (!isNaN(date.getTime())) {
          updateData.birthdate = profileData.birthdate
        } else {
          setError("Invalid date format")
          setLoading(false)
          return
        }
      } else {
        updateData.birthdate = null
      }

      console.log('Sending update data:', updateData)

      const updatedUser = await authAPI.updateProfile(updateData)
      console.log('Received updated user:', updatedUser)
      
      setUser(updatedUser)
      setEditModalOpen(false)
      setSuccess("Profile updated successfully")
      
      // Update localStorage user data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const updatedUserData = {
        ...currentUser,
        username: updatedUser.username,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        profile_pic: updatedUser.profile_pic,
        birthdate: updatedUser.birthdate,
        gender: updatedUser.gender
      }
      localStorage.setItem('user', JSON.stringify(updatedUserData))
      
      // Refresh the profile data to ensure consistency
      setTimeout(() => {
        fetchProfile()
      }, 100)
      
    } catch (err) {
      console.error('Update error:', err)
      setError(err.response?.data?.detail || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file")
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB")
      return
    }

    try {
      setLoading(true)
      setError("")
      const updatedUser = await authAPI.uploadProfilePicture(file)
      setUser(updatedUser)
      setSuccess("Profile picture updated successfully")
      
      // Update localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        profile_pic: updatedUser.profile_pic
      }))
      
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.response?.data?.detail || "Failed to upload profile picture")
    } finally {
      setLoading(false)
      // Reset file input
      event.target.value = ""
    }
  }

  const handleDeleteProfilePicture = async () => {
    try {
      setLoading(true)
      setError("")
      await authAPI.deleteProfilePicture()
      
      // Update local state
      const updatedUser = { ...user, profile_pic: null }
      setUser(updatedUser)
      setDeleteDialogOpen(false)
      setSuccess("Profile picture deleted successfully")
      
      // Update localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        profile_pic: null
      }))
      
    } catch (err) {
      console.error('Delete error:', err)
      setError(err.response?.data?.detail || "Failed to delete profile picture")
    } finally {
      setLoading(false)
    }
  }

  // ============= PASSWORD FUNCTIONS =============
  const handlePasswordChange = async () => {
    // Validate passwords
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      setPasswordError("All fields are required")
      return
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError("New passwords do not match")
      return
    }

    if (passwordData.new_password.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return
    }

    try {
      setPasswordLoading(true)
      setPasswordError("")
      setPasswordSuccess("")

      // Call API to change password
      // Note: You'll need to add this endpoint in your backend
      const response = await authAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password
      })

      setPasswordSuccess("Password changed successfully")
      
      // Clear password fields
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: ""
      })

    } catch (err) {
      console.error('Password change error:', err)
      setPasswordError(err.response?.data?.detail || "Failed to change password")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleOpenPasswordModal = () => {
    setPasswordModalOpen(true)
    setPasswordError("")
    setPasswordSuccess("")
    setPasswordData({
      current_password: "",
      new_password: "",
      confirm_password: ""
    })
  }

  const handleClosePasswordModal = () => {
    if (!passwordLoading) {
      setPasswordModalOpen(false)
    }
  }

  const handleTogglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase()
  }

  const getGenderIcon = (gender) => {
    switch (gender?.toLowerCase()) {
      case 'male':
        return <Male />
      case 'female':
        return <Female />
      case 'other':
        return <Transgender />
      default:
        return <Person />
    }
  }

  const safeFormatDateForInput = (dateString) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""
      return date.toISOString().split('T')[0]
    } catch {
      return ""
    }
  }

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "Not set"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Not set"
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return "Invalid date"
    }
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header Section */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 800,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
            background: "linear-gradient(135deg, #fff 0%, #646cff 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 0.5,
            letterSpacing: "-0.02em",
          }}
        >
          Account Settings
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "rgba(255, 255, 255, 0.5)",
            fontFamily: "'Inter', sans-serif",
            fontSize: { xs: '0.875rem', md: '1rem' },
          }}
        >
          Manage your personal information and security
        </Typography>
      </Box>

      {/* Notifications */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={{ xs: 3, md: 4 }}>
        {/* Profile Picture Section */}
        <Grid item size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              p: { xs: 3, md: 4 },
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 4,
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: "linear-gradient(90deg, #646cff, #10b981, transparent)",
              },
            }}
          >
            <Box sx={{ position: "relative", display: "inline-block", mb: 3 }}>
              <Avatar
                sx={{
                  width: { xs: 100, sm: 120 },
                  height: { xs: 100, sm: 120 },
                  bgcolor: "rgba(100, 108, 255, 0.2)",
                  color: "#646cff",
                  fontWeight: 700,
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                  border: "3px solid rgba(255, 255, 255, 0.1)",
                }}
                src={user?.profile_pic}
              >
                {getInitials(user?.first_name, user?.last_name)}
              </Avatar>
              
              {/* Upload Button */}
              <IconButton
                component="label"
                size="small"
                sx={{
                  position: "absolute",
                  bottom: 5,
                  right: 5,
                  bgcolor: "#646cff",
                  color: "white",
                  p: 1,
                  boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                  "&:hover": {
                    bgcolor: "#5058e5",
                  },
                }}
              >
                <CameraAlt fontSize="small" />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                />
              </IconButton>
            </Box>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "white",
                fontSize: "1.1rem",
                mb: 0.5,
              }}
            >
              {user?.first_name} {user?.last_name}
            </Typography>
            
            <Chip 
              label={user?.role === 'admin' ? 'Administrator' : 'User'} 
              size="small"
              sx={{ 
                bgcolor: user?.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(100, 108, 255, 0.1)',
                color: user?.role === 'admin' ? '#ef4444' : '#646cff',
                fontWeight: 700,
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                mb: 3
              }}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255, 255, 255, 0.4)",
                  fontSize: "0.75rem",
                  fontWeight: 500
                }}
              >
                Birthdate: {formatDisplayDate(user?.birthdate)}
              </Typography>
            </Box>

            {user?.profile_pic && (
              <Button
                fullWidth
                size="small"
                startIcon={<Delete sx={{ fontSize: '1rem !important' }} />}
                onClick={() => setDeleteDialogOpen(true)}
                sx={{
                  color: "rgba(239, 68, 68, 0.6)",
                  bgcolor: "transparent",
                  border: "1px solid rgba(239, 68, 68, 0.12)",
                  textTransform: 'uppercase',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  borderRadius: 2,
                  py: 1,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    color: "#ef4444",
                    background: "rgba(239, 68, 68, 0.08)",
                    borderColor: "rgba(239, 68, 68, 0.3)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.1)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  }
                }}
              >
                Remove Profile Photo
              </Button>
            )}
          </Paper>
        </Grid>

        {/* Profile Information Section */}
        <Grid item size={{ xs: 12, md: 8 }}>
          <Paper
            sx={{
              p: { xs: 3, md: 4 },
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 4,
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: "linear-gradient(90deg, #10b981, #f59e0b, transparent)",
              },
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  Personal Information
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.3)", fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Base Profile Details
                </Typography>
              </Box>
              
              <Button
                startIcon={<Edit />}
                onClick={handleEdit}
                size="small"
                sx={{
                  color: "#646cff",
                  px: 2,
                  bgcolor: "rgba(100, 108, 255, 0.1)",
                  fontWeight: 600,
                  textTransform: 'none',
                  border: "1px solid rgba(100, 108, 255, 0.2)",
                  "&:hover": { bgcolor: "rgba(100, 108, 255, 0.2)" }
                }}
              >
                Update Details
              </Button>
            </Box>

            {loading && <LinearProgress sx={{ mb: 3, height: 2, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #646cff, #10b981)' } }} />}

            <Grid container spacing={{ xs: 3, md: 4 }}>
              {/* Email */}
              <Grid item size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.3)", fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Email Address
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1.5 }}>
                  <Email sx={{ color: '#646cff', fontSize: '1.2rem' }} />
                  <Typography sx={{ color: 'white', fontSize: '0.9rem', fontWeight: 500 }}>
                    {user?.email || "No email set"}
                  </Typography>
                </Box>
              </Grid>

              {/* Name */}
              <Grid item size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.3)", fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Full Name
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1.5 }}>
                  <Person sx={{ color: '#646cff', fontSize: '1.2rem' }} />
                  <Typography sx={{ color: 'white', fontSize: '0.9rem', fontWeight: 500 }}>
                    {user?.first_name} {user?.last_name}
                  </Typography>
                </Box>
              </Grid>

              {/* Birthdate */}
              <Grid item size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.3)", fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Date of Birth
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1.5 }}>
                  <Cake sx={{ color: '#10b981', fontSize: '1.2rem' }} />
                  <Typography sx={{ color: 'white', fontSize: '0.9rem', fontWeight: 500 }}>
                    {formatDisplayDate(user?.birthdate)}
                  </Typography>
                </Box>
              </Grid>

              {/* Gender */}
              <Grid item size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.3)", fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Gender
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1.5 }}>
                  <Box sx={{ color: '#f59e0b', display: 'flex' }}>
                    {getGenderIcon(user?.gender)}
                  </Box>
                  <Typography sx={{ color: 'white', fontSize: '0.9rem', fontWeight: 500, textTransform: 'capitalize' }}>
                    {user?.gender || "Not specified"}
                  </Typography>
                </Box>
              </Grid>

              {/* Role */}
              <Grid item size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.3)", fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Security Role
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1.5 }}>
                  <AdminPanelSettings sx={{ color: '#ef4444', fontSize: '1.2rem' }} />
                  <Typography sx={{ color: 'white', fontSize: '0.9rem', fontWeight: 500, textTransform: 'capitalize' }}>
                    {user?.role || "user"}
                  </Typography>
                </Box>
              </Grid>

              {/* Joined Date */}
              <Grid item size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.3)", fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Registration
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1.5 }}>
                  <Schedule sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.2rem' }} />
                  <Typography sx={{ color: 'white', fontSize: '0.9rem', fontWeight: 500 }}>
                    {formatDisplayDate(user?.created_at)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Password Management */}
      <Box sx={{ mt: 6, mb: 4, textAlign: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<Lock />}
          onClick={handleOpenPasswordModal}
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            borderColor: "rgba(255, 255, 255, 0.08)",
            px: { xs: 3, md: 5 },
            py: 1.5,
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 600,
            background: "rgba(255, 255, 255, 0.02)",
            "&:hover": {
              borderColor: "#646cff",
              color: 'white',
              background: "rgba(100, 108, 255, 0.08)",
            }
          }}
        >
          Manage Security Credentials
        </Button>
      </Box>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordModalOpen}
        onClose={handleClosePasswordModal}
        PaperProps={{
          sx: {
            background: "rgba(20, 20, 30, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "white",
            minWidth: { xs: '90%', sm: 450 },
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontFamily: "'Poppins', sans-serif", mt: 1 }}>
          Update Password
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.6)", mb: 3 }}>
            Please enter your current password and choose a new secure password.
          </Typography>

          {/* Password notifications */}
          {passwordError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {passwordError}
            </Alert>
          )}
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {passwordSuccess}
            </Alert>
          )}

          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              type={showPassword.current ? 'text' : 'password'}
              label="Current Password"
              value={passwordData.current_password}
              onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
              disabled={passwordLoading}
              InputProps={{
                startAdornment: <Lock sx={{ color: "rgba(255, 255, 255, 0.5)", mr: 1 }} />,
                endAdornment: (
                  <IconButton
                    onClick={() => handleTogglePasswordVisibility('current')}
                    edge="end"
                    sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    {showPassword.current ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                )
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)" },
                  "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                  "&.Mui-focused fieldset": { borderColor: "#646cff" },
                },
                "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
              }}
            />

            <TextField
              fullWidth
              type={showPassword.new ? 'text' : 'password'}
              label="New Password"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
              disabled={passwordLoading}
              InputProps={{
                startAdornment: <Lock sx={{ color: "rgba(255, 255, 255, 0.5)", mr: 1 }} />,
                endAdornment: (
                  <IconButton
                    onClick={() => handleTogglePasswordVisibility('new')}
                    edge="end"
                    sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    {showPassword.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                )
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)" },
                  "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                  "&.Mui-focused fieldset": { borderColor: "#646cff" },
                },
                "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
              }}
            />

            <TextField
              fullWidth
              type={showPassword.confirm ? 'text' : 'password'}
              label="Confirm New Password"
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
              disabled={passwordLoading}
              InputProps={{
                startAdornment: <Lock sx={{ color: "rgba(255, 255, 255, 0.5)", mr: 1 }} />,
                endAdornment: (
                  <IconButton
                    onClick={() => handleTogglePasswordVisibility('confirm')}
                    edge="end"
                    sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                )
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)" },
                  "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                  "&.Mui-focused fieldset": { borderColor: "#646cff" },
                },
                "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
              }}
            />

            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mt: 1 }}>
              Password must be at least 6 characters long
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, mt: 1 }}>
          <Button onClick={handleClosePasswordModal} sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
            Cancel
          </Button>
          <Button
            onClick={handlePasswordChange}
            disabled={passwordLoading}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #646cff 0%, #535bf2 100%)",
              color: 'white',
              px: 3,
              '&:hover': {
                background: "linear-gradient(135deg, #535bf2 0%, #4c44e6 100%)",
              }
            }}
          >
            {passwordLoading ? "Updating..." : "Update Password"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Profile Picture Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "white",
          }
        }}
      >
        <DialogTitle>Remove Profile Picture</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
            Are you sure you want to remove your profile picture? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            sx={{ color: "rgba(255, 255, 255, 0.7)" }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteProfilePicture} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            Remove Picture
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog
        open={editModalOpen}
        onClose={handleCancel}
        PaperProps={{
          sx: {
            bgcolor: "rgba(20, 20, 30, 0.9)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "white",
            minWidth: { xs: '90%', sm: 500 },
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontFamily: "'Poppins', sans-serif", mt: 1 }}>
          Edit Personal Information
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                value={profileData.username}
                onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)" },
                    "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                    "&.Mui-focused fieldset": { borderColor: "#646cff" },
                  },
                  "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={profileData.first_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)" },
                    "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                    "&.Mui-focused fieldset": { borderColor: "#646cff" },
                  },
                  "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={profileData.last_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)" },
                    "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                    "&.Mui-focused fieldset": { borderColor: "#646cff" },
                  },
                  "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Birthdate"
                type="date"
                value={profileData.birthdate}
                onChange={(e) => setProfileData(prev => ({ ...prev, birthdate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)" },
                    "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                    "&.Mui-focused fieldset": { borderColor: "#646cff" },
                  },
                  "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "rgba(255, 255, 255, 0.7)" }}>Gender</InputLabel>
                <Select
                  value={profileData.gender}
                  label="Gender"
                  onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
                  sx={{
                    color: "white",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.1)" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.3)" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#646cff" },
                    "& .MuiSvgIcon-root": { color: "white" }
                  }}
                >
                  <MenuItem value=""><em>Not specified</em></MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, mt: 1 }}>
          <Button onClick={handleCancel} sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: 'white',
              px: 3,
              '&:hover': {
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              }
            }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}