import { Box, Button, Card, CardContent, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login(){
  const nav=useNavigate();
  const [err,setErr]=useState(false);
  const handle=()=>{ nav("/"); };

  return(
    <Box sx={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center", bgcolor:"#F5F8FA" }}>
      <Card sx={{ width:340, p:3 }}>
        <CardContent>
          <Typography variant="h5" mb={2}>Admin Login</Typography>
          <TextField fullWidth label="Email" type="email" margin="normal"/>
          <TextField fullWidth label="Password" type="password" margin="normal" error={err}/>
          {err && <Typography color="error" variant="body2">Invalid credentials</Typography>}
          <Button fullWidth variant="contained" sx={{ mt:2 }} onClick={handle}>Login</Button>
        </CardContent>
      </Card>
    </Box>
  );
}
