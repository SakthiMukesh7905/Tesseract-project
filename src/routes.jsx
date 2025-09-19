import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";  // Default import
import Issues from "./pages/Issues";  // Default import
import Progress from "./pages/Progress";  // Default import
import Community from "./pages/Community";  // Default import
import Login from "./pages/Login";  // Default import
import DepartmentDashboard from "./pages/DepartmentDashboard";  // Default import
import DepartmentIssues from "./pages/DepartmentIssues";  // Default import

import { Navigate } from "react-router-dom";

function DefaultRedirect() {
  const token = localStorage.getItem("adminToken");
  const user = JSON.parse(localStorage.getItem("adminInfo") || "{}");
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  // Redirect based on user role
  if (user.role === "department") {
    return <Navigate to="/department" />;
  } else if (user.role === "superadmin" || user.role === "admin") {
    return <Navigate to="/dashboard" />;
  }
  
  // Default fallback
  return <Navigate to="/login" />;
}

function PrivateRoute({ children, requiredRoles }) {
  const token = localStorage.getItem("adminToken");
  const user = JSON.parse(localStorage.getItem("adminInfo") || "{}");
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  // Check if user has any of the required roles
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    let redirectPath = "/dashboard";
    if (user.role === "department") {
      redirectPath = "/department";
    } else if (user.role === "superadmin" || user.role === "admin") {
      redirectPath = "/dashboard";
    }
    return <Navigate to={redirectPath} />;
  }
  
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Admin and Superadmin Routes */}
      <Route path="/dashboard" element={
        <PrivateRoute requiredRoles={["admin", "superadmin"]}>
          <Dashboard />
        </PrivateRoute>
      } />
      <Route path="/issues" element={
        <PrivateRoute requiredRoles={["admin", "superadmin"]}>
          <Issues />
        </PrivateRoute>
      } />
      <Route path="/progress" element={
        <PrivateRoute requiredRoles={["admin", "superadmin"]}>
          <Progress />
        </PrivateRoute>
      } />
      <Route path="/community" element={
        <PrivateRoute requiredRoles={["admin", "superadmin"]}>
          <Community />
        </PrivateRoute>
      } />
      
      {/* Department Routes */}
      <Route path="/department" element={
        <PrivateRoute requiredRoles={["department"]}>
          <DepartmentDashboard />
        </PrivateRoute>
      } />
      <Route path="/department/issues" element={
        <PrivateRoute requiredRoles={["department"]}>
          <DepartmentIssues />
        </PrivateRoute>
      } />
      
      {/* Default redirect based on user role */}
      <Route path="/" element={<DefaultRedirect />} />
    </Routes>
  );
}
