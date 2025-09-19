// src/pages/DepartmentDashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  CircularProgress,
  Alert,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Button,
  IconButton,
  Badge,
  Divider,
  Container,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Assessment,
  Schedule,
  CheckCircle,
  Warning,
  Speed,
  Timeline,
  Notifications,
  PriorityHigh,
  ArrowUpward,
  ArrowDownward,
  Refresh,
  Assignment
} from '@mui/icons-material';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

import api from '../api';
import { useAuth } from '../utils/AuthContext';

const StatCard = ({ title, value, change, icon, color = 'primary', trend, theme }) => (
  <Card
    sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.08)}, ${alpha(
        theme.palette[color].main,
        0.02
      )})`,
      borderLeft: `4px solid ${theme.palette[color].main}`,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[8]
      }
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight="bold">
            {value}
          </Typography>
          {change !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {trend === 'up' ? (
                <ArrowUpward sx={{ color: 'success.main', fontSize: 16 }} />
              ) : (
                <ArrowDownward sx={{ color: 'error.main', fontSize: 16 }} />
              )}
              <Typography
                variant="body2"
                sx={{
                  color: trend === 'up' ? 'success.main' : 'error.main',
                  ml: 0.5
                }}
              >
                {Math.abs(change)}% from last week
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar sx={{ bgcolor: theme.palette[color].main, width: 56, height: 56 }}>{icon}</Avatar>
      </Box>
    </CardContent>
  </Card>
);

const DepartmentDashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [dashboardData, setDashboardData] = useState({
    clusters: [],
    analytics: {},
    trends: [],
    performance: {},
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // refresh every 30s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // clusters endpoint (existing)
      const clustersPromise = api.get('/admin/cluster-assignments');
      // analytics endpoint (you should implement this on backend). If not available, the call will error.
      const analyticsPromise = api.get('/admin/dashboard-analytics').catch(() => ({ data: {} }));

      const [clustersResponse, analyticsResponse] = await Promise.all([clustersPromise, analyticsPromise]);

      const clusters = clustersResponse?.data || [];
      const analytics = analyticsResponse?.data || {};

      setDashboardData({
        clusters,
        analytics: analytics.summary || analytics || {},
        trends: analytics.trends || [],
        performance: analytics.performance || {},
        recentActivity: analytics.recentActivity || []
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const OverviewTab = () => (
    <Grid container spacing={3}>
      {/* Key Metrics */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          Key Performance Metrics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Assignments"
              value={dashboardData.analytics.totalAssignments || dashboardData.clusters.length || 0}
              change={dashboardData.analytics.assignmentChange}
              trend={dashboardData.analytics.assignmentTrend}
              icon={<Assessment />}
              color="primary"
              theme={theme}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Resolved Issues"
              value={dashboardData.analytics.resolvedCount || 0}
              change={dashboardData.analytics.resolvedChange}
              trend={dashboardData.analytics.resolvedTrend}
              icon={<CheckCircle />}
              color="success"
              theme={theme}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Issues"
              value={dashboardData.analytics.pendingCount || 0}
              change={dashboardData.analytics.pendingChange}
              trend={dashboardData.analytics.pendingTrend}
              icon={<Schedule />}
              color="warning"
              theme={theme}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg Resolution Time"
              value={`${dashboardData.analytics.avgResolutionTime || 0}h`}
              change={dashboardData.analytics.resolutionTimeChange}
              trend={dashboardData.analytics.resolutionTimeTrend}
              icon={<Speed />}
              color="info"
              theme={theme}
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Performance Chart */}
      <Grid item xs={12} md={8}>
        <Card sx={{ height: 400 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Resolution Trends (Last 30 Days)
              </Typography>
              <IconButton onClick={fetchDashboardData} size="small">
                <Refresh />
              </IconButton>
            </Box>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dashboardData.trends}>
                <defs>
                  <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.warning.main} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={theme.palette.warning.main} stopOpacity={0} />
                  </linearGradient>
                </defs>

                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <ChartTooltip />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stackId="1"
                  stroke={theme.palette.success.main}
                  fillOpacity={1}
                  fill="url(#resolvedGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="pending"
                  stackId="1"
                  stroke={theme.palette.warning.main}
                  fillOpacity={1}
                  fill="url(#pendingGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Status Distribution */}
      <Grid item xs={12} md={4}>
        <Card sx={{ height: 400 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Resolved', value: dashboardData.analytics.resolvedCount || 0, color: theme.palette.success.main },
                    { name: 'In Progress', value: dashboardData.analytics.inProgressCount || 0, color: theme.palette.info.main },
                    { name: 'Pending', value: dashboardData.analytics.pendingCount || 0, color: theme.palette.warning.main }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                >
                  {[
                    { name: 'Resolved', value: dashboardData.analytics.resolvedCount || 0, color: theme.palette.success.main },
                    { name: 'In Progress', value: dashboardData.analytics.inProgressCount || 0, color: theme.palette.info.main },
                    { name: 'Pending', value: dashboardData.analytics.pendingCount || 0, color: theme.palette.warning.main }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activity */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: 350 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Activity
            </Typography>
            <List sx={{ maxHeight: 250, overflow: 'auto' }}>
              {dashboardData.recentActivity.map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem divider>
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor:
                            activity.type === 'resolved'
                              ? 'success.main'
                              : activity.type === 'assigned'
                              ? 'info.main'
                              : 'warning.main',
                          width: 32,
                          height: 32
                        }}
                      >
                        {activity.type === 'resolved' ? (
                          <CheckCircle sx={{ fontSize: 16 }} />
                        ) : activity.type === 'assigned' ? (
                          <Assessment sx={{ fontSize: 16 }} />
                        ) : (
                          <Schedule sx={{ fontSize: 16 }} />
                        )}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={activity.message} secondary={new Date(activity.timestamp).toLocaleString()} />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Priority Issues */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: 350 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              High Priority Issues
            </Typography>
            <List sx={{ maxHeight: 250, overflow: 'auto' }}>
              {dashboardData.clusters
                .filter(cluster => cluster.status !== 'Resolved' && (new Date() - new Date(cluster.createdAt)) / (1000 * 60 * 60 * 24) > 3)
                .slice(0, 5)
                .map(cluster => (
                  <ListItem key={cluster._id}>
                    <ListItemAvatar>
                      <Badge badgeContent="!" color="error">
                        <Avatar sx={{ bgcolor: 'error.main', width: 32, height: 32 }}>
                          <PriorityHigh sx={{ fontSize: 16 }} />
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`Cluster #${cluster._id.slice(-8)}`}
                      secondary={`${cluster.issues?.length || 0} issues • ${Math.floor(
                        (new Date() - new Date(cluster.createdAt)) / (1000 * 60 * 60 * 24)
                      )} days old`}
                    />
                    <Chip label={cluster.status} color={cluster.status === 'Pending' ? 'warning' : 'info'} size="small" />
                  </ListItem>
                ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const AnalyticsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          Department Performance Analytics
        </Typography>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card sx={{ height: 400 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Weekly Performance Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.performance.weeklyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <ChartTooltip />
                <Legend />
                <Bar dataKey="assigned" fill={theme.palette.primary.main} name="Assigned" />
                <Bar dataKey="resolved" fill={theme.palette.success.main} name="Resolved" />
                <Bar dataKey="pending" fill={theme.palette.warning.main} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card sx={{ height: 400 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Efficiency Score
            </Typography>
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
              <CircularProgress
                variant="determinate"
                value={dashboardData.analytics.efficiencyScore || 0}
                size={120}
                thickness={4}
                sx={{
                  color: theme.palette.success.main,
                  transform: 'rotate(-90deg) !important'
                }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h4" component="div" fontWeight="bold" color="text.secondary">
                  {dashboardData.analytics.efficiencyScore || 0}%
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Based on resolution time and completion rate
            </Typography>
            <Chip
              label={
                dashboardData.analytics.efficiencyScore >= 80
                  ? 'Excellent'
                  : dashboardData.analytics.efficiencyScore >= 60
                  ? 'Good'
                  : 'Needs Improvement'
              }
              color={
                dashboardData.analytics.efficiencyScore >= 80
                  ? 'success'
                  : dashboardData.analytics.efficiencyScore >= 60
                  ? 'primary'
                  : 'warning'
              }
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ height: 350 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Issue Categories
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboardData.analytics.categoryBreakdown || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <ChartTooltip />
                <Bar dataKey="count" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ height: 350 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Response Time Analysis
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dashboardData.performance.responseTimeData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip />
                <Line type="monotone" dataKey="avgResponseTime" stroke={theme.palette.info.main} strokeWidth={3} dot={{ fill: theme.palette.info.main, r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (loading && dashboardData.clusters.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchDashboardData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Department Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Welcome back, {user?.username}! Here's your department performance overview.
        </Typography>

        {/* Notification Badge */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Badge badgeContent={dashboardData.analytics.pendingCount || 0} color="warning">
            <Chip icon={<Notifications />} label="Pending Issues" color="warning" variant="outlined" />
          </Badge>
          <Badge badgeContent={dashboardData.analytics.highPriorityCount || 0} color="error">
            <Chip icon={<PriorityHigh />} label="High Priority" color="error" variant="outlined" />
          </Badge>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Button
            startIcon={<Assessment />}
            onClick={() => setTabValue(0)}
            variant={tabValue === 0 ? 'contained' : 'text'}
            sx={{ m: 1 }}
          >
            Overview
          </Button>
          <Button
            startIcon={<Timeline />}
            onClick={() => setTabValue(1)}
            variant={tabValue === 1 ? 'contained' : 'text'}
            sx={{ m: 1 }}
          >
            Analytics
          </Button>
        </Box>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ mt: 3 }}>{tabValue === 0 ? <OverviewTab /> : <AnalyticsTab />}</Box>

      {/* Refresh Indicator */}
      {loading && (
        <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Container>
  );
};

export default DepartmentDashboard;
