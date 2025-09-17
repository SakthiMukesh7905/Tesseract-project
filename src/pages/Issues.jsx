import { DataGrid } from "@mui/x-data-grid";
import { Button, Typography } from "@mui/material";
import { issues } from "../api/mockData";

export default function Issues(){
  const columns=[
    {field:"desc",headerName:"Description",flex:1},
    {field:"reporter",headerName:"Reporter",width:120},
    {field:"location",headerName:"Location",width:120},
    {field:"date",headerName:"Date/Time",width:180},
    {field:"media",headerName:"Media",width:100,renderCell:({value})=>value?"📎":""}
  ];
  return(
    <>
      <Typography variant="h4" mb={2}>Reported Issues</Typography>
      <DataGrid rows={issues} columns={columns} autoHeight pageSize={8}/>
      <Button variant="contained" sx={{ mt:2 }}>Cluster</Button>
    </>
  );
}
