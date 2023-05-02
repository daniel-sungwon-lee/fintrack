import { AddRounded, AddchartRounded, AttachMoneyRounded, BarChartRounded, CloseRounded,
         DeleteRounded, EditRounded, LockRounded, MoreVertRounded, ReceiptLongRounded }
        from "@mui/icons-material"
import { Alert, Avatar, Card, CardContent, CardHeader, Checkbox, CircularProgress, Collapse,
         Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
         Fab, Grow, IconButton, List, ListItem, ListItemAvatar, ListItemButton,
         ListItemIcon, ListItemText, Paper, Skeleton, Slide, Snackbar, SpeedDial,
         SpeedDialAction, SpeedDialIcon, TextField, Zoom } from "@mui/material"
import { useEffect, useState, forwardRef } from "react"
import Placeholder from "./placeholder"
import styles from '../styles/Home.module.css'
import { StaticDateRangePicker } from "@mui/x-date-pickers-pro"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from "dayjs"
import { LoadingButton } from "@mui/lab"

const TransitionLeft = (props) => {
  return <Slide {...props} direction="right" />
}

export default function Track({userId}) {
  const [loading, setLoading] = useState(true)
  const [tokens, setTokens] = useState(null)
  const [open, setOpen] = useState(false)

  const [trackers, setTrackers] = useState(null)
  const [end, setEnd] = useState(false)
  const [openSnack, setOpenSnack] = useState(false)

  useEffect(async () => {
    if(loading && !end) {
      setEnd(true)

      await fetch(`/api/server/trackers/${userId}`)
        .then(res => res.json())
        .then(data => {
          if(data.length > 0) {
            setTrackers(data)
            setLoading(false)

          } else {
            setTrackers(null)
            setLoading(false)
          }
        })
        .catch(error => {
          window.alert(error)
          console.error(error)
        })

      await fetch(`/api/server/institutions?userId=${userId}`, { method: "GET" })
        .then(res => res.json())
        .then(data => {
          if(data.length > 0) {
            const tokenArr = data.map(institution => {
              const {access_token} = institution
              return access_token
            })
            setTokens(tokenArr)

          } else {
            setTokens(null)
          }
        })
        .catch(error => {
          window.alert(error)
          console.error(error)
        })
    }

    if(trackers && trackers.length===0) {
      setTrackers(null)
    }
  })

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
            <Zoom in timeout={300}>
              <div className="d-flex justify-content-center align-items-center"
               style={{minHeight: '50vh', marginBottom: '7rem'}}>
                <div className="text-center">

                  {
                    trackers ? <Trackers data={trackers} setData={setTrackers} userId={userId}
                                setOpenSnack={setOpenSnack} />
                             : <h2 className="mb-3" style={{opacity: '0.7'}}>Such empty...</h2>
                  }

                  <Fab variant="extended" size="medium" color="primary" sx={{padding:"1.5rem",
                   borderRadius:"2rem"}} onClick={() => setOpen(true)} disabled={!tokens}>
                    <div className={`${styles.fab} ${styles.font}`} style={{fontSize: '18px'}}>
                      {
                        tokens
                          ? <>
                              <AddchartRounded style={{ marginRight: "0.5rem" }} />
                              Create new tracker
                            </>
                          : <>
                              <LockRounded color="inherit" size={30} sx={{ marginRight: '0.5rem' }}
                                thickness={5} />
                              Connect bank to create tracker
                            </>
                      }
                    </div>
                  </Fab>

                  <TrackDialog userId={userId} open={open} setOpen={setOpen} setTrackLoading={setLoading}
                   setTrackEnd={setEnd} tokens={tokens} />

                  <Snackbar open={openSnack} autoHideDuration={3333} onClose={handleSnackClose}
                    TransitionComponent={TransitionLeft}>
                    <Alert variant="filled" color="secondary" sx={{ width: '100%', color: 'black' }}
                      onClose={handleSnackClose}>
                      Tracker deleted
                    </Alert>
                  </Snackbar>

                </div>
              </div>
            </Zoom>
      }
    </>
  )
}


