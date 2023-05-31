import { Avatar, Card, CardContent, CardHeader, Dialog, DialogActions, DialogContent,
         DialogContentText, DialogTitle, Fab, Slide, Paper, Zoom, Skeleton,
         CardActions, List, ListItem, ListItemAvatar, ListItemText,
         IconButton, Snackbar, Alert, CircularProgress, Tooltip, Box, TextField,
         } from "@mui/material"
import { AccountBalanceRounded, AttachMoneyRounded, CloseRounded,
         RecommendRounded, RemoveCircleRounded, ThumbUpRounded, VisibilityOffRounded,
         VisibilityRounded } from "@mui/icons-material"
import { useEffect, useState, forwardRef } from "react"
import dynamic from 'next/dynamic'
const Placeholder = dynamic(() => import('./placeholder'), { ssr: false })

const Link = dynamic(() => import('./plaid/link'), { ssr: false })

const TransitionLeft = (props) => {
  return <Slide {...props} direction="right" />
}

export default function Overview({ userId, dispatch, isPaymentInitiation, linkToken }) {
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
                  data.length > 0 ? <NetWorth institutions={data} />
                                  : <></>
                }

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
                 setData={setData} setNewData={setNewData} dispatch={dispatch}
                 isPaymentInitiation={isPaymentInitiation} linkToken={linkToken} />

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

//patch this later (balance API limit reaches quickly); maybe find out doing this without the API fetches and pull from account balances below?
function NetWorth({institutions}) {
  const [loading, setLoading] = useState(true)
  const [worth, setWorth] = useState(null)

  const converter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

  useEffect(() => {
    const fetchData = async () => {
      const totals = []

      if(loading) {
        for(let i=0; i<institutions.length; i++) {
          if(i === institutions.length -1) {
            await fetch(`/api/server/plaid/balance?accessToken=${institutions[i].access_token}`)
              .then(res => res.json())
              .then(data => {
                const accountsArr = data.accounts
                const balances = accountsArr.map(account => account.balances.current)
                const total = balances.reduce((a,b) => a + b, 0)
                totals.push(total)

                setWorth(totals)
                setLoading(false)
              })
              .catch(error => {
                window.alert(error)
                console.error(error)
              })

          } else {
            await fetch(`/api/server/plaid/balance?accessToken=${institutions[i].access_token}`)
              .then(res => res.json())
              .then(data => {
                const accountsArr = data.accounts
                const balances = accountsArr.map(account => account.balances.current)
                const total = balances.reduce((a,b) => a + b, 0)
                totals.push(total)
              })
              .catch(error => {
                window.alert(error)
                console.error(error)
              })
          }
        }
      }
    }
    fetchData()
  })

  return (
    <>
      <Paper className="w-100" elevation={2} sx={{
        borderRadius: '1rem', padding: '2rem',
        background: '#00C169', color: 'white', marginTop: '2.5rem'
       }}>
        {
          loading ? <Skeleton variant="rounded" sx={{ borderRadius: '2rem' }}>
                      <div className="h1">$1,000,000</div>
                    </Skeleton>
                  : <>
                      <div className="h1">{converter.format(worth)}</div>
                    </>
        }
        <div>Net worth</div>
      </Paper>
    </>
  )
}


