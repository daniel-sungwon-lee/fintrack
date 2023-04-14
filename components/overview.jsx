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

  return (
    <>
      <Zoom in>
        <Paper sx={{minWidth: "80%", margin:"5rem 1rem", bgcolor:"#FFD800"}} elevation={3}>

          <Card sx={{margin: "3rem", cursor: "pointer"}} onMouseEnter={(e) =>
           e.currentTarget.style.boxShadow="0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)"}
           onMouseLeave={(e) => e.currentTarget.style.boxShadow="0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)"}>
            <CardHeader avatar={
              <Avatar sx={{bgcolor:"#FFD800"}}>
                <AccountBalanceRounded color="primary" />
              </Avatar>
            } title="Bank Account" />
            <CardContent>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam quisquam eligendi repellendus voluptas ducimus minus provident rem beatae, quia cumque optio quidem facilis magni quo tenetur! Iste hic alias provident.
            </CardContent>
          </Card>

          <Card sx={{ margin: "3rem", cursor: "pointer" }} onMouseEnter={(e) =>
            e.currentTarget.style.boxShadow = "0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)"}>
            <CardHeader avatar={
              <Avatar sx={{ bgcolor: "#FFD800" }}>
                <AccountBalanceRounded color="primary" />
              </Avatar>
            } title="Bank Account" />
            <CardContent>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam quisquam eligendi repellendus voluptas ducimus minus provident rem beatae, quia cumque optio quidem facilis magni quo tenetur! Iste hic alias provident.
            </CardContent>
          </Card>

          <Card sx={{ margin: "3rem", cursor: "pointer" }} onMouseEnter={(e) =>
            e.currentTarget.style.boxShadow = "0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)"}>
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
