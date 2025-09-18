
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Box, Typography, Chip, CircularProgress, Alert } from '@mui/material';
import { LocationOn, Warning, CheckCircle, Pending, PlayArrow } from '@mui/icons-material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different status
const createCustomIcon = (color, status) => {
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
    ">
      ${status === 'Resolved' ? '✓' : status === 'In Progress' ? '⏳' : '!'}
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

// Component to fit map bounds to markers
const FitBounds = ({ positions }) => {
  const map = useMap();
  
  useEffect(() => {
    if (positions.length > 0) {
      const validPositions = positions.filter(pos => 
        pos.latitude && pos.longitude && 
        pos.latitude !== 0 && pos.longitude !== 0
      );
      
      if (validPositions.length > 0) {
        const bounds = validPositions.map(pos => [pos.latitude, pos.longitude]);
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [positions, map]);

  return null;
};

const MapWidget = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        // Use Axios with JWT
        const response = await api.get('/posts/admin/posts');
        const data = response.data;

        // Filter out issues without valid coordinates
        const validIssues = data.filter(issue =>
          issue.location?.coordinates &&
          issue.location.coordinates[1] !== 0 &&
          issue.location.coordinates[0] !== 0
        ).map(issue => ({
          id: issue._id,
          latitude: issue.location.coordinates[1],
          longitude: issue.location.coordinates[0],
          description: issue.description || 'No description',
          status: issue.status || 'Pending',
          userName: issue.user?.username || issue.userName || 'Anonymous',
          userEmail: issue.user?.email || issue.userEmail || 'N/A',
          createdAt: issue.createdAt,
          media: issue.media || []
        }));

        setIssues(validIssues);

        // Calculate statistics
        const totalIssues = validIssues.length;
        const pendingCount = validIssues.filter(issue => issue.status === 'Pending').length;
        const inProgressCount = validIssues.filter(issue => issue.status === 'In Progress').length;
        const resolvedCount = validIssues.filter(issue => issue.status === 'Resolved').length;

        setStats({
          total: totalIssues,
          pending: pendingCount,
          inProgress: inProgressCount,
          resolved: resolvedCount
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching issues:', err);
        setError('Failed to load map data');
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const getMarkerColor = (status) => {
    switch (status) {
      case 'Resolved': return '#4caf50';
      case 'In Progress': return '#2196f3';
      default: return '#ff9800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved': return <CheckCircle fontSize="small" />;
      case 'In Progress': return <PlayArrow fontSize="small" />;
      default: return <Pending fontSize="small" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'success';
      case 'In Progress': return 'primary';
      default: return 'warning';
    }
  };

  // Default center (Chennai, Tamil Nadu)
  const defaultCenter = [13.0827, 80.2707];

  if (loading) {
    return (
      <Box sx={{ 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Loading map data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" icon={<Warning />}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (issues.length === 0) {
    return (
      <Box sx={{ 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2,
        bgcolor: '#f5f5f5',
        borderRadius: 1
      }}>
        <LocationOn sx={{ fontSize: 60, color: 'text.secondary' }} />
        <Typography variant="h6" color="text.secondary">
          No issues with location data found
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Stats Cards Row */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 2,
        mb: 3,
        p: 2,
        bgcolor: '#f8f9fa',
        borderRadius: 2
      }}>
        {/* Total Issues */}
        <Box sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 2,
          borderRadius: 2,
          textAlign: 'center',
          boxShadow: 2
        }}>
          <Typography variant="h4" fontWeight="bold">
            {loading ? "..." : stats.total}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Total Issues
          </Typography>
        </Box>

        {/* Pending */}
        <Box sx={{
          background: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)',
          color: 'white',
          p: 2,
          borderRadius: 2,
          textAlign: 'center',
          boxShadow: 2
        }}>
          <Typography variant="h4" fontWeight="bold">
            {loading ? "..." : stats.pending}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Pending
          </Typography>
        </Box>

        {/* In Progress */}
        <Box sx={{
          background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
          color: 'white',
          p: 2,
          borderRadius: 2,
          textAlign: 'center',
          boxShadow: 2
        }}>
          <Typography variant="h4" fontWeight="bold">
            {loading ? "..." : stats.inProgress}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            In Progress
          </Typography>
        </Box>

        {/* Resolved */}
        <Box sx={{
          background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
          color: 'white',
          p: 2,
          borderRadius: 2,
          textAlign: 'center',
          boxShadow: 2
        }}>
          <Typography variant="h4" fontWeight="bold">
            {loading ? "..." : stats.resolved}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Resolved
          </Typography>
        </Box>
      </Box>

      {/* Existing Map Component - Unchanged */}
      <Box sx={{ height: '500px', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
      {/* Map Legend */}
      <Box sx={{ 
        position: 'absolute', 
        top: 10, 
        right: 10, 
        zIndex: 1000,
        bgcolor: 'rgba(255,255,255,0.95)',
        p: 1.5,
        borderRadius: 2,
        boxShadow: 2,
        backdropFilter: 'blur(5px)'
      }}>
        <Typography variant="caption" fontWeight="bold" gutterBottom display="block">
          Legend
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              bgcolor: '#ff9800',
              border: '2px solid white',
              boxShadow: 1
            }} />
            <Typography variant="caption">Pending</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              bgcolor: '#2196f3',
              border: '2px solid white',
              boxShadow: 1
            }} />
            <Typography variant="caption">In Progress</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              bgcolor: '#4caf50',
              border: '2px solid white',
              boxShadow: 1
            }} />
            <Typography variant="caption">Resolved</Typography>
          </Box>
        </Box>
      </Box>

      {/* Issue Count Badge */}
      <Box sx={{ 
        position: 'absolute', 
        top: 10, 
        left: 10, 
        zIndex: 1000
      }}>
        <Chip 
          icon={<LocationOn />}
          label={`${issues.length} Issues`}
          color="primary"
          variant="filled"
          sx={{ 
            bgcolor: 'rgba(25, 118, 210, 0.9)',
            color: 'white',
            backdropFilter: 'blur(5px)',
            fontWeight: 'bold'
          }}
        />
      </Box>

      <MapContainer
        center={defaultCenter}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds positions={issues} />
        
        {issues.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.latitude, issue.longitude]}
            icon={createCustomIcon(getMarkerColor(issue.status), issue.status)}
          >
            <Popup maxWidth={300} className="custom-popup">
              <Box sx={{ p: 1, minWidth: 250 }}>
                {/* Status Chip */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Chip
                    icon={getStatusIcon(issue.status)}
                    label={issue.status}
                    color={getStatusColor(issue.status)}
                    size="small"
                    variant="filled"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>

                {/* Description */}
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  {issue.description}
                </Typography>

                {/* Reporter Info */}
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Reported by: <strong>{issue.userName}</strong>
                  </Typography>
                </Box>

                {/* Location Coordinates */}
                <Typography variant="caption" color="text.secondary" display="block">
                  📍 {issue.latitude.toFixed(6)}, {issue.longitude.toFixed(6)}
                </Typography>

                {/* Media Count */}
                {issue.media.length > 0 && (
                  <Typography variant="caption" color="primary" display="block" sx={{ mt: 0.5 }}>
                    📎 {issue.media.length} attachment(s)
                  </Typography>
                )}
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
        
        .custom-marker {
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
      `}</style>
      </Box>
    </Box>
  );
};

export default MapWidget;