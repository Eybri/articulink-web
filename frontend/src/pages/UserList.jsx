// src/pages/UserList.jsx
import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  TextField,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tooltip,
} from "@mui/material"
import { Edit, Delete, Visibility, Refresh, People, AdminPanelSettings, Person, MoreVert, Info, Schedule, AutoMode } from "@mui/icons-material"
import { userAPI } from "../api/api"
import StatsCards from "../components/StatsCards" // Import the cards component

export default function UserList({ user }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [filters, setFilters] = useState({
    role: "",
    status: ""
  })
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [selectedUserForMenu, setSelectedUserForMenu] = useState(null)
  const [deactivationData, setDeactivationData] = useState({
    deactivation_type: 'temporary',
    duration: '1day',
    deactivation_reason: ''
  })

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // Fetch users and stats
  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Fetch users with filters
      const usersData = await userAPI.getUsers(filters)
      setUsers(usersData)
      
      // Fetch statistics
      const statsData = await userAPI.getUserStats()
      setStats(statsData)
      
    } catch (err) {
      console.error('Error fetching data:', err)
      setError("Failed to load users. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filters])

  const handleDeactivateUser = async () => {
    try {
      await userAPI.deactivateUser(selectedUser.id, deactivationData)
      
      let successMessage = `User deactivated successfully`
      if (deactivationData.deactivation_type === 'temporary') {
        successMessage += ` for ${deactivationData.duration}`
      }
      
      setSuccess(successMessage)
      fetchData()
      setDeactivateDialogOpen(false)
      setDeactivationData({
        deactivation_type: 'temporary',
        duration: '1day',
        deactivation_reason: ''
      })
    } catch (err) {
      setError("Failed to deactivate user")
    }
  }

  const handleActivateUser = async (userId) => {
    try {
      await userAPI.activateUser(userId)
      setSuccess("User activated successfully")
      fetchData()
      handleMenuClose()
    } catch (err) {
      setError("Failed to activate user")
    }
  }

  const handleDeactivateClick = (user) => {
    setSelectedUser(user)
    setDeactivationData({
      deactivation_type: 'temporary',
      duration: '1day',
      deactivation_reason: ''
    })
    setDeactivateDialogOpen(true)
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userAPI.updateUserRole(userId, newRole)
      setSuccess(`User role updated to ${newRole} successfully`)
      fetchData()
    } catch (err) {
      setError("Failed to update user role")
    }
  }

  const handleDeleteClick = (user) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await userAPI.deleteUser(selectedUser.id)
      setSuccess("User deleted successfully")
      setDeleteDialogOpen(false)
      setSelectedUser(null)
      fetchData()
    } catch (err) {
      setError("Failed to delete user")
    }
  }

  const handleMenuOpen = (event, user) => {
    setMenuAnchor(event.currentTarget)
    setSelectedUserForMenu(user)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setSelectedUserForMenu(null)
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const handleTriggerAutoReactivate = async () => {
    try {
      const result = await userAPI.triggerAutoReactivate()
      setSuccess(`Auto-reactivation completed: ${result.reactivated_count} users reactivated`)
      fetchData()
    } catch (err) {
      setError("Failed to trigger auto-reactivation")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#10b981"
      case "inactive":
        return "#6b7280"
      case "pending":
        return "#f59e0b"
      default:
        return "#6b7280"
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "#ef4444"
      case "user":
        return "#646cff"
      default:
        return "#6b7280"
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getRemainingTime = (endDate) => {
    if (!endDate) return null
    const now = new Date()
    const end = new Date(endDate)
    const diffMs = end - now
    
    if (diffMs <= 0) return "Expired"
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase()
  }

  const getDeactivationTypeColor = (type) => {
    switch (type) {
      case 'temporary':
        return '#f59e0b'
      case 'permanent':
        return '#ef4444'
      default:
        return '#6b7280'
    }
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
          User Management 👥
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            fontFamily: "'Inter', sans-serif",
            fontSize: "1.1rem",
          }}
        >
          Manage all users and their permissions in one place.
        </Typography>
      </Box>

      {/* Stats Cards Component */}
      <StatsCards 
        stats={stats}
        onRefresh={fetchData}
        onAutoReactivate={handleTriggerAutoReactivate}
        loading={loading}
      />

      {/* Filters */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: "rgba(255, 255, 255, 0.7)" }}>Role</InputLabel>
          <Select
            value={filters.role}
            label="Role"
            onChange={(e) => handleFilterChange("role", e.target.value)}
            sx={{ color: "white" }}
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: "rgba(255, 255, 255, 0.7)" }}>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={(e) => handleFilterChange("status", e.target.value)}
            sx={{ color: "white" }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>

        <Button
          startIcon={<Refresh />}
          onClick={fetchData}
          sx={{
            color: "#646cff",
            border: "1px solid rgba(100, 108, 255, 0.3)",
            background: "rgba(100, 108, 255, 0.1)",
          }}
        >
          Refresh
        </Button>

        <Tooltip title="Manually check and reactivate users whose temporary deactivation period has ended">
          <Button
            startIcon={<AutoMode />}
            onClick={handleTriggerAutoReactivate}
            sx={{
              color: "#10b981",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              background: "rgba(16, 185, 129, 0.1)",
            }}
          >
            Auto-Reactivate
          </Button>
        </Tooltip>
      </Box>

      {/* User Table */}
      <Paper
        sx={{
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 4,
          overflow: "hidden",
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
        {loading && (
          <LinearProgress 
            sx={{ 
              bgcolor: "rgba(255,255,255,0.1)",
              "& .MuiLinearProgress-bar": { 
                background: "linear-gradient(90deg, #646cff, #10b981)" 
              }
            }} 
          />
        )}
        
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", py: 3, fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "rgba(255, 255, 255, 0.9)", fontSize: "0.9rem" }}>
                  User
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", py: 3, fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "rgba(255, 255, 255, 0.9)", fontSize: "0.9rem" }}>
                  Role
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", py: 3, fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "rgba(255, 255, 255, 0.9)", fontSize: "0.9rem" }}>
                  Status
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", py: 3, fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "rgba(255, 255, 255, 0.9)", fontSize: "0.9rem" }}>
                  Deactivation Type
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", py: 3, fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "rgba(255, 255, 255, 0.9)", fontSize: "0.9rem" }}>
                  Auto-Reactivate
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", py: 3, fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "rgba(255, 255, 255, 0.9)", fontSize: "0.9rem" }}>
                  Reason
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", py: 3, fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "rgba(255, 255, 255, 0.9)", fontSize: "0.9rem" }}>
                  Join Date
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", py: 3, fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "rgba(255, 255, 255, 0.9)", fontSize: "0.9rem" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow 
                  key={user.id}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                    }
                  }}
                >
                  <TableCell sx={{ py: 2.5, borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: "rgba(100, 108, 255, 0.2)",
                          color: "#646cff",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                        }}
                        src={user.profile_pic}
                      >
                        {getInitials(user.first_name, user.last_name)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "white", fontSize: "0.95rem" }}>
                          {user.first_name} {user.last_name}
                        </Typography>
                        <Typography sx={{ fontFamily: "'Inter', sans-serif", color: "rgba(255, 255, 255, 0.6)", fontSize: "0.8rem" }}>
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 2.5, borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <Chip
                      label={user.role}
                      size="small"
                      sx={{
                        bgcolor: `${getRoleColor(user.role)}20`,
                        color: getRoleColor(user.role),
                        fontWeight: 600,
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.75rem",
                        textTransform: "capitalize",
                        border: `1px solid ${getRoleColor(user.role)}40`,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2.5, borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <Chip
                      label={user.status}
                      size="small"
                      sx={{
                        bgcolor: `${getStatusColor(user.status)}20`,
                        color: getStatusColor(user.status),
                        fontWeight: 600,
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.75rem",
                        textTransform: "capitalize",
                        border: `1px solid ${getStatusColor(user.status)}40`,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2.5, borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    {user.deactivation_type ? (
                      <Chip
                        label={user.deactivation_type}
                        size="small"
                        sx={{
                          bgcolor: `${getDeactivationTypeColor(user.deactivation_type)}20`,
                          color: getDeactivationTypeColor(user.deactivation_type),
                          fontWeight: 600,
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "0.75rem",
                          textTransform: "capitalize",
                          border: `1px solid ${getDeactivationTypeColor(user.deactivation_type)}40`,
                        }}
                      />
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell sx={{ py: 2.5, borderBottom: "1px solid rgba(255, 255, 255, 0.04)", fontFamily: "'Inter', sans-serif", color: "rgba(255, 255, 255, 0.8)", fontSize: "0.9rem" }}>
                    {user.deactivation_end_date ? (
                      <Tooltip title={`Auto-reactivates on: ${formatDateTime(user.deactivation_end_date)}`}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule fontSize="small" sx={{ color: '#f59e0b' }} />
                          <span>{getRemainingTime(user.deactivation_end_date)}</span>
                        </Box>
                      </Tooltip>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell sx={{ py: 2.5, borderBottom: "1px solid rgba(255, 255, 255, 0.04)", fontFamily: "'Inter', sans-serif", color: "rgba(255, 255, 255, 0.8)", fontSize: "0.9rem", maxWidth: 200 }}>
                    {user.deactivation_reason ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Info fontSize="small" sx={{ color: '#f59e0b', flexShrink: 0 }} />
                        <Typography 
                          sx={{ 
                            fontFamily: "'Inter', sans-serif", 
                            color: "rgba(255, 255, 255, 0.8)", 
                            fontSize: "0.8rem",
                            wordBreak: 'break-word'
                          }}
                        >
                          {user.deactivation_reason}
                        </Typography>
                      </Box>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell sx={{ py: 2.5, borderBottom: "1px solid rgba(255, 255, 255, 0.04)", fontFamily: "'Inter', sans-serif", color: "rgba(255, 255, 255, 0.8)", fontSize: "0.9rem" }}>
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell sx={{ py: 2.5, borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, user)}
                        sx={{
                          color: "rgba(255, 255, 255, 0.7)",
                          "&:hover": {
                            color: "#646cff",
                            bgcolor: "rgba(100, 108, 255, 0.1)",
                          },
                        }}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {users.length === 0 && !loading && (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography sx={{ fontFamily: "'Inter', sans-serif", color: "rgba(255, 255, 255, 0.5)", fontSize: "1rem" }}>
              No users found
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "white",
            mt: 1,
          }
        }}
      >
        {selectedUserForMenu?.status === "active" ? (
          <MenuItem 
            onClick={() => handleDeactivateClick(selectedUserForMenu)}
            sx={{
              color: "#f59e0b",
              "&:hover": {
                bgcolor: "rgba(245, 158, 11, 0.1)",
              }
            }}
          >
            Deactivate User
          </MenuItem>
        ) : (
          <MenuItem 
            onClick={() => handleActivateUser(selectedUserForMenu.id)}
            sx={{
              color: "#10b981",
              "&:hover": {
                bgcolor: "rgba(16, 185, 129, 0.1)",
              }
            }}
          >
            Activate User
          </MenuItem>
        )}
        <MenuItem 
          onClick={() => {
            handleDeleteClick(selectedUserForMenu)
            handleMenuClose()
          }}
          sx={{
            color: "#ef4444",
            "&:hover": {
              bgcolor: "rgba(239, 68, 68, 0.1)",
            }
          }}
        >
          Delete User
        </MenuItem>
      </Menu>

      {/* Deactivate Confirmation Dialog */}
      <Dialog
        open={deactivateDialogOpen}
        onClose={() => {
          setDeactivateDialogOpen(false)
          setDeactivationData({
            deactivation_type: 'temporary',
            duration: '1day',
            deactivation_reason: ''
          })
        }}
        PaperProps={{
          sx: {
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "white",
            minWidth: 500,
          }
        }}
      >
        <DialogTitle>Deactivate User</DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <DialogContentText sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
              Are you sure you want to deactivate {selectedUser?.first_name} {selectedUser?.last_name}?
            </DialogContentText>
            
            <FormControl component="fieldset">
              <Typography sx={{ color: "rgba(255, 255, 255, 0.9)", mb: 1, fontWeight: 600 }}>
                Deactivation Type
              </Typography>
              <RadioGroup
                value={deactivationData.deactivation_type}
                onChange={(e) => setDeactivationData(prev => ({ 
                  ...prev, 
                  deactivation_type: e.target.value 
                }))}
              >
                <FormControlLabel 
                  value="temporary" 
                  control={<Radio sx={{ color: '#f59e0b' }} />} 
                  label={
                    <Box>
                      <Typography sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
                        Temporary Deactivation
                      </Typography>
                      <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                        User will be automatically reactivated after selected duration
                      </Typography>
                    </Box>
                  } 
                />
                <FormControlLabel 
                  value="permanent" 
                  control={<Radio sx={{ color: '#ef4444' }} />} 
                  label={
                    <Box>
                      <Typography sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
                        Permanent Deactivation
                      </Typography>
                      <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                        User will remain deactivated until manually reactivated
                      </Typography>
                    </Box>
                  } 
                />
              </RadioGroup>
            </FormControl>

            {deactivationData.deactivation_type === 'temporary' && (
              <FormControl fullWidth>
                <InputLabel sx={{ color: "rgba(255, 255, 255, 0.7)" }}>Deactivation Duration</InputLabel>
                <Select
                  value={deactivationData.duration}
                  label="Deactivation Duration"
                  onChange={(e) => setDeactivationData(prev => ({ 
                    ...prev, 
                    duration: e.target.value 
                  }))}
                  sx={{ color: "white" }}
                >
                  <MenuItem value="1day">1 Day</MenuItem>
                  <MenuItem value="1week">1 Week</MenuItem>
                  <MenuItem value="1month">1 Month</MenuItem>
                  <MenuItem value="1year">1 Year</MenuItem>
                </Select>
              </FormControl>
            )}

            <TextField
              label="Deactivation Reason (Optional)"
              value={deactivationData.deactivation_reason}
              onChange={(e) => setDeactivationData(prev => ({ 
                ...prev, 
                deactivation_reason: e.target.value 
              }))}
              multiline
              rows={3}
              placeholder="Enter reason for deactivation..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setDeactivateDialogOpen(false)
              setDeactivationData({
                deactivation_type: 'temporary',
                duration: '1day',
                deactivation_reason: ''
              })
            }} 
            sx={{ color: "rgba(255, 255, 255, 0.7)" }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeactivateUser} 
            color="warning" 
            variant="contained"
          >
            {deactivationData.deactivation_type === 'temporary' ? 'Deactivate Temporarily' : 'Deactivate Permanently'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "white"
          }
        }}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
            Are you sure you want to delete {selectedUser?.first_name} {selectedUser?.last_name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")}>
        <Alert onClose={() => setError("")} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess("")}>
        <Alert onClose={() => setSuccess("")} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </>
  )
}