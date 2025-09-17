import { BrowserRouter } from "react-router-dom";
import { Box, Toolbar } from "@mui/material";
import AppHeader from "./components/AppHeader";  // Default import
import AppDrawer from "./components/AppDrawer";  // Default import
import Routes from "./routes";  // Default import
import { NotificationsProvider } from "./components/Notifications";  // This is a named export—keep the curly braces!

export default function App() {
  return (
    <BrowserRouter>
      <NotificationsProvider>
        <AppHeader />
        <AppDrawer />
        <Box component="main" sx={{ flexGrow:1, p:3, ml:30 }}>
          <Toolbar/>  {/* offset */}
          <Routes />
        </Box>
      </NotificationsProvider>
    </BrowserRouter>
  );
}