function Trackers({data, setData, userId, setOpenSnack}) {
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [trackerId, setTrackerId] = useState(null)
  const [trackerName, setTrackerName] = useState(null)
  const [total, setTotal] = useState(null)
  const [speedDialLoading, setSpeedDialLoading] = useState(false)

  useEffect(() => {
    if(data) {
      setLoading(false) //timeout here?
    }
  })

  const handleSpeedDial= async (type, trackerId) => {
    if(type === 'delete'){
      setSpeedDialLoading(true)

      await fetch(`/api/server/transactions/${trackerId}`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" }
      })
        .then(async () => {
          await fetch(`/api/server/trackers/${userId}/${trackerId}`, {
            method: 'DELETE',
            headers: { "Content-Type": "application/json" }
          })
            .then(() => {
              const trackerIds = data.map(tracker => tracker.trackerId)
              const idIndex = trackerIds.indexOf(trackerId)
              const newData = data.toSpliced(idIndex, 1)
              setData(newData)

              setSpeedDialLoading(false)
              setOpenSnack(true)
            })
            .catch(error => {
              setSpeedDialLoading(false)
              window.alert(error)
              console.error(error)
            })
        })
        .catch(error => {
          setSpeedDialLoading(false)
          window.alert(error)
          console.error(error)
        })

    } else {

    }
  }

  return (
    <Paper className="d-flex flex-column align-items-center" sx={
      { minWidth: "80%", margin: "5rem 1rem", bgcolor: "#00C169", borderRadius: "8px" }}
      elevation={3}>
      {
        loading ? <>
                    <Skeleton className="mb-0 text-center m-5" variant="rectangle" sx={{ borderRadius: '1rem' }}>
                      <div className="h2 mb-0" style={{ fontWeight: 'bold' }}>Tracker name</div>
                    </Skeleton>

                    <Skeleton variant="rectangle" sx={{ borderRadius: '1rem', margin: '3rem' }}>
                      <Card sx={{ margin: "", cursor: "pointer", borderRadius: "1rem" }} onMouseEnter={(e) =>
                        e.currentTarget.style.boxShadow = "0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)"}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)"}
                        onClick={() => setOpen(true)}>
                        <CardHeader avatar={
                          <Avatar sx={{ bgcolor: "#00C169" }}>
                            <BarChartRounded color="secondary" />
                          </Avatar>
                          } title="Groceries and Gas" titleTypographyProps={{ fontSize: '18px' }} />
                        <CardContent>
                          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam quisquam eligendi repellendus voluptas ducimus minus provident rem beatae, quia cumque optio quidem facilis magni quo tenetur! Iste hic alias provident.
                        </CardContent>
                      </Card>
                    </Skeleton>
                  </>
                : <>
                    <div className="h2 mb-0 text-center m-5" style={{ fontWeight: 'bold' }}>Trackers</div>

                    {
                      data.map(tracker => {
                        const { trackerId, name, total, fromDate, toDate } = tracker

                        return (
                          <div key={trackerId} id={trackerId} style={{position: 'relative'}}>
                            <SpeedDial ariaLabel="Options SpeedDial" icon={<SpeedDialIcon icon={<MoreVertRounded />}
                             openIcon={<CloseRounded />} />} sx={{ position:'absolute', right:'3rem', top:'3.4rem' }}
                             FabProps={{sx:{ boxShadow:'none !important', background:'transparent !important' }, disableRipple:true}}
                             direction="down">
                              <SpeedDialAction tooltipTitle='Delete' icon={speedDialLoading ? <CircularProgress color="inherit" size={20} thickness={5} /> : <DeleteRounded color="error" />}
                               onClick={() => handleSpeedDial('delete', trackerId)} FabProps={{disabled:speedDialLoading}} />
                              <SpeedDialAction tooltipTitle='Edit' icon={<EditRounded />} onClick={() => handleSpeedDial('edit', trackerId)} />
                            </SpeedDial>

                            <Card sx={{ margin: "3rem", cursor: "pointer", borderRadius: "1rem" }} onMouseEnter={(e) =>
                              e.currentTarget.style.boxShadow = "0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)"}
                              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)"}
                              onClick={() => {
                                setTrackerId(trackerId)
                                setTrackerName(name)
                                setTotal(total)
                                setOpen(true)
                              }}>
                              <CardHeader avatar={
                                <Avatar sx={{ bgcolor: "#00C169" }}>
                                  <BarChartRounded color="secondary" />
                                </Avatar>
                                } title={name} titleTypographyProps={{ fontSize: '18px' }} />
                              <CardContent>
                                <div style={{ height: 0 }} className="invisible">
                                  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam quisquam eligendi repellendus voluptas ducimus minus provident rem beatae, quia cumque optio quidem facilis magni quo tenetur! Iste hic alias provident.
                                </div>
                                <div className="d-flex justify-content-between">
                                  <div className="d-flex flex-column align-items-start">
                                    <div className="h6">From: {dayjs(fromDate).format('MMMM D, YYYY')}</div>
                                    <div className="h6">To: {dayjs(toDate).format('MMMM D, YYYY')}</div>
                                  </div>
                                  <ReceiptLongRounded color="secondary" fontSize="large" />
                                  <div className="d-flex align-items-center" style={{ fontSize: '24px' }}>
                                    Total: {total} dollars
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )
                      })
                    }
                  </>
      }
      <TrackerDetails open={open} setOpen={setOpen} trackerId={trackerId}
       setTrackerId={setTrackerId} trackerName={trackerName} setTrackerName={setTrackerName}
       total={total} setTotal={setTotal} />

    </Paper>
  )
}


