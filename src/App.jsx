import { BrowserRouter, Navigate } from "react-router-dom";
import { Box, Toolbar } from "@mui/material";
import AppHeader from "./components/AppHeader";  // Default import
import AppDrawer from "./components/AppDrawer";  // Default import
import Routes from "./routes";  // Default import
import { NotificationsProvider } from "./components/Notifications";
import { AuthProvider, useAuth } from "./utils/AuthContext";

function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Routes /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NotificationsProvider>
          <AppHeader />
          <AppDrawer />
          <Box component="main" sx={{ flexGrow:1, p:3, ml:30 }}>
            <Toolbar/>
            <ProtectedRoutes />
          </Box>
        </NotificationsProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
