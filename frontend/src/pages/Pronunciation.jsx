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
                  Edit,
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
                } from "@mui/icons-material"
                import { pronunciationAPI } from "../api/api"

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
                        <Button
                          variant="contained"
                          startIcon={<Refresh />}
                          onClick={fetchAudioClips}
                          sx={{
                            bgcolor: "#646cff",
                            "&:hover": { bgcolor: "#535bf2" }
                          }}
                        >
                          Refresh
                        </Button>
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

                      {/* Table */}
                      <Paper sx={{ bgcolor: "rgba(255,255,255,0.03)" }}>
                        <TableContainer>
                          {loading && <LinearProgress sx={{ bgcolor: "#646cff" }} />}
                          
                          <Table>
                            <TableHead>
                              <TableRow sx={{ "& th": { fontWeight: 700, color: "white" } }}>
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
                                <TableRow key={clip._id} hover>
                                  {/* Play button */}
                                  <TableCell>
                                    <IconButton
                                      onClick={() => handlePlayAudio(clip)}
                                      sx={{ color: "#646cff" }}
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
                                    <Tooltip title="Edit">
                                      <IconButton size="small" sx={{ color: "#10b981" }}>
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                      <IconButton 
                                        size="small" 
                                        sx={{ color: "#ef4444" }}
                                        onClick={() => handleDelete(clip._id)}
                                      >
                                        <Delete fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </TableCell>
                                </TableRow>
                              ))}

                              {!loading && paginatedClips.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
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
                            "& .MuiTablePagination-selectIcon": { color: "white" },
                            "& .MuiTablePagination-select": { color: "white" },
                            "& .MuiTablePagination-displayedRows": { color: "white" },
                            "& .MuiTablePagination-selectLabel": { color: "white" },
                            "& .MuiInputBase-root": { color: "white" },
                          }}
                        />
                      </Paper>

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