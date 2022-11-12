import { Skeleton } from "@mui/material";

export default function Placeholder() {
  return (
    <Skeleton variant="rectangular" sx={{borderRadius: '1rem'}} width="100%">
      <div style={{height: '69vh'}}></div>
    </Skeleton>
  )
}
