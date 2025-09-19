import { Drawer, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import PeopleIcon from "@mui/icons-material/People";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

export default function AppDrawer() {
  const loc = useLocation();
  const { user } = useAuth();

  // Navigation items for admin
  const adminNav = [
    { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { label: "Reported Issues", icon: <ListAltIcon />, path: "/issues" },
    { label: "Progress Tracking", icon: <TrackChangesIcon />, path: "/progress" },
    { label: "Community", icon: <PeopleIcon />, path: "/community" }
  ];

  // Navigation items for department
  const departmentNav = [
    { label: "Department Dashboard", icon: <DashboardIcon />, path: "/department" },
    { label: "Assigned Issues", icon: <ListAltIcon />, path: "/department/issues" }
  ];

  // Choose nav based on role
  const navItems = user?.role === "department" ? departmentNav : adminNav;

  return (
    <Drawer variant="permanent" sx={{ "& .MuiDrawer-paper": { width: 240, top: 64 } }}>
      <List>
        {navItems.map(({ label, icon, path }) => (
          <ListItemButton
            key={label}
            component={Link}
            to={path}
            selected={loc.pathname === path}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
