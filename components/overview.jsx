import { Avatar, Card, CardContent, CardHeader, Dialog, DialogActions, DialogContent,
         DialogContentText, DialogTitle, Fab, Slide, Paper, Zoom, Skeleton,
         CardActions, List, ListItem, ListItemAvatar, ListItemText} from "@mui/material"
import { AccountBalanceRounded, AttachMoneyRounded, CloseRounded } from "@mui/icons-material"
import { useEffect, useState, forwardRef } from "react"
import Placeholder from "./placeholder"
import styles from '../styles/Home.module.css'

import Link from './plaid/link.tsx'

export default function Overview({ userId }) {
  const [loading, setLoading] = useState(true)
  const [accountsPlaceholder, setAccountsPlaceholder] = useState(false)
  const [accountsLoading, setAccountsLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    //console.log(data)
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

                {
                  accountsPlaceholder ? <Accounts data={data} loading={accountsLoading} />
                                      : <></>
                }

                <Link userId={userId} setAccountsPlaceholder={setAccountsPlaceholder}
                 setAccountsLoading={setAccountsLoading} setData={setData} />

              </div>
            </Zoom>
      }
    </>
  )
}


function Accounts({ data, loading }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Zoom in>
        <Paper className="d-flex flex-column align-items-center" sx={
          {minWidth: "80%", margin:"5rem 1rem", bgcolor:"#FFD800"}} elevation={3}>

          {
            loading ? <Skeleton className="mb-0 text-center m-5" variant="rectangle" sx={{borderRadius: '1rem'}}>
                        <h2 className="mb-0">Institution name</h2>
                      </Skeleton>
                    : <h2 className="mb-0 text-center m-5">Institution name</h2>
          }

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
       color: "white", alignItems: "center", padding: "3rem 0rem"}}}>
        <DialogTitle className="w-100 text-center">
          <h2 className={styles.font}>Fidelity Checking</h2>
        </DialogTitle>
        <DialogContent className="w-100">

          <DialogContentText className={styles.font} sx={{marginBottom:'3rem', color:'white'}}>
            <h4 className="text-center">Current Balance</h4>
          </DialogContentText>

          <Card sx={{bgcolor: '#FFD800', borderRadius: '1rem'}} className="w-75 m-auto">
            <CardContent>
              <h4>Transactions</h4>
              <List>

                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{bgcolor: "white"}}>
                      <AttachMoneyRounded color="primary" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="$3.00" secondary="April 20th, 2023" />
                </ListItem>

                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "white" }}>
                      <AttachMoneyRounded color="primary" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="$69.42" secondary="May 4th, 2023" />
                </ListItem>

              </List>
            </CardContent>
            <CardActions>

            </CardActions>
          </Card>

        </DialogContent>
        <DialogActions sx={{position:'absolute', top:"0.25rem", right:"0.25rem"}}>
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
