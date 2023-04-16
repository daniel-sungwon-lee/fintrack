import { Avatar, Card, CardContent, CardHeader, Dialog, DialogActions, DialogContent,
         DialogContentText, DialogTitle, Fab, Slide, Paper, Zoom, Skeleton } from "@mui/material"
import { AccountBalanceRounded, CloseRounded } from "@mui/icons-material"
import { useEffect, useState, forwardRef } from "react"
import Placeholder from "./placeholder"
import styles from '../styles/Home.module.css'

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

                <Accounts data={data} />

                <Link />

              </div>
            </Zoom>
      }
    </>
  )
}


function Accounts({ data }) {
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setLoading(false)
  })

  return (
    <>
      <Zoom in>
        <Paper sx={{minWidth: "80%", margin:"5rem 1rem", bgcolor:"#FFD800"}} elevation={3}>

          { loading
              ? <Skeleton variant="rectangle" sx={{borderRadius: '1rem', margin: '3rem'}}>
                  <Card sx={{margin: "", cursor: "pointer", borderRadius:"1rem"}} onMouseEnter={(e) =>
                   e.currentTarget.style.boxShadow="0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)"}
                   onMouseLeave={(e) => e.currentTarget.style.boxShadow="0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)"}
                   onClick={() => setOpen(true)}>
                    <CardHeader avatar={
                      <Avatar sx={{bgcolor:"#FFD800"}}>
                        <AccountBalanceRounded color="primary" />
                      </Avatar>
                    } title="Bank Account" />
                    <CardContent>
                      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam quisquam eligendi repellendus voluptas ducimus minus provident rem beatae, quia cumque optio quidem facilis magni quo tenetur! Iste hic alias provident.
                    </CardContent>
                  </Card>
                </Skeleton>
              :
                <Card sx={{margin: "3rem", cursor: "pointer", borderRadius:"1rem"}} onMouseEnter={(e) =>
                e.currentTarget.style.boxShadow="0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow="0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)"}
                onClick={() => setOpen(true)}>
                  <CardHeader avatar={
                    <Avatar sx={{bgcolor:"#FFD800"}}>
                      <AccountBalanceRounded color="primary" />
                    </Avatar>
                  } title="Bank Account" />
                  <CardContent>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam quisquam eligendi repellendus voluptas ducimus minus provident rem beatae, quia cumque optio quidem facilis magni quo tenetur! Iste hic alias provident.
                  </CardContent>
                </Card>
          }
          <AccountDetails open={open} setOpen={setOpen} data={data} />

        </Paper>
      </Zoom>
    </>
  )
}


const Transition = forwardRef(function Transition(props, ref) {
  return <Slide in direction="up" timeout={1000} ref={ref} {...props} />
})

function AccountDetails({ open, setOpen, data }) {
  const [loading, setLoading] = useState(true)

  return (
    <>
      <Dialog open={open} TransitionComponent={Transition} onClose={() => setOpen(false)}
       closeAfterTransition keepMounted fullScreen PaperProps={{style: {background: "#00C169",
       color: "white", alignItems: "center"}}}>
        <DialogTitle>
          Bank Account Detail
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This is the placeholder text for the dialog content, which will provide
            the user's bank account details such as the balance and transactions
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{position:'absolute', top:"0.5rem", right:"0.5rem"}}>
          <Fab size='medium' color='error' variant='extended' onClick={() => setOpen(false)}>
            <div className={styles.fab}>
              <CloseRounded style={{marginRight:'0.25rem'}} />
              Close
            </div>
          </Fab>
        </DialogActions>
      </Dialog>
    </>
  )
}
