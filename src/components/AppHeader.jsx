import { AppBar, Badge, IconButton, Toolbar, Typography, Button } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNotifications } from "./Notifications";
import { useAuth } from "../utils/AuthContext";

export default function AppHeader() {
  const { unread } = useNotifications();
  const { isAuthenticated, logout } = useAuth();
  return (
    <AppBar position="fixed" color="secondary" sx={{ zIndex: 1201 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Civic Issue Admin</Typography>
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
