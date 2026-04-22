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
  Avatar,
  Tab,
  Tabs,
  LinearProgress,
} from "@mui/material"
import { Search, Visibility } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { userAPI } from "../api/api"

const DashboardUserList = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState("active")
  const [search, setSearch] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers()
    }, 500)
    return () => clearTimeout(timer)
  }, [status, search])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await userAPI.getUsers({
        status: status,
        search: search,
        limit: 10
      })
      
      if (response && response.users) {
        setUsers(response.users)
      } else if (Array.isArray(response)) {
        setUsers(response.slice(0, 10))
      }
    } catch (error) {
      console.error("Error fetching dashboard users:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "#10b981"
      case "inactive": return "#ef4444"
      case "pending": return "#f59e0b"
      default: return "#6b7280"
    }
  }

  const getInitials = (username) => {
    if (!username) return "?"
    return username.slice(0, 2).toUpperCase()
  }

  return (
    <Paper
      sx={{
        height: 500,
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 4,
        display: "flex",
        flexDirection: "column",
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
          zIndex: 2
        }
      }}
    >
      {/* Header with Search & Tabs */}
      <Box sx={{ p: 2, borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ color: "white", fontWeight: 700, fontSize: "0.9rem", mb: 0 }}>
              User Overview
            </Typography>
            <Typography sx={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Real-time Status
            </Typography>
          </Box>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              bgcolor: 'rgba(255,255,255,0.05)', 
              borderRadius: 2, 
              px: 1.5,
              py: 0.5,
              border: '1px solid rgba(255,255,255,0.08)',
              width: '140px',
              transition: 'all 0.3s ease',
              '&:focus-within': {
                width: '180px',
                bgcolor: 'rgba(255,255,255,0.08)',
                borderColor: 'rgba(100,108,255,0.5)'
              }
            }}
          >
            <Search sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem', mr: 1 }} />
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'white',
                fontSize: '0.75rem',
                width: '100%',
                fontWeight: 500
              }}
            />
          </Box>
        </Box>

        <Tabs 
          value={status} 
          onChange={(e, v) => setStatus(v)}
          sx={{
            minHeight: 'auto',
            '& .MuiTabs-indicator': {
              height: 2,
              borderRadius: '2px 2px 0 0',
              bgcolor: status === 'active' ? '#10b981' : '#ef4444'
            }
          }}
        >
          <Tab 
            value="active" 
            label="Active" 
            sx={{ 
              color: status === 'active' ? 'white' : 'rgba(255,255,255,0.4)',
              minHeight: 'auto',
              py: 1,
              px: 2,
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              '&.Mui-selected': { color: '#10b981' }
            }} 
          />
          <Tab 
            value="inactive" 
            label="Deactivated" 
            sx={{ 
              color: status === 'inactive' ? 'white' : 'rgba(255,255,255,0.4)',
              minHeight: 'auto',
              py: 1,
              px: 2,
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              '&.Mui-selected': { color: '#ef4444' }
            }} 
          />
        </Tabs>
      </Box>

      {loading && (
        <LinearProgress 
          sx={{ 
            height: 2,
            bgcolor: "rgba(255,255,255,0.1)",
            "& .MuiLinearProgress-bar": { 
              background: "linear-gradient(90deg, #646cff, #10b981)" 
            }
          }} 
        />
      )}

      <TableContainer 
        sx={{ 
          flexGrow: 1,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(255, 255, 255, 0.15)',
          }
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: 'transparent', borderBottom: "1px solid rgba(255, 255, 255, 0.05)", py: 1.5, color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase" }}>User</TableCell>
              <TableCell sx={{ bgcolor: 'transparent', borderBottom: "1px solid rgba(255, 255, 255, 0.05)", py: 1.5, color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase" }} align="right">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((item) => (
              <TableRow 
                key={item.id}
                onClick={() => navigate('/users')}
                sx={{ 
                  cursor: 'pointer',
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,0.03)',
                    '& .MuiAvatar-root': { transform: 'scale(1.05)' }
                  }
                }}
              >
                <TableCell sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.03)", py: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: "rgba(100, 108, 255, 0.2)",
                        color: "#646cff",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        transition: 'transform 0.3s ease'
                      }}
                      src={item.profile_pic}
                    >
                      {getInitials(item.username)}
                    </Avatar>
                    <Box>
                      <Typography sx={{ color: "white", fontSize: "0.75rem", fontWeight: 600 }}>
                        {item.username || item.email}
                      </Typography>
                      <Typography sx={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "0.65rem" }}>
                        {item.role}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.03)", py: 1.5 }} align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: getStatusColor(item.status) }} />
                    <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'capitalize' }}>
                      {item.status}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.3)", fontSize: '0.8rem' }}>
                    {search ? "No matches found" : `No ${status} users`}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}

export default DashboardUserList
