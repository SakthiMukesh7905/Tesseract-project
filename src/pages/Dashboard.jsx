import React from "react";
import api from "../api";
import { 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  Box, 
  Paper, 
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
  Chip
} from "@mui/material";
import { 
  Assessment,
  CheckCircle,
  Pending,
  PlayArrow,
  TrendingUp,
  LocationOn,
  Refresh,
  Dashboard as DashboardIcon
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import ReactEcharts from "echarts-for-react";
import MapWidget from "../components/MapWidget";

// Enhanced StatsCard component
const EnhancedStatsCard = ({ label, value, icon, gradient, trend }) => {
  return (
    <Card 
      elevation={4}
      sx={{ 
        background: gradient,
        color: 'white',
        height: '140px',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
        }
      }}
    >
      <CardContent sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Icon */}
        <Box sx={{ 
          position: 'absolute', 
          top: -10, 
          right: -10, 
          opacity: 0.2 
        }}>
          {React.cloneElement(icon, { sx: { fontSize: 80 } })}
        </Box>
        
        {/* Content */}
        <Box sx={{ zIndex: 1 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            {value.toLocaleString()}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            {label}
          </Typography>
        </Box>
        
        {/* Trend indicator */}
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <TrendingUp fontSize="small" />
            <Typography variant="caption" sx={{ ml: 0.5, opacity: 0.8 }}>
              {trend}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    resolved: 0,
    pending: 0,
    inProgress: 0,
    totalReports: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchStats = () => {
    setLoading(true);
    api.get("/posts/stats")
      .then(res => {
        setStats(res.data);
        setLastUpdated(new Date());
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching stats:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced Pie Chart Options
  const pieOpt = {
    tooltip: { 
      trigger: "item",
      formatter: '{a} <br/>{b}: {c} ({d}%)',
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      textStyle: {
        color: '#666',
        fontSize: 12
      }
    },
    series: [{
      name: 'Issue Status',
      type: "pie",
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 18,
          fontWeight: 'bold'
        },
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { 
          name: "Resolved", 
          value: stats.resolved,
          itemStyle: { color: '#4caf50' }
        },
        { 
          name: "Pending", 
          value: stats.pending,
          itemStyle: { color: '#ff9800' }
        },
        { 
          name: "In Progress", 
          value: stats.inProgress,
          itemStyle: { color: '#2196f3' }
        }
      ]
    }]
  };

  // Bar Chart for trends (bonus chart)
  const barOpt = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      textStyle: { color: '#fff' }
    },
    xAxis: {
      type: 'category',
      data: ['Resolved', 'In Progress', 'Pending'],
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisTick: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisTick: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666' },
      splitLine: { lineStyle: { color: '#f0f0f0' } }
    },
    series: [{
      data: [
        { value: stats.resolved, itemStyle: { color: '#4caf50' } },
        { value: stats.inProgress, itemStyle: { color: '#2196f3' } },
        { value: stats.pending, itemStyle: { color: '#ff9800' } }
      ],
      type: 'bar',
      borderRadius: [4, 4, 0, 0],
      barWidth: '60%'
    }]
  };

  return (
    <Box sx={{ m: 3 }}>
      {/* Header Section */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white',
          borderRadius: 3
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              🏛️ Admin Dashboard
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Real-time monitoring of civic issues and reports
            </Typography>
            <Chip 
              icon={<Assessment />}
              label={`Last updated: ${lastUpdated.toLocaleTimeString()}`}
              variant="outlined"
              sx={{ 
                mt: 2, 
                color: 'white', 
                borderColor: 'rgba(255,255,255,0.3)',
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
          </Box>
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={fetchStats}
              disabled={loading}
              sx={{ 
                color: 'white', 
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
        {loading && <LinearProgress sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />}
      </Paper>

      <Grid container spacing={4}>
        {/* Enhanced Stats Cards */}
        <Grid item xs={12} sm={6} lg={3}>
          <EnhancedStatsCard 
            label="Total Reports" 
            value={stats.totalReports}
            icon={<DashboardIcon />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            trend="+12% this month"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <EnhancedStatsCard 
            label="Resolved Issues" 
            value={stats.resolved}
            icon={<CheckCircle />}
            gradient="linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)"
            trend="+8% this week"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <EnhancedStatsCard 
            label="Pending Issues" 
            value={stats.pending}
            icon={<Pending />}
            gradient="linear-gradient(135deg, #ff9800 0%, #ffc107 100%)"
            trend="Needs attention"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <EnhancedStatsCard 
            label="In Progress" 
            value={stats.inProgress}
            icon={<PlayArrow />}
            gradient="linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)"
            trend="Active now"
          />
        </Grid>

        {/* Map Widget */}
        <Grid item xs={12} lg={8}>
          <Card elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ 
              background: 'linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%)', 
              p: 2,
              borderBottom: '1px solid #dee2e6'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Issues Map
                </Typography>
                <Chip label="Live" color="success" size="small" />
              </Box>
            </Box>
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <MapWidget />
            </CardContent>
          </Card>
        </Grid>

        {/* Charts Section */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={3}>
            {/* Pie Chart */}
            <Grid item xs={12}>
              <Card elevation={4} sx={{ borderRadius: 3, height: '300px' }}>
                <Box sx={{ 
                  background: 'linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%)', 
                  p: 2,
                  borderBottom: '1px solid #dee2e6'
                }}>
                  <Typography variant="h6" fontWeight="bold">
                    📊 Status Distribution
                  </Typography>
                </Box>
                <CardContent sx={{ height: 'calc(100% - 64px)' }}>
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Typography color="text.secondary">Loading chart...</Typography>
                    </Box>
                  ) : (
                    <ReactEcharts 
                      option={pieOpt} 
                      style={{ height: '100%', width: '100%' }}
                      opts={{ renderer: 'svg' }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Additional Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card elevation={4} sx={{ borderRadius: 3 }}>
            <Box sx={{ 
              background: 'linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%)', 
              p: 2,
              borderBottom: '1px solid #dee2e6'
            }}>
              <Typography variant="h6" fontWeight="bold">
                📈 Status Overview
              </Typography>
            </Box>
            <CardContent>
              <ReactEcharts 
                option={barOpt} 
                style={{ height: '250px' }}
                opts={{ renderer: 'svg' }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card elevation={4} sx={{ borderRadius: 3 }}>
            <Box sx={{ 
              background: 'linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%)', 
              p: 2,
              borderBottom: '1px solid #dee2e6'
            }}>
              <Typography variant="h6" fontWeight="bold">
                ⚡ Quick Actions
              </Typography>
            </Box>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { 
                        bgcolor: '#f5f5f5', 
                        transform: 'translateY(-2px)',
                        boxShadow: 2
                      }
                    }}
                  >
                    <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2" fontWeight="bold">
                      Mark Resolved
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { 
                        bgcolor: '#f5f5f5', 
                        transform: 'translateY(-2px)',
                        boxShadow: 2
                      }
                    }}
                  >
                    <Assessment color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2" fontWeight="bold">
                      Generate Report
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { 
                        bgcolor: '#f5f5f5', 
                        transform: 'translateY(-2px)',
                        boxShadow: 2
                      }
                    }}
                  >
                    <LocationOn color="error" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2" fontWeight="bold">
                      Priority Areas
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { 
                        bgcolor: '#f5f5f5', 
                        transform: 'translateY(-2px)',
                        boxShadow: 2
                      }
                    }}
                  >
                    <Refresh color="info" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2" fontWeight="bold">
                      Bulk Update
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Footer Stats */}
      <Paper 
        sx={{ 
          mt: 4, 
          p: 3, 
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderRadius: 3
        }}
      >
        <Grid container spacing={3} sx={{ textAlign: 'center' }}>
          <Grid item xs={12} sm={3}>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {((stats.resolved / stats.totalReports) * 100 || 0).toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Resolution Rate
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              2.3
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg. Response Time (days)
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {stats.pending + stats.inProgress}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Issues
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="h4" fontWeight="bold" color="info.main">
              95%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Citizen Satisfaction
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}