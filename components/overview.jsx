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
  const [newData, setNewData] = useState(false)

  useEffect(() => {
    if(!newData) {
      fetch(`/api/server/institutions?userId=${userId}`, { method: "GET" })
        .then(res => res.json())
        .then(data => {
          setData(data)
          setLoading(false)
          setAccountsPlaceholder(false)

          setNewData(true) //ready for new data (bank account connection)
        })
        .catch(error => {
          window.alert(error)
          console.error(error)
        })
    }
  },[])

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
                  data ? <List className="pt-0">
                          {
                            data.map(institutions => {
                              const { item_id, access_token, name } = institutions

                              return (
                                <Accounts key={item_id} itemId={item_id} accessToken={access_token}
                                 name={name} loading={accountsLoading} setLoading={setAccountsLoading}
                                 accountsPlaceholder={accountsPlaceholder} />
                              )

                            })
                          }
                         </List>
                       : <></>
                }

                {
                  accountsPlaceholder ? <Accounts loading={accountsLoading}
                                         accountsPlaceholder={accountsPlaceholder} />
                                      : <></>
                }

                <Link userId={userId} setAccountsPlaceholder={setAccountsPlaceholder}
                 setAccountsLoading={setAccountsLoading} setData={setData} setNewData={setNewData} />

              </div>
            </Zoom>
      }
    </>
  )
}


