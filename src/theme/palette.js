import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#097969" },      // Teal Green
    secondary: { main: "#283593" },    // Indigo
    background: { default: "#F5F8FA" },// Off-white
    text: { primary: "#222E38" },      // Charcoal
    status: { danger: "#d32f2f" }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          transition: "transform .2s",
          "&:hover": { transform: "translateY(-2px)" }
        }
      }
    }
  }
});
export default theme;
