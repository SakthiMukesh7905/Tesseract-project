import { Card, CardContent, Typography, Stack, Chip } from "@mui/material";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import { posts } from "../api/mockData";

export default function Community(){
  return(
    <>
      <Typography variant="h4" mb={2}>Community Feed</Typography>
      <Stack spacing={2}>
        {posts.map(p=>(
          <Card key={p.id}>
            <CardContent>
              <Typography>{p.text}</Typography>
              <Chip icon={<ThumbUpAltIcon/>} label={p.upvotes} size="small" sx={{mr:1}}/>
              {p.comments.slice(0,2).map(c=>(
                <Typography key={c.user} variant="body2" sx={{ml:3}}><b>{c.user}</b>: {c.text}</Typography>
              ))}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </>
  );
}
