import { AppBar, Badge, IconButton, Toolbar, Typography, Button, Box, Chip } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNotifications } from "./Notifications";
import { useAuth } from "../utils/AuthContext";

export default function AppHeader() {
  const { unread } = useNotifications();
  const { isAuthenticated, logout, user } = useAuth();
  
  return (
    <AppBar position="fixed" color="secondary" sx={{ zIndex: 1201 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {user?.role === "department" ? "Department Portal" : "Civic Issue Admin"}
        </Typography>
        
        {isAuthenticated && user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Welcome, {user.username || user.name}
            </Typography>
            <Chip 
              label={user.role === "department" ? "Department" : "Admin"} 
              color={user.role === "department" ? "primary" : "secondary"}
              size="small"
            />
          </Box>
        )}
        
        <IconButton color="inherit">
          <Badge badgeContent={unread} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        {isAuthenticated && (
          <Button color="inherit" onClick={logout} sx={{ ml: 2 }}>
            Logout
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
