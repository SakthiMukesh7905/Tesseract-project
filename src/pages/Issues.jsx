// Issues.jsx (AdminIssues) - Enhanced Version with Geocoding
import React, { useState, useEffect } from "react";
import api from "../api";
import { DataGrid } from "@mui/x-data-grid";
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Avatar, 
  IconButton,
  Tooltip,
  LinearProgress,
  Paper,
  Grid,
  Button
} from "@mui/material";
import {
  LocationOn,
  Person,
  Schedule,
  Image,
  VoiceChat,
  Visibility,
  CheckCircle,
  Pending,
  PlayArrow,
  Send
} from "@mui/icons-material";

export default function Issues() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, resolved: 0 });
  const [clusters, setClusters] = useState([]);
  const [dedupLoading, setDedupLoading] = useState(false);
  const [adminComments, setAdminComments] = useState({});

  // Department mapping for display names
  const departmentNames = {
    'roads': 'Roads & Infrastructure',
    'water': 'Water & Sanitation',
    'waste': 'Waste Management',
    'electricity': 'Electricity',
    'parks': 'Parks & Recreation'
  };

  const handleAdminComment = (clusterId, comment) => {
    setAdminComments(prev => ({
      ...prev,
      [clusterId]: comment
    }));
  };

  const handleAcknowledge = async (cluster) => {
    try {
      const payload = {
        clusterId: cluster.mainPost.id,
        issues: cluster.issues.map(issue => issue.id),
        adminComment: adminComments[cluster.mainPost.id] || '',
        department: cluster.recommendedDepartment,
        status: 'In Progress'
      };

await api.post('/admin/posts/acknowledge-cluster', payload);
      
      // Refresh clusters
      handleDeduplicate();

    } catch (err) {
      console.error('Error acknowledging cluster:', err);
      alert('Failed to acknowledge cluster');
    }
  };

  // Deduplicate issues handler
  const handleDeduplicate = async () => {
    setDedupLoading(true);
    try {
      // Call backend API for deduplication (adjust route as needed)
      const res = await api.get("/admin/posts/deduplicate");
      setClusters(res.data.clusters || []);
    } catch (err) {
      setClusters([]);
      console.error("Deduplication error:", err);
    } finally {
      setDedupLoading(false);
    }
  };

  // Function to convert coordinates to address
  const getAddressFromCoords = async (lat, lng) => {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        // Extract relevant parts of address
        const address = data.address || {};
        const street = address.road || address.pedestrian || address.footway || '';
        const area = address.suburb || address.neighbourhood || address.village || '';
        const city = address.city || address.town || address.municipality || '';
        
        // Create a concise address
        let shortAddress = '';
        if (street) shortAddress += street;
        if (area && shortAddress) shortAddress += ', ' + area;
        if (city && shortAddress) shortAddress += ', ' + city;
        
        return shortAddress || data.display_name.split(',').slice(0, 3).join(', ');
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Geocoding error:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await api.get("/posts/admin/posts");

        // Process data and get addresses
        const formattedPromises = res.data.map(async (post, idx) => {
          const latitude = post.location?.coordinates?.[1];
          const longitude = post.location?.coordinates?.[0];
          
          let address = "No location";
          if (latitude && longitude && latitude !== 0 && longitude !== 0) {
            address = await getAddressFromCoords(latitude, longitude);
          }

          return {
            id: post._id || idx,
            description: post.description || "No description",
            userName: post.user?.username || post.userName || "Anonymous",
            userEmail: post.user?.email || post.userEmail || "N/A",
            location: post.location,
            address: address,
            createdAt: post.createdAt,
            media: post.media || [],
            voiceMsg: post.voiceMsg,
            status: post.status || "Pending",
            latitude: latitude || null,
            longitude: longitude || null
          };
        });

        const formatted = await Promise.all(formattedPromises);
        setRows(formatted);

        // Calculate statistics
        const pending = formatted.filter(row => row.status === "Pending").length;
        const inProgress = formatted.filter(row => row.status === "In Progress").length;
        const resolved = formatted.filter(row => row.status === "Resolved").length;
        setStats({ pending, inProgress, resolved });

      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Resolved":
        return <CheckCircle style={{ color: '#4caf50' }} />; // Green for success
      case "In Progress":
        return <PlayArrow style={{ color: '#1976d2' }} />; // Blue for progress
      case "Pending":
        return <Pending style={{ color: '#ff9800' }} />; // Orange for pending
      default:
        return <Pending style={{ color: '#bdbdbd' }} />; // Grey for unknown
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved": return "success";
      case "In Progress": return "primary";
      default: return "warning";
    }
  };

  const columns = [
    {
      field: "description",
      headerName: "Issue Description",
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" fontWeight="500">
            {params.row.description}
          </Typography>
        </Box>
      )
    },

    {
      field: "userName",
      headerName: "Reporter",
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2', fontSize: '14px' }}>
            {params.row.userName.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="500">
              {params.row.userName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.userEmail}
            </Typography>
          </Box>
        </Box>
      )
    },

    {
      field: "address",
      headerName: "Location",
      width: 300,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
          <LocationOn color="action" fontSize="small" />
          <Tooltip title={`Coordinates: ${params.row.latitude?.toFixed(6)}, ${params.row.longitude?.toFixed(6)}`}>
            <Typography variant="body2" sx={{ cursor: 'help' }}>
              {params.row.address}
            </Typography>
          </Tooltip>
        </Box>
      )
    },

    {
      field: "createdAt",
      headerName: "Reported",
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
          <Schedule color="action" fontSize="small" />
          <Box>
            <Typography variant="body2">
              {new Date(params.row.createdAt).toLocaleDateString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(params.row.createdAt).toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>
      )
    },

    {
      field: "media",
      headerName: "Attachments",
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          {params.row.media?.length > 0 && (
            <Tooltip title={`${params.row.media.length} image(s)`}>
              <Chip
                icon={<Image />}
                label={params.row.media.length}
                size="small"
                variant="outlined"
                color="primary"
              />
            </Tooltip>
          )}
          {params.row.voiceMsg && (
            <Tooltip title="Voice message">
              <Chip
                icon={<VoiceChat />}
                size="small"
                variant="outlined"
                color="secondary"
              />
            </Tooltip>
          )}
        </Box>
      )
    },

    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => (
        <Chip
          icon={getStatusIcon(params.row.status)}
          label={params.row.status}
          color={getStatusColor(params.row.status)}
          variant="filled"
          sx={{
            fontWeight: 'bold',
            '& .MuiChip-icon': { fontSize: '16px' }
          }}
        />
      )
    },

    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <Tooltip title="View Details">
          <IconButton 
            size="small" 
            color="primary"
            onClick={() => console.log('View details:', params.row.id)}
          >
            <Visibility />
          </IconButton>
        </Tooltip>
      )
    }
  ];

  return (
    <Box sx={{ m: 3 }}>
      {/* Header Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          🏛️ Issues Management Dashboard
        </Typography>
        <Typography variant="subtitle1" opacity={0.9}>
          Monitor and manage all reported civic issues
        </Typography>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            color: 'white'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Pending sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.pending}
              </Typography>
              <Typography variant="body1">
                Pending Issues
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            color: '#333'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <PlayArrow sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.inProgress}
              </Typography>
              <Typography variant="body1">
                In Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #a8e6cf 0%, #dcedc8 100%)',
            color: '#333'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.resolved}
              </Typography>
              <Typography variant="body1">
                Resolved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Deduplicate Button and Clusters */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <button
          onClick={handleDeduplicate}
          disabled={dedupLoading}
          style={{
            padding: '10px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: dedupLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          {dedupLoading ? 'Clustering...' : 'Deduplicate Issues'}
        </button>
      </Box>

      {clusters.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            🧩 Deduplicated Issue Clusters
          </Typography>
          {clusters.map((cluster, idx) => (
            <Paper key={idx} sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
              {/* Cluster Header */}
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                  Cluster #{idx + 1} ({cluster.issues.length} related issues)
                </Typography>
                <Chip
                  label={`Within 1 km radius`}
                  icon={<LocationOn />}
                  color="primary"
                  variant="outlined"
                />
              </Box>

              {/* Issues List */}
              <Box sx={{ mb: 3 }}>
                {cluster.issues.map((issue, i) => (
                  <Paper 
                    key={i} 
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      bgcolor: 'white',
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    {/* Issue Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Avatar sx={{ bgcolor: '#1976d2' }}>
                        {issue.userName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {issue.userName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Reported on {new Date(issue.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Issue Content */}
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {issue.description}
                    </Typography>

                    {/* Location */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LocationOn color="action" />
                      <Typography variant="body2">
                        {issue.address || `${issue.latitude}, ${issue.longitude}`}
                      </Typography>
                    </Box>

                    {/* Media Attachments */}
                    {issue.media && issue.media.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {issue.media.map((media, index) => (
                          <Box
                            key={index}
                            component="img"
                            src={`http://localhost:5000/${media}`}
                            sx={{
                              width: 120,
                              height: 120,
                              objectFit: 'cover',
                              borderRadius: 1,
                              cursor: 'pointer'
                            }}
                            onClick={() => window.open(`http://localhost:5000/${media}`, '_blank')}
                          />
                        ))}
                      </Box>
                    )}

                    {/* Voice Message if any */}
                    {issue.voiceMsg && (
                      <Box sx={{ mb: 2 }}>
                        <audio controls src={`http://localhost:5000/${issue.voiceMsg}`} />
                      </Box>
                    )}
                  </Paper>
                ))}
              </Box>

              {/* Admin Actions */}
              <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Admin Actions
                </Typography>

                {/* Recommended Department */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    AI Recommended Department:
                  </Typography>
                  <Chip
                    label={departmentNames[cluster.recommendedDepartment]}
                    color="primary"
                    icon={<LocationOn />}
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Based on issue descriptions and patterns
                  </Typography>
                </Box>

                {/* Admin Comment */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Add Comment:
                  </Typography>
                  <textarea
                    value={adminComments[cluster.mainPost.id] || ''}
                    onChange={(e) => handleAdminComment(cluster.mainPost.id, e.target.value)}
                    placeholder="Add instructions or notes for the department..."
                    style={{
                      width: '100%',
                      minHeight: '80px',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      marginBottom: '8px'
                    }}
                  />
                </Box>

                {/* Acknowledge Button */}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAcknowledge(cluster)}
                  startIcon={<CheckCircle />}
                  sx={{ width: '100%' }}
                >
                  Acknowledge & Forward to {departmentNames[cluster.recommendedDepartment]}
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Main Data Grid */}
      <Card elevation={3}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              📋 All Reported Issues ({rows.length})
            </Typography>
            {loading && <LinearProgress sx={{ width: 200 }} />}
          </Box>
          
          <Box sx={{ height: 700, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              pageSize={15}
              rowsPerPageOptions={[10, 15, 25, 50]}
              disableSelectionOnClick
              rowHeight={80}
              sx={{
                '& .MuiDataGrid-root': {
                  border: 'none',
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f8f9fa',
                  borderBottom: '2px solid #e9ecef',
                  '& .MuiDataGrid-columnHeader': {
                    fontWeight: 'bold',
                    fontSize: '14px',
                  }
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: '#f8f9ff',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease-in-out',
                },
                '& .MuiDataGrid-row': {
                  transition: 'all 0.2s ease-in-out',
                },
                '& .MuiDataGrid-footerContainer': {
                  backgroundColor: '#f8f9fa',
                  borderTop: '2px solid #e9ecef',
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Footer */}
      <Paper sx={{ mt: 3, p: 2, textAlign: 'center', bgcolor: '#f8f9fa' }}>
        <Typography variant="body2" color="text.secondary">
          💡 Tip: Hover over coordinates to see exact GPS location • Click on reporter avatars for contact details
        </Typography>
      </Paper>
    </Box>
  );
}