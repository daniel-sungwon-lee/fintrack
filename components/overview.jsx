import { Avatar, Card, CardContent, CardHeader, Dialog, DialogActions, DialogContent,
         DialogContentText, DialogTitle, Fab, Slide, Paper, Zoom, Skeleton,
         CardActions, List, ListItem, ListItemAvatar, ListItemText,
         IconButton, Snackbar, Alert, CircularProgress, Tooltip } from "@mui/material"
import { AccountBalanceRounded, AttachMoneyRounded, CloseRounded,
         RecommendRounded, RemoveCircleRounded, ThumbUpRounded } from "@mui/icons-material"
import { useEffect, useState, forwardRef } from "react"
import dynamic from 'next/dynamic'
const Placeholder = dynamic(() => import('./placeholder'), { ssr: false })
import styles from '../styles/Home.module.css'

const Link = dynamic(() => import('./plaid/link'), { ssr: false })

const TransitionLeft = (props) => {
  return <Slide {...props} direction="right" />
}

export default function Overview({ userId }) {
  const [loading, setLoading] = useState(true)
  const [accountsPlaceholder, setAccountsPlaceholder] = useState(false)
  const [data, setData] = useState(null)
  const [newData, setNewData] = useState(false)
  const [openSnack, setOpenSnack] = useState(false)

  useEffect(() => {
    if(!newData && userId) {
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
  },[newData, userId])

  const handleSnackClose = (e, reason) => {
    if(reason === 'clickaway') {
      return
    }
    setOpenSnack(false)
  }

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
                                 name={name} accountsPlaceholder={accountsPlaceholder} institutions={data}
                                 setInstitutions={setData} setOpenSnack={setOpenSnack} />
                              )

                            })
                          }
                         </List>
                       : <></>
                }

                {
                  accountsPlaceholder ? <Accounts accountsPlaceholder={accountsPlaceholder} />
                                      : <></>
                }

                <Link userId={userId} setAccountsPlaceholder={setAccountsPlaceholder}
                 setData={setData} setNewData={setNewData} />

                <Snackbar open={openSnack} autoHideDuration={3333} onClose={handleSnackClose}
                  TransitionComponent={TransitionLeft}>
                  <Alert variant="filled" color="secondary" sx={{ width: '100%', color: 'black' }}
                    onClose={handleSnackClose}>
                    Bank removed
                  </Alert>
                </Snackbar>

              </div>
            </Zoom>
      }
    </>
  )
}


