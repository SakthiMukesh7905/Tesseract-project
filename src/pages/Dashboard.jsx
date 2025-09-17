import { Grid, Typography, Card, CardContent } from "@mui/material";
import { issues } from "../api/mockData";  // Ensure this path is correct
import { StatsCard } from "../components/StatsCard";
import ReactEcharts from "echarts-for-react";
import MapWidget from "../components/MapWidget";

export default function Dashboard() {
  // Safe handling: Use optional chaining and fallback to 0 or empty array
  const total = issues?.length ?? 0;  // If issues is undefined, total = 0
  const statuses = (issues ?? []).reduce((a, i) => {  // Fallback to empty array
    a[i.status] = (a[i.status] || 0) + 1;
    return a;
  }, {});

  const pieOpt = {
    tooltip: { trigger: "item" },
    series: [{ type: "pie", data: Object.entries(statuses).map(([k, v]) => ({ name: k, value: v })) }]
  };

  return (
    <>
      <Typography variant="h4" mb={2}>Overview</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}><StatsCard label="Total Issues" value={total}/></Grid>
        <Grid item xs={12} md={9}><MapWidget/></Grid>

        <Grid item xs={12} md={6}>
          <Card><CardContent><ReactEcharts option={pieOpt} style={{height:300}}/></CardContent></Card>
        </Grid>

        {/* Add bar chart for issue types, timeline feed, high-impact cards similarly */}
      </Grid>
    </>
  );
}
