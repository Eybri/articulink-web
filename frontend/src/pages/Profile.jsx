// src/pages/Profile.jsx
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
  Transgender
} from "@mui/icons-material"
import { authAPI } from "../api/api"

export default function Profile({ user: initialUser }) {
  const [user, setUser] = useState(initialUser)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    birthdate: "",
    gender: ""
  })

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser)
      // Format birthdate for input field (YYYY-MM-DD)
      const formattedBirthdate = initialUser.birthdate 
        ? new Date(initialUser.birthdate).toISOString().split('T')[0]
        : ""
      
      setProfileData({
        first_name: initialUser.first_name || "",
        last_name: initialUser.last_name || "",
        birthdate: formattedBirthdate,
        gender: initialUser.gender || ""
      })
    }
  }, [initialUser])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const profile = await authAPI.getProfile()
      setUser(profile)
      
      // Format birthdate for input field
      const formattedBirthdate = profile.birthdate 
        ? new Date(profile.birthdate).toISOString().split('T')[0]
        : ""
      
      setProfileData({
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
    setEditing(true)
    setError("")
    setSuccess("")
  }

  const handleCancel = () => {
    setEditing(false)
    // Format birthdate for input field when canceling
    const formattedBirthdate = user.birthdate 
      ? new Date(user.birthdate).toISOString().split('T')[0]
      : ""
    
    setProfileData({
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
      setEditing(false)
      setSuccess("Profile updated successfully")
      
      // Update localStorage user data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const updatedUserData = {
        ...currentUser,
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

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "Not set"
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return "Invalid date"
    }
  }

  if (loading && !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <LinearProgress sx={{ width: '60%' }} />
      </Box>
    )
  }

  return (
    <>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 800,
            background: "linear-gradient(135deg, #fff 0%, #646cff 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
            letterSpacing: "-0.02em",
          }}
        >
          Profile Settings ⚙️
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            fontFamily: "'Inter', sans-serif",
            fontSize: "1.1rem",
          }}
        >
          Manage your account settings and profile information.
        </Typography>
      </Box>

      {/* Notifications */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Profile Picture Section */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 4,
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 4,
              textAlign: "center",
              position: "relative",
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
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: "rgba(100, 108, 255, 0.2)",
                  color: "#646cff",
                  fontWeight: 600,
                  fontSize: "2rem",
                  border: "3px solid rgba(255, 255, 255, 0.1)",
                  mb: 2
                }}
                src={user?.profile_pic}
              >
                {getInitials(user?.first_name, user?.last_name)}
              </Avatar>
              
              {/* Upload Button */}
              <IconButton
                component="label"
                sx={{
                  position: "absolute",
                  bottom: 10,
                  right: 10,
                  bgcolor: "rgba(100, 108, 255, 0.9)",
                  color: "white",
                  "&:hover": {
                    bgcolor: "#646cff",
                  },
                }}
              >
                <CameraAlt />
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
                fontFamily: "'Poppins', sans-serif",
                mb: 1,
              }}
            >
              {user?.first_name} {user?.last_name}
            </Typography>
            
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                fontFamily: "'Inter', sans-serif",
                mb: 1,
              }}
            >
              {user?.role === 'admin' ? 'Administrator' : 'User'}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.5)",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.8rem",
                mb: 3,
              }}
            >
              Birthdate: {formatDisplayDate(user?.birthdate)}
            </Typography>

            {user?.profile_pic && (
              <Button
                startIcon={<Delete />}
                onClick={() => setDeleteDialogOpen(true)}
                sx={{
                  color: "#ef4444",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  background: "rgba(239, 68, 68, 0.1)",
                  "&:hover": {
                    background: "rgba(239, 68, 68, 0.2)",
                  },
                }}
              >
                Remove Photo
              </Button>
            )}
          </Paper>
        </Grid>

        {/* Profile Information Section */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 4,
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
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "white",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Personal Information
              </Typography>
              
              {!editing ? (
                <Button
                  startIcon={<Edit />}
                  onClick={handleEdit}
                  sx={{
                    color: "#646cff",
                    border: "1px solid rgba(100, 108, 255, 0.3)",
                    background: "rgba(100, 108, 255, 0.1)",
                  }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    sx={{
                      color: "rgba(255, 255, 255, 0.7)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={loading}
                    sx={{
                      color: "#10b981",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      background: "rgba(16, 185, 129, 0.1)",
                    }}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </Box>
              )}
            </Box>

            {loading && <LinearProgress sx={{ mb: 3 }} />}

            <Grid container spacing={3}>
              {/* Email (Read-only) */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  value={user?.email || ""}
                  InputProps={{
                    readOnly: true,
                    startAdornment: <Email sx={{ color: "rgba(255, 255, 255, 0.5)", mr: 1 }} />
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                      "& fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.1)",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                  }}
                />
              </Grid>

              {/* First Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={profileData.first_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                  disabled={!editing || loading}
                  InputProps={{
                    startAdornment: <Person sx={{ color: "rgba(255, 255, 255, 0.5)", mr: 1 }} />
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "white",
                      "& fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.1)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.3)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#646cff",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                  }}
                />
              </Grid>

              {/* Last Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={profileData.last_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                  disabled={!editing || loading}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "white",
                      "& fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.1)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.3)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#646cff",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                  }}
                />
              </Grid>

              {/* Birthdate */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Birthdate"
                  type="date"
                  value={profileData.birthdate}
                  onChange={(e) => setProfileData(prev => ({ ...prev, birthdate: e.target.value }))}
                  disabled={!editing || loading}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <Cake sx={{ color: "rgba(255, 255, 255, 0.5)", mr: 1 }} />
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "white",
                      "& fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.1)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.3)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#646cff",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                  }}
                />
              </Grid>

              {/* Gender */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={!editing || loading}>
                  <InputLabel sx={{ color: "rgba(255, 255, 255, 0.7)" }}>Gender</InputLabel>
                  <Select
                    value={profileData.gender}
                    label="Gender"
                    onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
                    startAdornment={getGenderIcon(profileData.gender)}
                    sx={{
                      color: "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255, 255, 255, 0.1)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255, 255, 255, 0.3)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#646cff",
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>Not specified</em>
                    </MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

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
    </>
  )
}