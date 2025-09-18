import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";  // Default import
import Issues from "./pages/Issues";  // Default import
import Progress from "./pages/Progress";  // Default import
import Community from "./pages/Community";  // Default import
import Login from "./pages/Login";  // Default import


import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/login" />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
      <Route path="/issues" element={
        <PrivateRoute>
          <Issues />
        </PrivateRoute>
      } />
      <Route path="/progress" element={
        <PrivateRoute>
          <Progress />
        </PrivateRoute>
      } />
      <Route path="/community" element={
        <PrivateRoute>
          <Community />
        </PrivateRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
