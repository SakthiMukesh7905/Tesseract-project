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
  Grid
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
  PlayArrow
} from "@mui/icons-material";

export default function Issues() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, resolved: 0 });

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
      case "Resolved": return <CheckCircle />;
      case "In Progress": return <PlayArrow />;
      default: return <Pending />;
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