function Accounts({ itemId, accessToken, name, accountsPlaceholder, institutions, setInstitutions, setOpenSnack }) {
  const [loading, setLoading] = useState(true)
  const [end, setEnd] = useState(false)
  const [accounts, setAccounts] = useState(null)
  const [balances, setBalances] = useState(null)
  const [numbers, setNumbers] = useState(null)
  const [liabilities, setLiabilities] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const [open, setOpen] = useState(false)
  const [accountId, setAccountId] = useState(null)
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

              //getting updated account balance(s)
              await fetch(`/api/server/plaid/accounts?accessToken=${accessToken}`)
                .then(res => res.json())
                .then(data => {
                  const accountsArr = data.accounts
                  const balances = accountsArr.map(account => account.balances.current)
                  setBalances(balances)

                  setLoading(false)
                })
                .catch(error => {
                  window.alert(error)
                  console.error(error)
                })

              //get updated limits, next payment date, last statement, minimum payment, next monthly payment, and interest rate data

            } else {
              await fetch(`/api/server/plaid/auth?accessToken=${accessToken}`, { method: "GET" })
                .then(res => res.json())
                .then(data => {
                  const types = data.accounts.map(account => account.type)

                  if(types.some(type => type === 'credit' || type === 'loan')) {
                    fetch(`/api/server/plaid/liabilities?accessToken=${accessToken}`)
                      .then(res => res.json())
                      .then(liabilitiesData => {
                        setLiabilities(liabilitiesData.liabilities.liabilities)
                        setAccounts(data.accounts)
                        setNumbers(data.numbers.ach)

                        console.log(liabilitiesData, liabilities) //check if liabilities data renders correctly

                        setLoading(false)
                      })
                      .catch(error => {
                        window.alert(error)
                        console.error(error)
                      })

                  } else {
                    setAccounts(data.accounts)
                    setNumbers(data.numbers.ach)
                    setLoading(false)
                  }
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

  const converter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

  return (
    <>
      <Zoom in>
        <Paper className="d-flex flex-column align-items-center" sx={{
         minWidth: "80%", margin:"5rem 1rem 6rem", bgcolor:"#FFD800", borderRadius:"8px",
         position: "relative", paddingBottom: '5rem'}} elevation={3}>

          {
            loading ? <Skeleton className="mb-0 text-center m-5" variant="rectangle" sx={{borderRadius: '1rem'}}>
                        <div className="h2 mb-0" style={{fontWeight: 'bold'}}>Institution name</div>
                      </Skeleton>
                    : <>
                        <Tooltip title='Toggle visibility' placement="right">
                          <IconButton sx={{position:'absolute', top:'0.5rem', left:'0.5rem'}}
                            onClick={() => {
                              setShowPassword(!showPassword)
                            }}
                          >
                            {showPassword ? <VisibilityOffRounded fontSize="large" /> : <VisibilityRounded fontSize="large" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove" componentsProps={{tooltip:{sx:{bgcolor:"#d32f2f"}}}} placement="left">
                          <IconButton color="error" sx={{position:'absolute', top:'0.25rem', right:'0.25rem'}}
                          onClick={() => setRmOpen(true)}>
                            <RemoveCircleRounded fontSize="large" />
                          </IconButton>
                        </Tooltip>
                        <div className="h2 mb-0 text-center m-5" style={{fontWeight: 'bold'}}>{name}</div>
                      </>
          }

          { loading
              ? <Skeleton variant="rectangle" sx={{borderRadius: '1rem', margin: '3rem 2rem 0'}}>
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
                                      if (account.type === 'credit' || account.type === 'loan') {
                                        if(account.subtype === "credit card") {
                                          const index = liabilities.credit.map(a => a.account_id).indexOf(account.account_id)

                                          const accountData = {
                                            account_id: account.account_id,
                                            item_id: itemId,
                                            name: account.name,
                                            type: account.type,
                                            subtype: account.subtype,
                                            balance: account.balances.current,
                                            limit: account.balances.limit,
                                            next_payment_due_date: liabilities.credit[index].next_payment_due_date,
                                            last_statement_balance: liabilities.credit[index].last_statement_balance,
                                            minimum_payment_amount: liabilities.credit[index].minimum_payment_amount,
                                          }

                                          return (
                                            <Card sx={{ margin: "3rem 2rem 0", cursor: "pointer", borderRadius: "1rem" }} onMouseEnter={(e) =>
                                              e.currentTarget.style.boxShadow = "0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)"}
                                              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)"}
                                              onClick={() => {
                                                setOpen(true)
                                                setAccountId(accountData.account_id)
                                                setAccountName(accountData.name)
                                                setAccountBalance(accountData.balance)
                                              }} key={accountData.account_id}>
                                              <CardHeader avatar={
                                                <Avatar sx={{ bgcolor: "#FFD800" }}>
                                                  <AccountBalanceRounded color="primary" />
                                                </Avatar>
                                              } title={accountData.name} titleTypographyProps={{ fontSize: '18px' }} />
                                              <CardContent>
                                                <div style={{ height: 0 }} className="invisible">
                                                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque quasi porro quam voluptas fugiat dicta obcaecati repellat ut, at ratione eum dolores consectetur. Nisi obcaecati culpa laboriosam alias reprehenderit illum.
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                  <div>
                                                    <div className="h6 text-capitalize">{accountData.subtype}</div>
                                                    <div className="h6">Credit limit: {accountData.limit}</div>
                                                    <div className="h6">Statement balance: {accountData.last_statement_balance}</div>
                                                    <div className="h6">Payment due date: {accountData.next_payment_due_date}</div>
                                                    <div className="h6">Minimum payment due: {accountData.minimum_payment_amount}</div>
                                                  </div>
                                                  <div className="d-flex align-items-center" style={{ fontSize: '24px' }}>
                                                    {converter.format(accountData.balance)}
                                                  </div>
                                                </div>
                                              </CardContent>
                                            </Card>
                                          )

                                        } else if(account.subtype === 'student') {
                                          const index = liabilities.student.map(a => a.account_id).indexOf(account.account_id)

                                          const accountData = {
                                            account_id: account.account_id,
                                            item_id: itemId,
                                            name: account.name,
                                            type: account.type,
                                            subtype: account.subtype,
                                            balance: account.balances.current,
                                            limit: account.balances.limit,
                                            next_payment_due_date: liabilities.student[index].next_payment_due_date,
                                            last_statement_balance: liabilities.student[index].last_statement_balance,
                                            minimum_payment_amount: liabilities.student[index].minimum_payment_amount,
                                            interest_rate: liabilities.student[index].interest_rate_percentage,
                                          }

                                          return (
                                            <Card sx={{ margin: "3rem 2rem 0", cursor: "pointer", borderRadius: "1rem" }} onMouseEnter={(e) =>
                                              e.currentTarget.style.boxShadow = "0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)"}
                                              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)"}
                                              onClick={() => {
                                                setOpen(true)
                                                setAccountId(accountData.account_id)
                                                setAccountName(accountData.name)
                                                setAccountBalance(accountData.balance)
                                              }} key={accountData.account_id}>
                                              <CardHeader avatar={
                                                <Avatar sx={{ bgcolor: "#FFD800" }}>
                                                  <AccountBalanceRounded color="primary" />
                                                </Avatar>
                                              } title={accountData.name} titleTypographyProps={{ fontSize: '18px' }} />
                                              <CardContent>
                                                <div style={{ height: 0 }} className="invisible">
                                                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque quasi porro quam voluptas fugiat dicta obcaecati repellat ut, at ratione eum dolores consectetur. Nisi obcaecati culpa laboriosam alias reprehenderit illum.
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                  <div>
                                                    <div className="h6 text-capitalize">{accountData.subtype}</div>
                                                    <div className="h6">Statement balance: {accountData.last_statement_balance}</div>
                                                    <div className="h6">Payment due date: {accountData.next_payment_due_date}</div>
                                                    <div className="h6">Minimum payment due: {accountData.minimum_payment_amount}</div>
                                                    <div className="h6">Interest rate: {accountData.interest_rate}</div>
                                                  </div>
                                                  <div className="d-flex align-items-center" style={{ fontSize: '24px' }}>
                                                    {converter.format(accountData.balance)}
                                                  </div>
                                                </div>
                                              </CardContent>
                                            </Card>
                                          )

                                        } else if(account.subtype === 'mortgage') {
                                          const index = liabilities.mortgage.map(a => a.account_id).indexOf(account.account_id)

                                          const accountData = {
                                            account_id: account.account_id,
                                            item_id: itemId,
                                            name: account.name,
                                            type: account.type,
                                            subtype: account.subtype,
                                            balance: account.balances.current,
                                            limit: account.balances.limit,
                                            next_payment_due_date: liabilities.mortgage[index].next_payment_due_date,
                                            next_monthly_payment: liabilities.mortgage[index].next_monthly_payment,
                                            interest_rate: liabilities.mortgage[index].interest_rate.percentage,
                                          }

                                          return (
                                            <Card sx={{ margin: "3rem 2rem 0", cursor: "pointer", borderRadius: "1rem" }} onMouseEnter={(e) =>
                                              e.currentTarget.style.boxShadow = "0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)"}
                                              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)"}
                                              onClick={() => {
                                                setOpen(true)
                                                setAccountId(accountData.account_id)
                                                setAccountName(accountData.name)
                                                setAccountBalance(accountData.balance)
                                              }} key={accountData.account_id}>
                                              <CardHeader avatar={
                                                <Avatar sx={{ bgcolor: "#FFD800" }}>
                                                  <AccountBalanceRounded color="primary" />
                                                </Avatar>
                                              } title={accountData.name} titleTypographyProps={{ fontSize: '18px' }} />
                                              <CardContent>
                                                <div style={{ height: 0 }} className="invisible">
                                                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque quasi porro quam voluptas fugiat dicta obcaecati repellat ut, at ratione eum dolores consectetur. Nisi obcaecati culpa laboriosam alias reprehenderit illum.
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                  <div>
                                                    <div className="h6 text-capitalize">{accountData.subtype}</div>
                                                    <div className="h6">Payment due date: {accountData.next_payment_due_date}</div>
                                                    <div className="h6">Next payment due: {accountData.next_monthly_payment}</div>
                                                    <div className="h6">Interest rate: {accountData.interest_rate}</div>
                                                  </div>
                                                  <div className="d-flex align-items-center" style={{ fontSize: '24px' }}>
                                                    {converter.format(accountData.balance)}
                                                  </div>
                                                </div>
                                              </CardContent>
                                            </Card>
                                          )
                                        }

                                      } else if(account.type === 'depository') {
                                        if(account.subtype === 'checking' || account.subtype === 'savings') {
                                          const index = numbers.map(a => a.account_id).indexOf(account.account_id)
                                          const accountNumber = numbers[index].account
                                          const routingNumber = numbers[index].routing

                                          const accountData = {
                                            account_id: account.account_id,
                                            item_id: itemId,
                                            name: account.name,
                                            type: account.subtype,
                                            subtype: account.subtype,
                                            balance: account.balances.current,
                                            account_num: accountNumber,
                                            routing_num: routingNumber
                                          }

                                          return (
                                            <Card sx={{margin: "3rem 2rem 0", cursor: "pointer", borderRadius:"1rem"}} onMouseEnter={(e) =>
                                            e.currentTarget.style.boxShadow="0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)"}
                                            onMouseLeave={(e) => e.currentTarget.style.boxShadow="0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)"}
                                            onClick={() => {
                                             setOpen(true)
                                             setAccountId(accountData.account_id)
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
                                                    <div className="h6 text-capitalize">{accountData.subtype}</div>
                                                    <div className="h6">Routing number: {routingNumber}</div>
                                                    <div className="h6 mb-0">Account number:</div>
                                                    <TextField
                                                      type={showPassword ? 'text' : 'password'}
                                                      value={accountNumber}
                                                      disabled
                                                      InputProps={{disableUnderline: true}}
                                                      variant="standard"
                                                      size="small"
                                                    />
                                                  </div>
                                                  <div className="d-flex align-items-center" style={{fontSize: '24px'}}>
                                                    {converter.format(accountData.balance)}
                                                  </div>
                                                </div>
                                              </CardContent>
                                            </Card>
                                          )

                                        } else {
                                          const accountData = {
                                            account_id: account.account_id,
                                            item_id: itemId,
                                            name: account.name,
                                            type: account.type,
                                            subtype: account.subtype,
                                            balance: account.balances.current,
                                            limit: account.balances.limit,
                                          }

                                          return (
                                            <Card sx={{ margin: "3rem 2rem 0", cursor: "pointer", borderRadius: "1rem" }} onMouseEnter={(e) =>
                                              e.currentTarget.style.boxShadow = "0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)"}
                                              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)"}
                                              onClick={() => {
                                                setOpen(true)
                                                setAccountId(accountData.account_id)
                                                setAccountName(accountData.name)
                                                setAccountBalance(accountData.balance)
                                              }} key={accountData.account_id}>
                                              <CardHeader avatar={
                                                <Avatar sx={{ bgcolor: "#FFD800" }}>
                                                  <AccountBalanceRounded color="primary" />
                                                </Avatar>
                                              } title={accountData.name} titleTypographyProps={{ fontSize: '18px' }} />
                                              <CardContent>
                                                <div style={{ height: 0 }} className="invisible">
                                                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque quasi porro quam voluptas fugiat dicta obcaecati repellat ut, at ratione eum dolores consectetur. Nisi obcaecati culpa laboriosam alias reprehenderit illum.
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                  <div>
                                                    <div className="h6 text-capitalize">{accountData.subtype}</div>
                                                  </div>
                                                  <div className="d-flex align-items-center" style={{ fontSize: '24px' }}>
                                                    {converter.format(accountData.balance)}
                                                  </div>
                                                </div>
                                              </CardContent>
                                            </Card>
                                          )
                                        }

                                      } else {
                                        //investments here later?
                                      }
                                   })
                                  }
                               </>
                             : <>
                                {
                                  accounts && !numbers ? <>
                                                          {
                                                            accounts.map((account, i) => {
                                                              const { account_id, item_id, name, type, subtype,
                                                                      account_num, routing_num, limit, next_payment_due_date,
                                                                      last_statement_balance, minimum_payment_amount,
                                                                      next_monthly_payment, interest_rate } = account
                                                              const balance = balances[i]

                                                              return (
                                                                <Card sx={{ margin: "3rem 2rem 0", cursor: "pointer", borderRadius: "1rem" }} onMouseEnter={(e) =>
                                                                  e.currentTarget.style.boxShadow = "0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)"}
                                                                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)"}
                                                                  onClick={() => {
                                                                    setOpen(true)
                                                                    setAccountId(account_id)
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
                                                                        <div className="h6 text-capitalize">{subtype}</div>
                                                                        {
                                                                          routing_num ? <div className="h6">Routing number: {routing_num}</div>
                                                                                      : <></>
                                                                        }
                                                                        {
                                                                          account_num ? <>
                                                                                          <div className="h6 mb-0">Account number:</div>
                                                                                          <TextField
                                                                                            type={showPassword ? 'text' : 'password'}
                                                                                            value={account_num}
                                                                                            disabled
                                                                                            InputProps={{disableUnderline: true}}
                                                                                            variant="standard"
                                                                                            size="small"
                                                                                          />
                                                                                        </>
                                                                                      : <></>
                                                                        }
                                                                        {
                                                                          limit ? <div className="h6">Credit limit: {limit}</div>
                                                                                : <></>
                                                                        }
                                                                        {
                                                                          last_statement_balance ? <div className="h6">Statement balance: {last_statement_balance}</div>
                                                                                                 : <></>
                                                                        }
                                                                        {
                                                                          next_payment_due_date ? <div className="h6">Payment due date: {next_payment_due_date}</div>
                                                                                                : <></>
                                                                        }
                                                                        {
                                                                          minimum_payment_amount ? <div className="h6">Minimum payment due: {minimum_payment_amount}</div>
                                                                                                 : <></>
                                                                        }
                                                                        {
                                                                          next_monthly_payment ? <div className="h6">Next payment due: {next_monthly_payment}</div>
                                                                                               : <></>
                                                                        }
                                                                        {
                                                                          interest_rate ? <div className="h6">Interest rate: {interest_rate}</div>
                                                                                        : <></>
                                                                        }
                                                                      </div>
                                                                      <div className="d-flex align-items-center" style={{ fontSize: '24px' }}>
                                                                        <AccountBalanceUpdate balance={balance} accountId={account_id} converter={converter} />
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
           setAccountName={setAccountName} setAccountBalance={setAccountBalance} accessToken={accessToken}
           accountId={accountId} setAccountId={setAccountId} />

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
                <Box className='d-flex align-items-center' sx={{
                 color: 'white', textTransform: 'none', lineHeight: 1}}>
                  <CloseRounded style={{ marginRight: '0.5rem' }} />
                  No
                </Box>
              </Fab>
              <Fab size='medium' color='secondary' variant='extended' onClick={handleRemove}
               disabled={rmLoading}>
                <Box className='d-flex align-items-center' sx={{color: 'black',
                 textTransform: 'none', lineHeight: 1}}>
                  {
                    rmLoading ? <CircularProgress color="inherit" size={20} thickness={5}
                                 sx={{marginRight: '0.5rem', color: 'rgba(0, 0, 0, 0.26)'}} />
                              : <ThumbUpRounded style={{ marginRight: '0.5rem' }} />
                  }
                  Absolutely
                </Box>
              </Fab>
            </DialogActions>
          </Dialog>
        </Paper>
      </Zoom>
    </>
  )
}

function AccountBalanceUpdate({balance, accountId, converter}) {
  const [load, setLoad] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if(load) {
      setLoad(false)

      fetch(`/api/server/accounts/${accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newBalance: balance })
      })
        .then(() => {
          setLoading(false)
        })
        .catch(error => {
          window.alert(error)
          console.error(error)
        })
    }
  },[accountId, balance, load])

  return (
    <>
      {
        loading ? <Skeleton className="d-inline" variant="rectangle" sx={{ borderRadius: '1rem' }}>
                    <span className="d-inline"> {converter.format(33.33)}</span>
                  </Skeleton>
                : <span className="d-inline"> {converter.format(balance)}</span>
      }
    </>
  )
}


const Transition = forwardRef(function Transition(props, ref) {
  return <Slide in direction="up" timeout={1000} ref={ref} {...props} />
})

function AccountDetails({ open, setOpen, accountName, accountBalance, setAccountName, setAccountBalance, accessToken, accountId, setAccountId }) {
  const [end, setEnd] = useState(false)
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState(null)

  const converter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

  useEffect(() => {
    if(loading && open && !end) {

      setEnd(true)

      fetch(`/api/server/plaid/transactions?accessToken=${accessToken}`, { method: 'GET' })
        .then(res => res.json())
        .then(transactions => {
          const accountTransactions = transactions.latest_transactions.filter(transaction => {
            return transaction.account_id === accountId
          })
          setTransactions(accountTransactions)
          setLoading(false)
        })
        .catch(error => {
          window.alert(error)
          console.error(error)
        })
    }
  },[loading, open, end, accessToken, accountId])

  return (
    <>
      <Dialog open={open} TransitionComponent={Transition} onClose={() => {
        setEnd(false)
        setLoading(true)
        setTransactions(null)
        setOpen(false)

        setAccountId(null)
        setAccountName(null)
        setAccountBalance(null)
       }}
       closeAfterTransition keepMounted fullScreen PaperProps={{style: {background: "#00C169",
       color: "white", alignItems: "center", padding: "3rem 0rem"}}} scroll="body">
        <DialogTitle className="w-100 text-center">
          {
            loading ? <Skeleton variant="rectangle" sx={{margin: 'auto', borderRadius: '1rem'}}>
                        <div className='h2'>Fidelity Checking</div>
                      </Skeleton>
                    : <div className='h2'>{accountName}</div>
          }
        </DialogTitle>
        <DialogContent className="w-100">

          <DialogContentText sx={{marginBottom:'3rem', color:'white'}}>
            {
              loading ? <Skeleton variant="rectangle" sx={{margin: 'auto', borderRadius: '1rem'}}>
                          <span className="h4 text-center d-block">Current Balance</span>
                        </Skeleton>
                      : <span className="h4 text-center d-block">{converter.format(accountBalance)}</span>
            }
          </DialogContentText>

          <Card sx={{bgcolor: '#FFD800', borderRadius: '1rem', maxWidth: '1000px'}} className="m-auto">
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
                                                          <div>{converter.format(amount * -1)}</div>
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
            <CardActions></CardActions>
          </Card>

        </DialogContent>
        <DialogActions sx={{position:'absolute', top:"0.25rem", right:"0.25rem"}}>
          <Fab size='medium' color='error' variant='extended' onClick={() => {
            setEnd(false)
            setOpen(false)
            setLoading(true)
            setTransactions(null)

            setAccountId(null)
            setAccountName(null)
            setAccountBalance(null)
           }}>
            <Box className='d-flex align-items-center' sx={{
             color: 'white', textTransform: 'none', lineHeight: 1}}>
              <CloseRounded style={{marginRight:'0.25rem'}} />
              Close
            </Box>
          </Fab>
        </DialogActions>
      </Dialog>
    </>
  )
}
