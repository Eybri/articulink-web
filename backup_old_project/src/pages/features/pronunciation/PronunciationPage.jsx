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
                  TablePagination,
                  TableSortLabel,
                  Chip,
                  IconButton,
                  LinearProgress,
                  Alert,
                  TextField,
                  InputAdornment,
                  MenuItem,
                  Select,
                  FormControl,
                  InputLabel,
                  Button,
                  Tooltip,
                  Avatar,
                  Dialog,
                  DialogTitle,
                  DialogContent,
                  DialogActions,
                } from "@mui/material"
                import {
                  Search,
                  PlayArrow,
                  Delete,
                  Refresh,
                  PhoneAndroid,
                  Computer,
                  Tablet,
                  Headset,
                  CheckCircle,
                  Error,
                  HourglassEmpty,
                  AccessTime,
                  Language,
                  Mic,
                  ViewList,
                  ViewModule,
                  Person,
                } from "@mui/icons-material"
                import { pronunciationAPI } from "../../../api/api"

                export default function Pronunciation() {
                  const [clips, setClips] = useState([])
                  const [loading, setLoading] = useState(true)
                  const [error, setError] = useState("")
                  const [page, setPage] = useState(0)
                  const [rowsPerPage, setRowsPerPage] = useState(10)
                  const [searchTerm, setSearchTerm] = useState("")
                  const [filterStatus, setFilterStatus] = useState("all")
                  const [filterLanguage, setFilterLanguage] = useState("all")
                  const [orderBy, setOrderBy] = useState("created_at")
                  const [order, setOrder] = useState("desc")
                  const [selectedClip, setSelectedClip] = useState(null)
                  const [audioDialogOpen, setAudioDialogOpen] = useState(false)
                  const [audio, setAudio] = useState(null)
                  const [viewMode, setViewMode] = useState("table") // "table" or "cards"

                  // Fetch audio clips
                  useEffect(() => {
                    fetchAudioClips()
                  }, [])

                  const fetchAudioClips = async () => {
                    try {
                      setLoading(true)
                      const data = await pronunciationAPI.getAudioClips()
                      setClips(data)
                      setError("")
                    } catch (err) {
                      console.error("Error fetching audio clips:", err)
                      setError("Failed to load audio clips")
                    } finally {
                      setLoading(false)
                    }
                  }

                  // Handle play audio
                  const handlePlayAudio = (clip) => {
                    setSelectedClip(clip)
                    if (audio) {
                      audio.pause()
                    }
                    const newAudio = new Audio(clip.audio_url)
                    setAudio(newAudio)
                    newAudio.play()
                    setAudioDialogOpen(true)
                  }

                  const handleCloseAudio = () => {
                    if (audio) {
                      audio.pause()
                    }
                    setAudioDialogOpen(false)
                    setSelectedClip(null)
                  }

                  // Handle delete
                  const handleDelete = async (id) => {
                    if (window.confirm("Are you sure you want to delete this audio clip?")) {
                      try {
                        await pronunciationAPI.deleteAudioClip(id)
                        fetchAudioClips() // Refresh list
                      } catch (err) {
                        setError("Failed to delete audio clip")
                      }
                    }
                  }

                  // Handle sorting
                  const handleSort = (property) => {
                    const isAsc = orderBy === property && order === "asc"
                    setOrder(isAsc ? "desc" : "asc")
                    setOrderBy(property)
                  }

                  // Filter and search
                  const filteredClips = clips.filter((clip) => {
                    // Search filter
                    const matchesSearch = 
                      clip.transcript?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      clip.corrected_transcript?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      clip._id?.toLowerCase().includes(searchTerm.toLowerCase())

                    // Status filter
                    const matchesStatus = filterStatus === "all" || clip.processing_status === filterStatus

                    // Language filter
                    const matchesLanguage = filterLanguage === "all" || clip.language === filterLanguage

                    return matchesSearch && matchesStatus && matchesLanguage
                  })

                  // Sort
                  const sortedClips = [...filteredClips].sort((a, b) => {
                    const aValue = a[orderBy]
                    const bValue = b[orderBy]
                    
                    if (orderBy === "created_at") {
                      return order === "asc" 
                        ? new Date(aValue) - new Date(bValue)
                        : new Date(bValue) - new Date(aValue)
                    }
                    
                    if (typeof aValue === "string") {
                      return order === "asc"
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue)
                    }
                    
                    return order === "asc" ? aValue - bValue : bValue - aValue
                  })

                  // Pagination
                  const paginatedClips = sortedClips.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )

                  // Get status chip color
                  const getStatusChip = (status) => {
                    switch (status) {
                      case "completed":
                        return <Chip 
                          icon={<CheckCircle />} 
                          label="Completed" 
                          size="small"
                          sx={{ bgcolor: "#10b981", color: "white", fontWeight: 500 }}
                        />
                      case "processing":
                        return <Chip 
                          icon={<HourglassEmpty />} 
                          label="Processing" 
                          size="small"
                          sx={{ bgcolor: "#f59e0b", color: "white", fontWeight: 500 }}
                        />
                      case "failed":
                        return <Chip 
                          icon={<Error />} 
                          label="Failed" 
                          size="small"
                          sx={{ bgcolor: "#ef4444", color: "white", fontWeight: 500 }}
                        />
                      default:
                        return <Chip 
                          icon={<AccessTime />} 
                          label={status} 
                          size="small"
                          sx={{ bgcolor: "#6b7280", color: "white", fontWeight: 500 }}
                        />
                    }
                  }

                  // Get device icon
                  const getDeviceIcon = (device) => {
                    switch (device?.toLowerCase()) {
                      case "mobile":
                        return <PhoneAndroid sx={{ color: "#646cff" }} />
                      case "tablet":
                        return <Tablet sx={{ color: "#10b981" }} />
                      case "desktop":
                        return <Computer sx={{ color: "#f59e0b" }} />
                      default:
                        return <Headset sx={{ color: "#6b7280" }} />
                    }
                  }

                  // Format duration
                  const formatDuration = (seconds) => {
                    if (!seconds) return "0:00"
                    const mins = Math.floor(seconds / 60)
                    const secs = Math.floor(seconds % 60)
                    return `${mins}:${secs.toString().padStart(2, "0")}`
                  }

                  // Format date
                  const formatDate = (dateString) => {
                    return new Date(dateString).toLocaleString()
                  }

                  return (
                    <Box sx={{ p: 3 }}>
                      {/* Header */}
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                        <Box>
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 800,
                              background: "linear-gradient(135deg, #fff 0%, #646cff 100%)",
                              backgroundClip: "text",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              mb: 1,
                            }}
                          >
                            Pronunciation Audio Clips 🎤
                          </Typography>
                          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)" }}>
                            Manage and review all audio recordings from users
                          </Typography>
                        </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Box sx={{ 
                    display: "flex", 
                    bgcolor: "rgba(255,255,255,0.05)", 
                    borderRadius: 2, 
                    p: 0.5,
                    border: "1px solid rgba(255,255,255,0.1)"
                  }}>
                    <Tooltip title="Table View">
                      <IconButton 
                        onClick={() => setViewMode("table")}
                        sx={{ 
                          color: viewMode === "table" ? "#646cff" : "rgba(255,255,255,0.5)",
                          bgcolor: viewMode === "table" ? "rgba(100,108,255,0.1)" : "transparent"
                        }}
                      >
                        <ViewList />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Card View">
                      <IconButton 
                        onClick={() => setViewMode("cards")}
                        sx={{ 
                          color: viewMode === "cards" ? "#646cff" : "rgba(255,255,255,0.5)",
                          bgcolor: viewMode === "cards" ? "rgba(100,108,255,0.1)" : "transparent"
                        }}
                      >
                        <ViewModule />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={fetchAudioClips}
                    sx={{
                      bgcolor: "#646cff",
                      "&:hover": { bgcolor: "#535bf2" },
                      borderRadius: 2
                    }}
                  >
                    Refresh
                  </Button>
                </Box>
                      </Box>

                      {/* Error/Success messages */}
                      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                      {/* Filters */}
                      <Paper sx={{ p: 2, mb: 3, bgcolor: "rgba(255,255,255,0.03)" }}>
                        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                          {/* Search */}
                          <TextField
                            placeholder="Search transcripts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ flex: 2, minWidth: "250px" }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Search sx={{ color: "rgba(255,255,255,0.5)" }} />
                                </InputAdornment>
                              ),
                            }}
                          />

                          {/* Status filter */}
                          <FormControl sx={{ flex: 1, minWidth: "150px" }}>
                            <InputLabel sx={{ color: "rgba(255,255,255,0.7)" }}>Status</InputLabel>
                            <Select
                              value={filterStatus}
                              label="Status"
                              onChange={(e) => setFilterStatus(e.target.value)}
                              sx={{
                                color: "white",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "rgba(255,255,255,0.1)",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "rgba(255,255,255,0.3)",
                                },
                                "& .MuiSvgIcon-root": {
                                  color: "white",
                                },
                              }}
                            >
                              <MenuItem value="all">All Status</MenuItem>
                              <MenuItem value="completed">Completed</MenuItem>
                              <MenuItem value="processing">Processing</MenuItem>
                              <MenuItem value="failed">Failed</MenuItem>
                            </Select>
                          </FormControl>

                          {/* Language filter */}
                          <FormControl sx={{ flex: 1, minWidth: "150px" }}>
                            <InputLabel sx={{ color: "rgba(255,255,255,0.7)" }}>Language</InputLabel>
                            <Select
                              value={filterLanguage}
                              label="Language"
                              onChange={(e) => setFilterLanguage(e.target.value)}
                              sx={{
                                color: "white",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "rgba(255,255,255,0.1)",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "rgba(255,255,255,0.3)",
                                },
                                "& .MuiSvgIcon-root": {
                                  color: "white",
                                },
                              }}
                            >
                              <MenuItem value="all">All Languages</MenuItem>
                              <MenuItem value="en">English</MenuItem>
                              <MenuItem value="es">Spanish</MenuItem>
                              <MenuItem value="fr">French</MenuItem>
                              <MenuItem value="tl">Tagalog</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                      </Paper>

                      {/* Table View */}
                      {viewMode === "table" ? (
                        <Paper sx={{ bgcolor: "rgba(255,255,255,0.03)", borderRadius: 3, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <TableContainer>
                            {loading && <LinearProgress sx={{ bgcolor: "#646cff" }} />}
                            
                            <Table>
                              <TableHead>
                                <TableRow sx={{ "& th": { fontWeight: 700, color: "white", bgcolor: "rgba(255,255,255,0.02)" } }}>
                                  <TableCell sx={{ color: "white" }}>User</TableCell>
                                  <TableCell sx={{ color: "white" }}>Audio</TableCell>
                                  <TableCell sx={{ color: "white" }}>
                                    <TableSortLabel
                                      active={orderBy === "transcript"}
                                      direction={orderBy === "transcript" ? order : "asc"}
                                      onClick={() => handleSort("transcript")}
                                      sx={{
                                        color: "white !important",
                                        "& .MuiTableSortLabel-icon": {
                                          color: "white !important",
                                        },
                                      }}
                                    >
                                      Transcript
                                    </TableSortLabel>
                                  </TableCell>
                                  <TableCell sx={{ color: "white" }}>Corrected</TableCell>
                                  <TableCell sx={{ color: "white" }}>
                                    <TableSortLabel
                                      active={orderBy === "speech_type"}
                                      direction={orderBy === "speech_type" ? order : "asc"}
                                      onClick={() => handleSort("speech_type")}
                                      sx={{
                                        color: "white !important",
                                        "& .MuiTableSortLabel-icon": {
                                          color: "white !important",
                                        },
                                      }}
                                    >
                                      Type
                                    </TableSortLabel>
                                  </TableCell>
                                  <TableCell sx={{ color: "white" }}>
                                    <TableSortLabel
                                      active={orderBy === "duration_seconds"}
                                      direction={orderBy === "duration_seconds" ? order : "asc"}
                                      onClick={() => handleSort("duration_seconds")}
                                      sx={{
                                        color: "white !important",
                                        "& .MuiTableSortLabel-icon": {
                                          color: "white !important",
                                        },
                                      }}
                                    >
                                      Duration
                                    </TableSortLabel>
                                  </TableCell>
                                  <TableCell sx={{ color: "white" }}>Status</TableCell>
                                  <TableCell sx={{ color: "white" }}>Device</TableCell>
                                  <TableCell sx={{ color: "white" }}>Language</TableCell>
                                  <TableCell align="right" sx={{ color: "white" }}>Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {paginatedClips.map((clip) => (
                                  <TableRow key={clip._id || clip.id} hover sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.02)" } }}>
                                    {/* User */}
                                    <TableCell>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                        <Avatar 
                                          src={clip.user_info?.profile_pic} 
                                          sx={{ width: 32, height: 32, border: "1px solid rgba(255,255,255,0.1)" }}
                                        >
                                          <Person fontSize="small" />
                                        </Avatar>
                                        <Box>
                                          <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>
                                            {clip.user_info?.username || "Anonymous"}
                                          </Typography>
                                          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
                                            {formatDate(clip.created_at)}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </TableCell>

                                    {/* Play button */}
                                    <TableCell>
                                      <IconButton
                                        onClick={() => handlePlayAudio(clip)}
                                        sx={{ 
                                          color: "#646cff",
                                          bgcolor: "rgba(100,108,255,0.1)",
                                          "&:hover": { bgcolor: "rgba(100,108,255,0.2)" }
                                        }}
                                      >
                                        <PlayArrow />
                                      </IconButton>
                                    </TableCell>

                                    {/* Transcript */}
                                    <TableCell>
                                      <Typography sx={{ 
                                        maxWidth: 200, 
                                        overflow: "hidden", 
                                        textOverflow: "ellipsis",
                                        color: "white"
                                      }}>
                                        {clip.transcript || "—"}
                                      </Typography>
                                    </TableCell>

                                    {/* Corrected transcript */}
                                    <TableCell>
                                      <Typography sx={{ 
                                        maxWidth: 200, 
                                        overflow: "hidden", 
                                        textOverflow: "ellipsis",
                                        color: "white"
                                      }}>
                                        {clip.corrected_transcript || "—"}
                                      </Typography>
                                    </TableCell>

                                    {/* Speech type */}
                                    <TableCell>
                                      <Chip
                                        label={clip.speech_type || "unknown"}
                                        size="small"
                                        sx={{ bgcolor: "#374151", color: "white", fontWeight: 500 }}
                                      />
                                    </TableCell>

                                    {/* Duration */}
                                    <TableCell>
                                      <Typography sx={{ color: "white" }}>
                                        {formatDuration(clip.duration_seconds)}
                                      </Typography>
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell>{getStatusChip(clip.processing_status)}</TableCell>

                                    {/* Device */}
                                    <TableCell>
                                      <Tooltip title={clip.device_type || "Unknown"}>
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                          {getDeviceIcon(clip.device_type)}
                                        </Box>
                                      </Tooltip>
                                    </TableCell>

                                    {/* Language */}
                                    <TableCell>
                                      <Chip
                                        icon={<Language sx={{ color: "white !important" }} />}
                                        label={clip.language?.toUpperCase() || "EN"}
                                        size="small"
                                        sx={{ bgcolor: "#4b5563", color: "white", fontWeight: 500 }}
                                      />
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell align="right">
                                      <Tooltip title="Delete">
                                        <IconButton 
                                          size="small" 
                                          sx={{ color: "#ef4444" }}
                                          onClick={() => handleDelete(clip.id || clip._id)}
                                        >
                                          <Delete fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </TableCell>
                                  </TableRow>
                                ))}

                                {!loading && paginatedClips.length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                                      <Typography sx={{ color: "rgba(255,255,255,0.5)" }}>
                                        No audio clips found
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>

                          {/* Pagination */}
                          <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            component="div"
                            count={filteredClips.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(e, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(e) => {
                              setRowsPerPage(parseInt(e.target.value, 10))
                              setPage(0)
                            }}
                            sx={{
                              color: "white",
                              borderTop: "1px solid rgba(255,255,255,0.05)",
                              "& .MuiTablePagination-selectIcon": { color: "white" },
                              "& .MuiTablePagination-select": { color: "white" },
                              "& .MuiTablePagination-displayedRows": { color: "white" },
                              "& .MuiTablePagination-selectLabel": { color: "white" },
                              "& .MuiInputBase-root": { color: "white" },
                            }}
                          />
                        </Paper>
                      ) : (
                        /* Cards View */
                        <Box>
                          {loading && <LinearProgress sx={{ bgcolor: "#646cff", mb: 2, borderRadius: 1 }} />}
                          
                          <Box sx={{ 
                            display: "grid", 
                            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
                            gap: 3 
                          }}>
                            {paginatedClips.map((clip) => (
                              <Paper 
                                key={clip._id || clip.id}
                                sx={{ 
                                  p: 2.5, 
                                  bgcolor: "rgba(255,255,255,0.03)", 
                                  borderRadius: 4,
                                  border: "1px solid rgba(255,255,255,0.05)",
                                  display: "flex",
                                  flexDirection: "column",
                                  transition: "transform 0.2s ease, border-color 0.2s ease",
                                  "&:hover": {
                                    transform: "translateY(-4px)",
                                    borderColor: "rgba(100,108,255,0.3)",
                                    bgcolor: "rgba(255,255,255,0.05)",
                                  }
                                }}
                              >
                                {/* Card Header - User Info */}
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                    <Avatar 
                                      src={clip.user_info?.profile_pic} 
                                      sx={{ width: 48, height: 48, border: "2px solid rgba(100,108,255,0.3)" }}
                                    >
                                      <Person />
                                    </Avatar>
                                    <Box>
                                      <Typography variant="subtitle1" sx={{ color: "white", fontWeight: 700, lineHeight: 1.2 }}>
                                        {clip.user_info?.username || "Anonymous"}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
                                        {formatDate(clip.created_at)}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handlePlayAudio(clip)}
                                    sx={{ 
                                      bgcolor: "#646cff", 
                                      color: "white",
                                      "&:hover": { bgcolor: "#535bf2" }
                                    }}
                                  >
                                    <PlayArrow />
                                  </IconButton>
                                </Box>

                                {/* Card Body - Transcript */}
                                <Box sx={{ mb: 2, flexGrow: 1 }}>
                                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
                                    Transcript
                                  </Typography>
                                  <Typography sx={{ color: "white", mb: 1, fontSize: "0.95rem", fontStyle: "italic" }}>
                                    "{clip.transcript || "No transcript available"}"
                                  </Typography>
                                  
                                  {clip.corrected_transcript && (
                                    <>
                                      <Typography variant="caption" sx={{ color: "#10b981", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
                                        Corrected
                                      </Typography>
                                      <Typography sx={{ color: "#10b981", fontSize: "0.95rem", fontWeight: 500 }}>
                                        "{clip.corrected_transcript}"
                                      </Typography>
                                    </>
                                  )}
                                </Box>

                                {/* Card Footer - Stats & Tags */}
                                <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.05)", pt: 2, mt: "auto" }}>
                                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                      {getStatusChip(clip.processing_status)}
                                      <Chip 
                                        label={clip.speech_type} 
                                        size="small" 
                                        variant="outlined" 
                                        sx={{ color: "rgba(255,255,255,0.6)", borderColor: "rgba(255,255,255,0.1)" }} 
                                      />
                                    </Box>
                                    <Typography variant="body2" sx={{ color: "white", fontWeight: 500 }}>
                                      {formatDuration(clip.duration_seconds)}
                                    </Typography>
                                  </Box>
                                  
                                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                                      {getDeviceIcon(clip.device_type)}
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "rgba(255,255,255,0.6)" }}>
                                        <Language fontSize="small" />
                                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                          {clip.language?.toUpperCase() || "EN"}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <Box>
                                      <IconButton 
                                        size="small" 
                                        sx={{ color: "#ef4444" }}
                                        onClick={() => handleDelete(clip.id || clip._id)}
                                      >
                                        <Delete fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </Box>
                                </Box>
                              </Paper>
                            ))}
                          </Box>

                          {/* Pagination wrapped for cards */}
                          <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
                            <TablePagination
                              rowsPerPageOptions={[6, 12, 24, 48]}
                              component="div"
                              count={filteredClips.length}
                              rowsPerPage={rowsPerPage}
                              page={page}
                              onPageChange={(e, newPage) => setPage(newPage)}
                              onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10))
                                setPage(0)
                              }}
                              sx={{
                                color: "white",
                                bgcolor: "rgba(255,255,255,0.03)",
                                borderRadius: 2,
                                "& .MuiTablePagination-selectIcon": { color: "white" },
                                "& .MuiTablePagination-select": { color: "white" },
                                "& .MuiTablePagination-displayedRows": { color: "white" },
                                "& .MuiInputBase-root": { color: "white" },
                              }}
                            />
                          </Box>
                          
                          {!loading && filteredClips.length === 0 && (
                            <Box sx={{ py: 10, textAlign: "center" }}>
                              <Mic sx={{ fontSize: 60, color: "rgba(255,255,255,0.1)", mb: 2 }} />
                              <Typography sx={{ color: "rgba(255,255,255,0.5)" }}>
                                No audio clips found matching your filters
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Audio Player Dialog */}
                      <Dialog
                        open={audioDialogOpen}
                        onClose={handleCloseAudio}
                        maxWidth="sm"
                        fullWidth
                        PaperProps={{
                          sx: {
                            bgcolor: "rgba(255,255,255,0.05)",
                            backdropFilter: "blur(20px)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }
                        }}
                      >
                        <DialogTitle>
                          <Typography variant="h6" sx={{ color: "white" }}>
                            Audio Player
                          </Typography>
                        </DialogTitle>
                        <DialogContent>
                          {selectedClip && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" sx={{ color: "rgba(255,255,255,0.5)", mb: 1 }}>
                                Transcript
                              </Typography>
                              <Typography sx={{ color: "white", mb: 2, p: 2, bgcolor: "rgba(0,0,0,0.2)", borderRadius: 2 }}>
                                {selectedClip.transcript}
                              </Typography>

                              {selectedClip.corrected_transcript && (
                                <>
                                  <Typography variant="subtitle2" sx={{ color: "rgba(255,255,255,0.5)", mb: 1 }}>
                                    Corrected Transcript
                                  </Typography>
                                  <Typography sx={{ color: "#10b981", mb: 2, p: 2, bgcolor: "rgba(0,0,0,0.2)", borderRadius: 2 }}>
                                    {selectedClip.corrected_transcript}
                                  </Typography>
                                </>
                              )}

                              <audio controls style={{ width: "100%", marginTop: "16px" }}>
                                <source src={selectedClip.audio_url} type="audio/mpeg" />
                                Your browser does not support the audio element.
                              </audio>
                            </Box>
                          )}
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={handleCloseAudio} sx={{ color: "white" }}>
                            Close
                          </Button>
                        </DialogActions>
                      </Dialog>
                    </Box>
                  )
                }