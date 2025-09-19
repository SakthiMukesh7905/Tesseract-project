
import { Box, Button, Card, CardContent, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../utils/AuthContext";
import api from "../api";


export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setErr("");
    try {
      // Use the unified login endpoint from backend
      const res = await api.post("/admin/login", { email, password });
      
      // Store token and user data from backend response
      login(res.data.token, res.data.user);
      
      // Navigate based on user role from backend
      const userRole = res.data.user.role;
      let redirectPath = "/dashboard";
      
      if (userRole === "department") {
        redirectPath = "/department";
      } else if (userRole === "superadmin") {
        redirectPath = "/dashboard";
      } else if (userRole === "admin") {
        redirectPath = "/dashboard";
      }
      
      nav(redirectPath);
    } catch (e) {
      setErr(e?.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", bgcolor: "#F5F8FA" }}>
      <Card sx={{ width: 340, p: 3 }}>
        <CardContent>
          <Typography variant="h5" mb={2}>
            Admin Portal Login
          </Typography>
          
          <Typography variant="body2" color="text.secondary" mb={2}>
            Enter your credentials to access the admin portal. Your role will be determined automatically.
          </Typography>
          
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={!!err}
          />
          {err && <Typography color="error" variant="body2">{err}</Typography>}
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