const Transition2 = forwardRef(function Transition(props, ref) {
  return <Grow in timeout='auto' ref={ref} {...props} />
})

function TrackerDetails({ open, setOpen, trackerId, setTrackerId, trackerName, setTrackerName, total, setTotal }) {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [end, setEnd] = useState(false)

  useEffect(async () => {
    if(loading && !end && trackerId) {
      setEnd(true)

      await fetch(`/api/server/transactions/${trackerId}`)
        .then(res => res.json())
        .then(data => {
          setTransactions(data)
          setLoading(false)
        })
        .catch(error => {
          window.alert(error)
          console.error(error)
        })
    }
  })

  return (
    <>
      <Dialog open={open} TransitionComponent={Transition2} onClose={() => {
        setLoading(true)
        setEnd(false)
        setTransactions(null)
        setTrackerId(null)
        setTrackerName(null)
        setTotal(null)
        setOpen(false)
       }}
       closeAfterTransition keepMounted fullScreen PaperProps={{style: {background: "#FFD800",
       alignItems: "center", padding: "3rem 0rem"}}} scroll="body">
        <DialogTitle className="w-100 text-center">
          {
            loading ? <Skeleton variant="rectangle" sx={{margin: 'auto', borderRadius: '1rem'}}>
                        <div className={`h2 ${styles.font}`}>Groceries and Gas</div>
                      </Skeleton>
                    : <div className={`h2 ${styles.font}`}>{trackerName}</div>
          }
        </DialogTitle>
        <DialogContent className="w-100">

          <DialogContentText className={styles.font} sx={{marginBottom:'3rem', color:'black'}}>
            {
              loading ? <Skeleton variant="rectangle" sx={{margin: 'auto', borderRadius: '1rem'}}>
                          <span className="h4 text-center d-block">Total expenditure</span>
                        </Skeleton>
                      : <span className="h4 text-center d-block">{total} dollars</span>
            }
          </DialogContentText>

          <Card sx={{bgcolor: '#00C169', borderRadius: '1rem'}} className="w-75 m-auto">
            <CardContent>
              <div className="h4 text-center m-3" style={{fontWeight: 'bold', color: 'white'}}>
                Transactions
              </div>
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
                                                      const { transaction_id, account_id, amount, category,
                                                              date, iso_currency_code, name } = transaction

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
                                                          <ListItemText primary={name} secondary={dayjs(date).format('MMMM D, YYYY')} />
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
          </Card>
        </DialogContent>
        <DialogActions sx={{position:'absolute', top:"0.25rem", right:"0.25rem"}}>
          <Fab size='medium' color='error' variant='extended' onClick={() => {
            setLoading(true)
            setEnd(false)
            setTransactions(null)
            setTrackerId(null)
            setTrackerName(null)
            setTotal(null)
            setOpen(false)
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


const Transition = forwardRef(function Transition(props, ref) {
  return <Slide in direction="down" timeout={1000} ref={ref} {...props} />
})
const shortcutsItems = [
  {
    label: 'Last week',
    getValue: () => {
      const today = dayjs();
      const prevWeek = today.subtract(7, 'day');
      return [prevWeek.startOf('week'), prevWeek.endOf('week')];
    },
  },
  {
    label: 'Last two weeks',
    getValue: () => {
      const today = dayjs();
      const prev2Weeks = today.subtract(14, 'day')
      const prevWeek = today.subtract(7, 'day')
      return [prev2Weeks.startOf('week'), prevWeek.endOf('week')];
    },
  },
  {
    label: 'Last 7 days',
    getValue: () => {
      const today = dayjs();
      return [today.subtract(7, 'day'), today];
    },
  },
  {
    label: 'Last 14 days',
    getValue: () => {
      const today = dayjs();
      return [today.subtract(14, 'day'), today];
    },
  },
  {
    label: 'Last month',
    getValue: () => {
      const today = dayjs();
      const prevMonth = today.subtract(1, 'month')
      return [prevMonth.startOf('month'), prevMonth.endOf('month')]
    }
  },
  { label: 'Reset', getValue: () => [null, null] },
];

function TrackDialog({userId, open, setOpen, setTrackLoading, setTrackEnd, tokens}) {
  const [firstTime, setFirstTime] = useState(true)
  const [value, setValue] = useState([null, null])
  const [reload, setReload] = useState(false)
  const [openSnack, setOpenSnack] = useState(false)

  useEffect(() => {
    //removing watermark on Date Range Picker
    if(open && firstTime) {
      document.querySelector('.MuiDateRangeCalendar-root').firstChild.remove()
      setFirstTime(false)
    }
  })

  const handleSnackClose = (e, reason) => {
    if(reason === 'clickaway') {
      return
    }
    setOpenSnack(false)
  }

  return (
    <>
      <Dialog fullScreen closeAfterTransition keepMounted open={open}
       onClose={() => {
        setOpen(false)
        setValue([null, null])
        setTrackLoading(true)
        setTrackEnd(false)
       }} TransitionComponent={Transition} scroll="body">
        <DialogTitle>Create tracker</DialogTitle>

        <DialogContent>
          <DialogContentText>Time:</DialogContentText>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <StaticDateRangePicker value={value} onChange={(value) => {
              setValue(value)
              setReload(true)
             }}
             slotProps={{
              shortcuts: {
                items: shortcutsItems,
              },
              actionBar: { actions: [] },
             }} calendars={2} defaultCalendarMonth={dayjs().subtract(1,'month')} />
          </LocalizationProvider>

          {
            value.every(i => i!==null) ? <Transactions userId={userId} value={value} setValue={setValue}
                                           reload={reload} setReload={setReload} setOpen={setOpen}
                                           setOpenSnack={setOpenSnack} tokens={tokens} />
                                       : <></>
          }

        </DialogContent>

        <DialogActions sx={{ position: 'absolute', top: "0.25rem", right: "0.25rem" }}>
          <Fab size='medium' color='error' variant='extended' onClick={() => {
            setOpen(false)
            setValue([null, null])
            setTrackLoading(true)
            setTrackEnd(false)
           }}>
            <div className={`${styles.fab} ${styles.font}`}>
              <CloseRounded style={{marginRight:'0.25rem'}} />
              Close
            </div>
          </Fab>
        </DialogActions>

        <Snackbar open={openSnack} autoHideDuration={3333} onClose={handleSnackClose}
         TransitionComponent={TransitionLeft}>
          <Alert variant="filled" color="primary" sx={{width:'100%', color:'white'}}
           onClose={handleSnackClose}>
            Tracker created!
          </Alert>
        </Snackbar>
      </Dialog>
    </>
  )
}


function Transactions({ userId, value, setValue, reload, setReload, setOpen, setOpenSnack, tokens }) {
  const [end, setEnd] = useState(false)
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [checked, setChecked] = useState([])
  const [amounts, setAmounts] = useState([])

  const [expand, setExpand] = useState(false)
  const [trackerName, setTrackerName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(false)

  useEffect(async () => {
    let start_date = dayjs(value[0].$d).format('YYYY-MM-DD')
    let end_date = dayjs(value[1].$d).format('YYYY-MM-DD')

    if(reload) {
      setEnd(false)
      setLoading(true)
    }

    if(!end && loading) {
      setEnd(true)
      setReload(false)
      setChecked([])
      setAmounts([])

      const transactionsArr = []
      //perhaps add a expand transctions button when token.length > 1?
      tokens.map(async accessToken => {
        const reqBody = { start_date, end_date }
        await fetch(`/api/server/plaid/transactions_get?accessToken=${accessToken}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reqBody)
        })
          .then(res => res.json())
          .then(data => {
            data.transactions.map(transaction => transactionsArr.push(transaction))
            setTransactions(transactionsArr)
            setLoading(false)
          })
          .catch(error => {
            window.alert(error)
            console.error(error)
          })
      })
    }

    if(checked.length > 0) {
      setExpand(true)
    } else if(checked.length === 0) {
      setExpand(false)
    }
  })

  const handleCheckbox = (transaction_id, amount) => {
    const currentIndex = checked.indexOf(transaction_id)
    const newChecked = [...checked]

    if(currentIndex === -1) {
      newChecked.push(transaction_id)
    } else {
      newChecked.splice(currentIndex, 1)
    }
    setChecked(newChecked)

    const amountIndex = amounts.indexOf(amount)
    const newAmounts = [...amounts]

    if(amountIndex === -1) {
      newAmounts.push(amount)
    } else {
      newAmounts.splice(amountIndex, 1)
    }
    setAmounts(newAmounts)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const reqBody = {
      userId: userId,
      name: trackerName,
      total: amounts.reduce((a,c) => a + c),
      fromDate: dayjs(value[0].$d).format('MM-DD-YYYY'),
      toDate: dayjs(value[1].$d).format('MM-DD-YYYY')
    }

    await fetch('/api/server/trackers', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody)
    })
      .then(async () => {
        await fetch(`/api/server/trackers/${userId}?postPost=true`)
          .then(res => res.json())
          .then(data => {
            const { trackerId } = data

            checked.map(id => {
              transactions.map(async transaction => {
                const {transaction_id} = transaction

                if(transaction_id === id){

                  const reqBody = {
                    transaction_id,
                    trackerId,
                    account_id: transaction.account_id,
                    amount: transaction.amount,
                    category: transaction.category,
                    date: transaction.date,
                    iso_currency_code: transaction.iso_currency_code,
                    name: transaction.name
                  }

                  await fetch(`/api/server/transactions`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(reqBody)
                  })
                    .then(res => {
                      if(res.status === 201){
                        setOpenSnack(true)
                        setValue([null, null])

                      } else {
                        setError(true)
                        setSubmitting(false)
                      }
                    })
                    .catch(error => {
                      setError(true)
                      setSubmitting(false)
                      window.alert(error)
                      console.error(error)
                    })
                }
              })
            })
          })
          .catch(error => {
            setError(true)
            setSubmitting(false)
            window.alert(error)
            console.error(error)
          })
      })
      .catch(error => {
        setError(true)
        setSubmitting(false)
        window.alert(error)
        console.error(error)
      })
  }

  return (
    <>
      <p className="mt-2">Transactions:</p>
      {
        loading ? <Skeleton variant="rectangle" sx={{borderRadius: '1rem'}}>
                    <div className="p-5">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Doloribus nulla eos accusantium sit inventore ab dolorem hic repellendus accusamus ad, aliquid ipsum explicabo quis rerum dolor incidunt aut, sed sequi!</div>
                  </Skeleton>
                : <Card sx={{borderRadius: '8px', backgroundColor: '#FFD800'}}>
                    <CardContent>
                      {
                        transactions.length > 0 ? <List className="track-transactions-list">
                                                    {
                                                      transactions.map(transaction => {
                                                        const {account_id, amount, category, date, iso_currency_code,
                                                              name, transaction_id} = transaction

                                                        return (
                                                          <ListItem key={transaction_id} secondaryAction={
                                                            <div>{`${amount} ${iso_currency_code}`}</div>
                                                           } sx={{
                                                            background: 'white', borderRadius: '1rem', marginBottom: '0.5rem',
                                                            boxShadow: 'rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px'
                                                           }} disablePadding>
                                                            <ListItemButton disabled={submitting} onClick={() => handleCheckbox(transaction_id, amount)}>
                                                              <ListItemIcon>
                                                                <Checkbox edge='start' checked={checked.indexOf(transaction_id) !== -1}
                                                                 disableRipple />
                                                              </ListItemIcon>
                                                              <ListItemText primary={name} secondary={date} />
                                                            </ListItemButton>
                                                          </ListItem>
                                                        )
                                                      })
                                                    }
                                                  </List>
                                                : <>
                                                    <div className="h6 mb-1" style={{opacity: '0.7'}}>No transactions in given date range...</div>
                                                  </>
                      }
                    </CardContent>

                    <Collapse in={expand} timeout='auto'>
                      <CardContent>
                        <form className="d-flex flex-column align-items-center" onSubmit={handleSubmit}>
                          <TextField value={trackerName} type="name" className="mb-3" id="name" required
                            variant="standard" label="Name of tracker" onChange={(e)=>setTrackerName(e.target.value)}
                            InputLabelProps={{ required: false }} sx={{ width: '195px' }}
                            helperText={error ? 'Please try again' : 'Ex: Groceries'} error={error} />

                          <LoadingButton loading={submitting} type="submit" className={`mb-5 ${styles.font}`}
                            variant="contained" sx={{ color: 'white' }} loadingPosition="start"
                            startIcon={<AddRounded />}>
                              Add
                          </LoadingButton>
                        </form>
                      </CardContent>
                    </Collapse>
                  </Card>
      }
    </>
  )
}
