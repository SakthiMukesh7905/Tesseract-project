import { Card, CardContent, Typography } from "@mui/material";
import CountUp from "react-countup";

export function StatsCard({label,value}) {
  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
        <Typography variant="h4">
          <CountUp end={value} duration={1.2} />
        </Typography>
      </CardContent>
    </Card>
  );
}
