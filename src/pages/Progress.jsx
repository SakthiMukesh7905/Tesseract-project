import { Card, CardContent, Grid, Typography, Chip } from "@mui/material";
import IssueStepper from "../components/IssueStepper";
import { issues } from "../api/mockData";

export default function Progress(){
  return(
    <>
      <Typography variant="h4" mb={2}>Progress Tracking</Typography>
      <Grid container spacing={2}>
        {issues.slice(0,8).map(i=>(
          <Grid item xs={12} md={6} key={i.id}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1">{i.desc}</Typography>
                <Chip label={i.location} color="secondary" size="small" sx={{mr:1}}/>
                <Chip label={i.type} size="small" />
                <IssueStepper stage={["Acknowledged","Dept Assigned","In Progress","Completed"].indexOf(i.status)}/>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