function Accounts({ itemId, accessToken, name, accountsPlaceholder, institutions, setInstitutions, setOpenSnack }) {
  const [loading, setLoading] = useState(true)
  const [end, setEnd] = useState(false)
  const [accounts, setAccounts] = useState(null)
  const [numbers, setNumbers] = useState(null)

  const [open, setOpen] = useState(false)
  const [accountName, setAccountName] = useState(null)
  const [accountBalance, setAccountBalance] = useState(null)
  const [rmOpen, setRmOpen] = useState(false)
  const [rmLoading, setRmLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {

      if (!accountsPlaceholder && loading && !end) {

        setEnd(true)

        await fetch(`/api/server/accounts?item_id=${itemId}`)
          .then(res => res.json())
          .then(async data => {
            if(data.length > 0) {
              setAccounts(data)
              setNumbers(null)
              setLoading(false)

            } else {
              await fetch(`/api/server/plaid/auth?accessToken=${accessToken}`, { method: "GET" })
                .then(res => res.json())
                .then(data => {
                  setAccounts(data.accounts)
                  setNumbers(data.numbers.ach)
                  setLoading(false)
                })
                .catch(error => {
                  window.alert(error)
                  console.error(error)
                })
            }
          })
          .catch(error => {
            window.alert(error)
            console.error(error)
          })
      }
    }
    fetchData()
  })

  const handleRemove = async () => {
    setRmLoading(true)

    await fetch(`/api/server/accounts?item_id=${itemId}`, {
      method: 'DELETE',
      headers: { "Content-Type": "application/json" }
    })
      .then(async () => {
        await fetch(`/api/server/institutions?item_id=${itemId}`, {
          method: 'DELETE',
          headers: { "Content-Type": "application/json" }
        })
          .then(() => {
            const itemIds = institutions.map(institution => institution.item_id)
            const idIndex = itemIds.indexOf(itemId)
            const newInstitutions = institutions.toSpliced(idIndex, 1)
            setInstitutions(newInstitutions)

            setRmOpen(false)
            setRmLoading(false)
            setOpenSnack(true)
          })
          .catch(error => {
            setRmLoading(false)
            window.alert(error)
            console.error(error)
          })
      })
      .catch(error => {
        setRmLoading(false)
        window.alert(error)
        console.error(error)
      })
  }

  return (
    <>
      <Zoom in>
        <Paper className="d-flex flex-column align-items-center" sx={{
         minWidth: "80%", margin:"5rem 1rem", bgcolor:"#FFD800", borderRadius:"8px",
         position: "relative"}} elevation={3}>

          {
            loading ? <Skeleton className="mb-0 text-center m-5" variant="rectangle" sx={{borderRadius: '1rem'}}>
                        <div className="h2 mb-0" style={{fontWeight: 'bold'}}>Institution name</div>
                      </Skeleton>
                    : <>
                        <Tooltip title="Remove" componentsProps={{tooltip:{sx:{bgcolor:"#d32f2f",
                         fontFamily:'Inter'}}}} placement="left">
                          <IconButton color="error" sx={{position:'absolute', top:'0.25rem', right:'0.25rem'}}
                          onClick={() => setRmOpen(true)}>
                            <RemoveCircleRounded fontSize="large" />
                          </IconButton>
                        </Tooltip>
                        <div className="h2 mb-0 text-center m-5" style={{fontWeight: 'bold'}}>{name}</div>
                      </>
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
                    } title="Bank Account" titleTypographyProps={{fontSize: '18px'}} />
                    <CardContent>
                      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam quisquam eligendi repellendus voluptas ducimus minus provident rem beatae, quia cumque optio quidem facilis magni quo tenetur! Iste hic alias provident.
                    </CardContent>
                  </Card>
                </Skeleton>
              :
                <>
                  {
                    accounts && numbers ? <>
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
                                       onClick={() => {
                                         setOpen(true)
                                         setAccountName(accountData.name)
                                         setAccountBalance(accountData.balance)
                                       }} key={accountData.account_id}>
                                         <CardHeader avatar={
                                           <Avatar sx={{bgcolor:"#FFD800"}}>
                                             <AccountBalanceRounded color="primary" />
                                           </Avatar>
                                         } title={accountData.name} titleTypographyProps={{fontSize: '18px'}} />
                                         <CardContent>
                                           <div style={{height: 0}} className="invisible">
                                             Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque quasi porro quam voluptas fugiat dicta obcaecati repellat ut, at ratione eum dolores consectetur. Nisi obcaecati culpa laboriosam alias reprehenderit illum.
                                           </div>
                                           <div className="d-flex justify-content-between">
                                             <div>
                                               <div className="h6 text-capitalize">{accountData.type}</div>
                                               <div className="h6">Routing number: {routingNumber}</div>
                                               <div className="h6">Account number: {accountNumber}</div>
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
                             : <>
                                {
                                  accounts && !numbers ? <>
                                                          {
                                                            accounts.map(account => {
                                                              const { account_id, item_id, name, type, balance,
                                                                      account_num, routing_num } = account

                                                              return (
                                                                <Card sx={{ margin: "3rem", cursor: "pointer", borderRadius: "1rem" }} onMouseEnter={(e) =>
                                                                  e.currentTarget.style.boxShadow = "0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)"}
                                                                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)"}
                                                                  onClick={() => {
                                                                    setOpen(true)
                                                                    setAccountName(name)
                                                                    setAccountBalance(balance)
                                                                  }} key={account_id}>
                                                                  <CardHeader avatar={
                                                                    <Avatar sx={{ bgcolor: "#FFD800" }}>
                                                                      <AccountBalanceRounded color="primary" />
                                                                    </Avatar>
                                                                  } title={name} titleTypographyProps={{ fontSize: '18px' }} />
                                                                  <CardContent>
                                                                    <div style={{ height: 0 }} className="invisible">
                                                                      Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque quasi porro quam voluptas fugiat dicta obcaecati repellat ut, at ratione eum dolores consectetur. Nisi obcaecati culpa laboriosam alias reprehenderit illum.
                                                                    </div>
                                                                    <div className="d-flex justify-content-between">
                                                                      <div>
                                                                        <div className="h6 text-capitalize">{type}</div>
                                                                        <div className="h6">Routing number: {routing_num}</div>
                                                                        <div className="h6">Account number: {account_num}</div>
                                                                      </div>
                                                                      <div className="d-flex align-items-center" style={{ fontSize: '24px' }}>
                                                                        ${balance}
                                                                      </div>
                                                                    </div>
                                                                  </CardContent>
                                                                </Card>
                                                              )
                                                            })
                                                          }
                                                         </>
                                                       : <></>
                                }
                               </>
                  }
                </>
          }
          <AccountDetails open={open} setOpen={setOpen} accountName={accountName} accountBalance={accountBalance}
           setAccountName={setAccountName} setAccountBalance={setAccountBalance} accessToken={accessToken} />

          <Dialog open={rmOpen} PaperProps={{style: {borderRadius: '1rem', padding: '1rem 2rem'}}}
           keepMounted onClose={(e,reason) => {
            if(reason === "backdropClick" || reason === 'escapeKeyDown') {
              return
            }
            setRmOpen(false)
           }}>
            <DialogTitle>Remove connected bank?</DialogTitle>
            <DialogContent></DialogContent>
            <DialogActions sx={{justifyContent: 'space-between'}}>
              <Fab size='medium' color='error' variant='extended'
                onClick={() => {
                  setRmOpen(false)
                }}>
                <div className={`${styles.fab} ${styles.font}`}>
                  <CloseRounded style={{ marginRight: '0.5rem' }} />
                  No
                </div>
              </Fab>
              <Fab size='medium' color='secondary' variant='extended' onClick={handleRemove}
               disabled={rmLoading}>
                <div style={{color: 'black'}} className={`${styles.fab} ${styles.font}`}>
                  {
                    rmLoading ? <CircularProgress color="inherit" size={20} thickness={5}
                                 sx={{marginRight: '0.5rem', color: 'rgba(0, 0, 0, 0.26)'}} />
                              : <ThumbUpRounded style={{ marginRight: '0.5rem' }} />
                  }
                  Absolutely
                </div>
              </Fab>
            </DialogActions>
          </Dialog>
        </Paper>
      </Zoom>
    </>
  )
}


