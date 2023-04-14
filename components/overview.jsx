import { Avatar, Card, CardContent, CardHeader, Paper, Zoom } from "@mui/material"
import { AccountBalanceRounded } from "@mui/icons-material"
import { useEffect, useState } from "react"
import Placeholder from "./placeholder"

import Link from './plaid/link.tsx'

export default function Overview() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    setLoading(false)
  })

  return (
    <>
      {
        loading
          ? <Placeholder />
          :
            <Zoom in>
              <div className="d-flex flex-column justify-content-center align-items-center"
               style={{minHeight: '50vh', marginBottom: '7rem'}}>

                <Account data={data} />

                <Link />

              </div>
            </Zoom>
      }
    </>
  )
}


function Account({ data }) {
  const [loading, setLoading] = useState(true)
  const [hover, setHover] = useState(false)

  return (
    <>
      <Zoom in>
        <Paper sx={{minWidth: "80%", margin:"5rem 1rem", bgcolor:"#FFD800"}} elevation={3}>

          <Card sx={{margin: "3rem", cursor: "pointer"}} raised={hover}
           onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <CardHeader avatar={
              <Avatar sx={{bgcolor:"#FFD800"}}>
                <AccountBalanceRounded color="primary" />
              </Avatar>
            } title="Bank Account" />
            <CardContent>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam quisquam eligendi repellendus voluptas ducimus minus provident rem beatae, quia cumque optio quidem facilis magni quo tenetur! Iste hic alias provident.
            </CardContent>
          </Card>

          <Card sx={{ margin: "3rem", cursor: "pointer" }} raised={hover}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <CardHeader avatar={
              <Avatar sx={{ bgcolor: "#FFD800" }}>
                <AccountBalanceRounded color="primary" />
              </Avatar>
            } title="Bank Account" />
            <CardContent>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam quisquam eligendi repellendus voluptas ducimus minus provident rem beatae, quia cumque optio quidem facilis magni quo tenetur! Iste hic alias provident.
            </CardContent>
          </Card>

          <Card sx={{ margin: "3rem", cursor: "pointer" }} raised={hover}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <CardHeader avatar={
              <Avatar sx={{ bgcolor: "#FFD800" }}>
                <AccountBalanceRounded color="primary" />
              </Avatar>
            } title="Bank Account" />
            <CardContent>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam quisquam eligendi repellendus voluptas ducimus minus provident rem beatae, quia cumque optio quidem facilis magni quo tenetur! Iste hic alias provident.
            </CardContent>
          </Card>

        </Paper>
      </Zoom>
    </>
  )
}