function Accounts({ itemId, accessToken, name, loading, setLoading, accountsPlaceholder }) {
  const [open, setOpen] = useState(false)
  const [accounts, setAccounts] = useState(null)
  const [numbers, setNumbers] = useState(null)

  useEffect(() => {
    if (!accountsPlaceholder && loading) {
      fetch(`/api/server/plaid/auth`, { method: "GET" })
        .then(res => res.json())
        .then(data => {
          setAccounts(data.accounts)
          setNumbers(data.numbers.ach)
          setLoading(false)

          // if(accounts !== null && numbers !== null) {
          //   accounts.map(account => {
          //     const index = numbers.map(a => a.account_id).indexOf(account.account_id)
          //     const accountNumber = numbers[index].account
          //     const routingNumber = numbers[index].routing

          //     const accountData = {
          //       account_id: account.account_id,
          //       item_id: itemId,
          //       name: account.name,
          //       type: account.subtype,
          //       balance: account.balances.current,
          //       account_num: accountNumber,
          //       routing_num: routingNumber
          //     }

          //     fetch('/api/server/accounts', {
          //       method: "POST",
          //       headers: { "Content-Type": "application/json" },
          //       body: JSON.stringify(accountData)
          //     })
          //       .then(() => {

          //       })
          //       .catch(err => {
          //         window.alert(error)
          //         console.error(error)
          //       })
          //   })
          // }

        })
        .catch(error => {
          window.alert(error)
          console.error(error)
        })
    }
  })

  return (
    <>
      <Zoom in>
        <Paper className="d-flex flex-column align-items-center" sx={
         {minWidth: "80%", margin:"5rem 1rem", bgcolor:"#FFD800", borderRadius:"8px"}}
         elevation={3}>

          {
            loading ? <Skeleton className="mb-0 text-center m-5" variant="rectangle" sx={{borderRadius: '1rem'}}>
                        <h2 className="mb-0" style={{fontWeight: 'bold'}}>Institution name</h2>
                      </Skeleton>
                    : <h2 className="mb-0 text-center m-5" style={{fontWeight: 'bold'}}>{name}</h2>
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
                <>
                  {
                    accounts.map(account => {
                      const index = numbers.map(a => a.account_id).indexOf(account.account_id)
                      const accountNumber = numbers[index].account
                      const routingNumber = numbers[index].routing

                      const accountData = {
                        account_id: account.account_id,
                        item_id: itemId,
                        name: account.name,
                        type: account.subtype,
                        balance: account.balances.current,
                        account_num: accountNumber,
                        routing_num: routingNumber
                      }

                      return (
                        <Card sx={{margin: "3rem", cursor: "pointer", borderRadius:"1rem"}} onMouseEnter={(e) =>
                        e.currentTarget.style.boxShadow="0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)"}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow="0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)"}
                        onClick={() => setOpen(true)} key={accountData.account_id}>
                          <CardHeader avatar={
                            <Avatar sx={{bgcolor:"#FFD800"}}>
                              <AccountBalanceRounded color="primary" />
                            </Avatar>
                          } title={accountData.name} />
                          <CardContent>
                            <div style={{height: 0}} className="invisible">
                              Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque quasi porro quam voluptas fugiat dicta obcaecati repellat ut, at ratione eum dolores consectetur. Nisi obcaecati culpa laboriosam alias reprehenderit illum.
                            </div>
                            <div className="d-flex justify-content-between">
                              <div>
                                <div className="text-capitalize">{accountData.type}</div>
                                <div>Routing number: {routingNumber}</div>
                                <div>Account number: {accountNumber}</div>
                              </div>
                              <div className="d-flex align-items-center" style={{fontSize: '24px'}}>
                                ${accountData.balance}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  }
                </>
          }
          <AccountDetails open={open} setOpen={setOpen} />

        </Paper>
      </Zoom>
    </>
  )
}


const Transition = forwardRef(function Transition(props, ref) {
  return <Slide in direction="up" timeout={1000} ref={ref} {...props} />
})

function AccountDetails({ open, setOpen }) {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState(null)

  return (
    <>
      <Dialog open={open} TransitionComponent={Transition} onClose={() => setOpen(false)}
       closeAfterTransition keepMounted fullScreen PaperProps={{style: {background: "#00C169",
       color: "white", alignItems: "center", padding: "3rem 0rem"}}}>
        <DialogTitle className="w-100 text-center">
          {
            loading ? <Skeleton variant="rectangle" sx={{margin: 'auto', borderRadius: '1rem'}}>
                        <h2 className={styles.font}>Fidelity Checking</h2>
                      </Skeleton>
                    : <h2 className={styles.font}>Fidelity Checking</h2>
          }
        </DialogTitle>
        <DialogContent className="w-100">

          <DialogContentText className={styles.font} sx={{marginBottom:'3rem', color:'white'}}>
            {
              loading ? <Skeleton variant="rectangle" sx={{margin: 'auto', borderRadius: '1rem'}}>
                          <h4 className="text-center">Current Balance</h4>
                        </Skeleton>
                      : <h4 className="text-center">Current Balance</h4>
            }
          </DialogContentText>

          <Card sx={{bgcolor: '#FFD800', borderRadius: '1rem'}} className="w-75 m-auto">
            <CardContent>
              <h4>Transactions</h4>
              <List>
                {
                  loading ? <>
                              <Skeleton variant="rectangle" sx={{margin:'8px 16px', borderRadius: '1rem'}}>
                                <ListItem sx={{width: '100vw'}}>
                                  <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: "white" }}>
                                      <AttachMoneyRounded color="primary" />
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText primary="$420.69" secondary="June 6th, 2023" />
                                </ListItem>
                              </Skeleton>
                              <Skeleton variant="rectangle" sx={{margin:'8px 16px', borderRadius: '1rem'}}>
                                <ListItem sx={{width: '100vw'}}>
                                  <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: "white" }}>
                                      <AttachMoneyRounded color="primary" />
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText primary="$3.33" secondary="April 20th, 2023" />
                                </ListItem>
                              </Skeleton>
                              <Skeleton variant="rectangle" sx={{margin:'8px 16px', borderRadius: '1rem'}}>
                                <ListItem sx={{width: '100vw'}}>
                                  <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: "white" }}>
                                      <AttachMoneyRounded color="primary" />
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText primary="$69.42" secondary="May 4th, 2023" />
                                </ListItem>
                              </Skeleton>
                            </>
                          : <>
                              {
                                transactions ? <>
                                                 {
                                                    transactions.map(transaction => {
                                                      const { account_id, amount, date, name } = transaction

                                                      return (
                                                        <ListItem key={account_id} sx={{ width: '100vw' }}>
                                                          <ListItemAvatar>
                                                            <Avatar sx={{ bgcolor: "white" }}>
                                                              <AttachMoneyRounded color="primary" />
                                                            </Avatar>
                                                          </ListItemAvatar>
                                                          <ListItemText primary={name} secondary={amount} />
                                                        </ListItem>
                                                      )
                                                    })
                                                 }
                                               </>
                                             : <></>

                              }
                            </>
                }
              </List>
            </CardContent>
            <CardActions>
              {
                //transactions refresh?
              }
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
