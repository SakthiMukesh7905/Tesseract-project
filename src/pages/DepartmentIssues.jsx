import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Pending,
  PlayArrow,
  Visibility,
  Update,
  Warning,
  LocationOn,
  Person,
  CalendarToday,
  Description,
  Image
} from '@mui/icons-material';
import { useAuth } from '../utils/AuthContext';
import api from '../api';

const DepartmentIssues = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateComment, setUpdateComment] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/cluster-assignments');
      setAssignments(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchIssuesForAssignment = async (assignmentId) => {
    try {
      const response = await api.get(`/admin/cluster-assignments/${assignmentId}`);
      setIssues(response.data.issues || []);
    } catch (err) {
      console.error('Error fetching issues:', err);
      setError('Failed to load issues');
    }
  };

  const handleViewDetails = async (assignment) => {
    setSelectedAssignment(assignment);
    await fetchIssuesForAssignment(assignment._id);
    setDetailsDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedAssignment || !updateStatus) return;

    try {
      const response = await api.patch(`/admin/cluster-assignments/${selectedAssignment._id}`, {
        status: updateStatus,
        comment: updateComment
      });
      
      // Update local state
      setAssignments(prev => 
        prev.map(assignment => 
          assignment._id === selectedAssignment._id 
            ? response.data 
            : assignment
        )
      );
      
      setUpdateDialogOpen(false);
      setUpdateStatus('');
      setUpdateComment('');
      setSelectedAssignment(null);
    } catch (err) {
      console.error('Error updating assignment:', err);
      setError('Failed to update assignment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'success';
      case 'In Progress': return 'primary';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved': return <CheckCircle />;
      case 'In Progress': return <PlayArrow />;
      case 'Pending': return <Pending />;
      default: return <Warning />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Assigned Issues
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage issues assigned to your department
        </Typography>
      </Box>

      {/* Assignments List */}
      <Grid container spacing={3}>
        {assignments.map((assignment) => (
          <Grid item xs={12} md={6} lg={4} key={assignment._id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    Assignment #{assignment._id.slice(-8)}
                  </Typography>
                  <Chip
                    icon={getStatusIcon(assignment.status)}
                    label={assignment.status}
                    color={getStatusColor(assignment.status)}
                    size="small"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Issues Count: {assignment.issues?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Assigned: {formatDate(assignment.createdAt)}
                  </Typography>
                  {assignment.departmentUpdates?.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Last Updated: {formatDate(assignment.departmentUpdates[assignment.departmentUpdates.length - 1].updatedAt)}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handleViewDetails(assignment)}
                    fullWidth
                  >
                    View Details
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Update />}
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      setUpdateStatus(assignment.status);
                      setUpdateDialogOpen(true);
                    }}
                    fullWidth
                  >
                    Update
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {assignments.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No assignments found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You don't have any assigned issues at the moment
          </Typography>
        </Box>
      )}

      {/* Issue Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assignment />
            Assignment #{selectedAssignment?._id?.slice(-8)}
          </Box>
        </DialogTitle>
        <DialogContent>
          {issues.length > 0 ? (
            <List>
              {issues.map((issue, index) => (
                <React.Fragment key={issue._id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getStatusColor(issue.status) + '.main' }}>
                        {index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Issue #{issue._id.slice(-8)}
                          </Typography>
                          <Chip
                            icon={getStatusIcon(issue.status)}
                            label={issue.status}
                            color={getStatusColor(issue.status)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
                            {issue.description}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Person fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                              Reported by: {issue.user?.username || issue.userName || 'Anonymous'}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <CalendarToday fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(issue.createdAt)}
                            </Typography>
                          </Box>
                          
                          {issue.location?.coordinates && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <LocationOn fontSize="small" color="action" />
                              <Typography variant="caption" color="text.secondary">
                                {issue.location.coordinates[1].toFixed(6)}, {issue.location.coordinates[0].toFixed(6)}
                              </Typography>
                            </Box>
                          )}
                          
                          {issue.media && issue.media.length > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Image fontSize="small" color="action" />
                              <Typography variant="caption" color="text.secondary">
                                {issue.media.length} attachment(s)
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < issues.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No issues found for this assignment
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Assignment Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={updateStatus}
                label="Status"
                onChange={(e) => setUpdateStatus(e.target.value)}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              margin="normal"
              label="Comment (Optional)"
              multiline
              rows={3}
              value={updateComment}
              onChange={(e) => setUpdateComment(e.target.value)}
              placeholder="Add any comments about the status update..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateStatus} 
            variant="contained"
            disabled={!updateStatus}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentIssues;