const Transition = forwardRef(function Transition(props, ref) {
  return <Slide in direction="up" timeout={1000} ref={ref} {...props} />
})

function AccountDetails({ open, setOpen, accountName, accountBalance, setAccountName, setAccountBalance, accessToken }) {
  const [end, setEnd] = useState(false)
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState(null)

  useEffect(() => {
    if(loading && open && !end) {

      setEnd(true)

      fetch(`/api/server/plaid/transactions?accessToken=${accessToken}`, { method: 'GET' })
        .then(res => res.json())
        .then(transactions => {
          setTransactions(transactions.latest_transactions)
          setLoading(false)
        })
        .catch(error => {
          window.alert(error)
          console.error(error)
        })
    }
  },[loading, open, end, accessToken])

  return (
    <>
      <Dialog open={open} TransitionComponent={Transition} onClose={() => {
        setEnd(false)
        setLoading(true)
        setTransactions(null)
        setOpen(false)

        setAccountName(null)
        setAccountBalance(null)
       }}
       closeAfterTransition keepMounted fullScreen PaperProps={{style: {background: "#00C169",
       color: "white", alignItems: "center", padding: "3rem 0rem"}}} scroll="body">
        <DialogTitle className="w-100 text-center">
          {
            loading ? <Skeleton variant="rectangle" sx={{margin: 'auto', borderRadius: '1rem'}}>
                        <div className={`h2 ${styles.font}`}>Fidelity Checking</div>
                      </Skeleton>
                    : <div className={`h2 ${styles.font}`}>{accountName}</div>
          }
        </DialogTitle>
        <DialogContent className="w-100">

          <DialogContentText className={styles.font} sx={{marginBottom:'3rem', color:'white'}}>
            {
              loading ? <Skeleton variant="rectangle" sx={{margin: 'auto', borderRadius: '1rem'}}>
                          <span className="h4 text-center d-block">Current Balance</span>
                        </Skeleton>
                      : <span className="h4 text-center d-block">${accountBalance}</span>
            }
          </DialogContentText>

          <Card sx={{bgcolor: '#FFD800', borderRadius: '1rem'}} className="w-75 m-auto">
            <CardContent>
              <div className="h4 text-center m-3" style={{fontWeight: 'bold'}}>Transactions</div>
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
                                                      const { transaction_id, account_id, amount, date, name, iso_currency_code } = transaction
                                                      const newDate = new Date(date).toLocaleDateString('en-US', {
                                                        year: 'numeric', month: 'long', day: 'numeric'
                                                      })

                                                      return (
                                                        <ListItem key={transaction_id} secondaryAction={
                                                          <div>{`${amount} ${iso_currency_code}`}</div>
                                                         } sx={{background:'white', borderRadius:'1rem', marginBottom:'0.5rem',
                                                         boxShadow:'rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px'}}>
                                                          <ListItemAvatar>
                                                            <Avatar sx={{ bgcolor: "white" }}>
                                                              <AttachMoneyRounded color="primary" />
                                                            </Avatar>
                                                          </ListItemAvatar>
                                                          <ListItemText primary={name} secondary={newDate} />
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
                //transactions refresh? or not :)
              }
            </CardActions>
          </Card>

        </DialogContent>
        <DialogActions sx={{position:'absolute', top:"0.25rem", right:"0.25rem"}}>
          <Fab size='medium' color='error' variant='extended' onClick={() => {
            setEnd(false)
            setOpen(false)
            setLoading(true)
            setTransactions(null)

            setAccountName(null)
            setAccountBalance(null)
           }}>
            <div className={`${styles.fab} ${styles.font}`}>
              <CloseRounded style={{marginRight:'0.25rem'}} />
              Close
            </div>
          </Fab>
        </DialogActions>
      </Dialog>
    </>
  )
}
