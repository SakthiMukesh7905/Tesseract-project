import { Drawer, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import PeopleIcon from "@mui/icons-material/People";
import { Link, useLocation } from "react-router-dom";

const nav = [
  { label:"Dashboard", icon:<DashboardIcon/>, path:"/" },
  { label:"Reported Issues", icon:<ListAltIcon/>, path:"/issues" },
  { label:"Progress Tracking", icon:<TrackChangesIcon/>, path:"/progress" },
  { label:"Community", icon:<PeopleIcon/>, path:"/community" }
];

export default function AppDrawer() {
  const loc = useLocation();
  return (
    <Drawer variant="permanent" sx={{ "& .MuiDrawer-paper":{ width:240, top:64 } }}>
      <List>
        {nav.map(({label,icon,path})=>(
          <ListItemButton key={label} component={Link} to={path} selected={loc.pathname===path}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={label}/>
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
