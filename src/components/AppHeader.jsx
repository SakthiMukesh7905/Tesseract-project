import { AppBar, Badge, IconButton, Toolbar, Typography } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNotifications } from "./Notifications";

export default function AppHeader() {
  const { unread } = useNotifications();
  return (
    <AppBar position="fixed" color="secondary" sx={{ zIndex: 1201 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Civic Issue Admin</Typography>
        <IconButton color="inherit">
          <Badge badgeContent={unread} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
