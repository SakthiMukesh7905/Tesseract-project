import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";  // Default import
import Issues from "./pages/Issues";  // Default import
import Progress from "./pages/Progress";  // Default import
import Community from "./pages/Community";  // Default import
import Login from "./pages/Login";  // Default import

export default function AppRoutes() {  // Default export
  return (
    <Routes>
      <Route path="/login" element={<Login/>}/>
      <Route path="/" element={<Dashboard/>}/>
      <Route path="/issues" element={<Issues/>}/>
      <Route path="/progress" element={<Progress/>}/>
      <Route path="/community" element={<Community/>}/>
    </Routes>
  );
}
