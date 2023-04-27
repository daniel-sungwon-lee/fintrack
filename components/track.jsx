import { AddchartRounded, CloseRounded } from "@mui/icons-material"
import { Avatar, Card, CardContent, CardHeader, Checkbox, Dialog, DialogActions,
         DialogContent, DialogContentText, DialogTitle, Fab, List, ListItem,
         ListItemButton, ListItemIcon, ListItemText, Paper, Skeleton, Slide,
         Zoom } from "@mui/material"
import { useEffect, useState, forwardRef } from "react"
import Placeholder from "./placeholder"
import styles from '../styles/Home.module.css'
import { StaticDateRangePicker } from "@mui/x-date-pickers-pro"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from "dayjs"

export default function Track() {
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const [trackers, setTrackers] = useState(null)

  useEffect(() => {
    setTimeout(() => setLoading(false), 200)
  })

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
                    trackers ? <Trackers />
                             : <h2 className="mb-3" style={{opacity: '0.7'}}>Such empty...</h2>
                  }

                  <Fab variant="extended" size="medium" color="primary" sx={{padding:"1.5rem",
                   borderRadius:"2rem"}} onClick={() => setOpen(true)}>
                    <div className={`${styles.fab} ${styles.font}`} style={{fontSize: '18px'}}>
                      <AddchartRounded style={{marginRight: "0.5rem"}} />
                      Create new tracker
                    </div>
                  </Fab>

                  <TrackDialog open={open} setOpen={setOpen} />

                </div>
              </div>
            </Zoom>
      }
    </>
  )
}


function Trackers({}) {
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

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
                            <AddchartRounded color="secondary" />
                          </Avatar>
                          } title="Groceries and Gas" titleTypographyProps={{ fontSize: '18px' }} />
                        <CardContent>
                          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam quisquam eligendi repellendus voluptas ducimus minus provident rem beatae, quia cumque optio quidem facilis magni quo tenetur! Iste hic alias provident.
                        </CardContent>
                      </Card>
                    </Skeleton>
                  </>
                : <>
                    <div className="h2 mb-0 text-center m-5" style={{fontWeight: 'bold'}}>Tracker name</div>

                    <Card sx={{ margin: "3rem", cursor: "pointer", borderRadius: "1rem" }} onMouseEnter={(e) =>
                      e.currentTarget.style.boxShadow = "0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)"}
                      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)"}
                      onClick={() => setOpen(true)}>
                      <CardHeader avatar={
                        <Avatar sx={{ bgcolor: "#00C169" }}>
                          <AddchartRounded color="secondary" />
                        </Avatar>
                        } title="Groceries and Gas" titleTypographyProps={{ fontSize: '18px' }} />
                      <CardContent>
                        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam quisquam eligendi repellendus voluptas ducimus minus provident rem beatae, quia cumque optio quidem facilis magni quo tenetur! Iste hic alias provident.
                      </CardContent>
                    </Card>
                  </>
      }
    </Paper>
  )
}


const Transition = forwardRef(function Transition(props, ref) {
  return <Slide in direction="down" timeout={1000} ref={ref} {...props} />
})
const shortcutsItems = [
  {
    label: 'Last Week',
    getValue: () => {
      const today = dayjs();
      const prevWeek = today.subtract(7, 'day');
      return [prevWeek.startOf('week'), prevWeek.endOf('week')];
    },
  },
  {
    label: 'Last Two Weeks',
    getValue: () => {
      const today = dayjs();
      const prev2Weeks = today.subtract(14, 'day')
      const prevWeek = today.subtract(7, 'day')
      return [prev2Weeks.startOf('week'), prevWeek.endOf('week')];
    },
  },
  {
    label: 'Last 7 Days',
    getValue: () => {
      const today = dayjs();
      return [today.subtract(7, 'day'), today];
    },
  },
  {
    label: 'Last 14 Days',
    getValue: () => {
      const today = dayjs();
      return [today.subtract(14, 'day'), today];
    },
  },
  {
    label: 'Last Month',
    getValue: () => {
      const today = dayjs();
      const prevMonth = today.subtract(1, 'month')
      return [prevMonth.startOf('month'), prevMonth.endOf('month')]
    }
  },
  { label: 'Reset', getValue: () => [null, null] },
];

function TrackDialog({open, setOpen}) {
  const [firstTime, setFirstTime] = useState(true)
  const [value, setValue] = useState([null, null])
  const [reload, setReload] = useState(false)

  useEffect(() => {
    //removing watermark on Date Range Picker
    if(open && firstTime) {
      document.querySelector('.MuiDateRangeCalendar-root').firstChild.remove()
      setFirstTime(false)
    }
  })

  return (
    <>
      <Dialog fullScreen closeAfterTransition keepMounted open={open}
       onClose={() => {
        setOpen(false)
        setValue([null, null])
       }} TransitionComponent={Transition}>
        <DialogTitle>Create Tracker</DialogTitle>

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
            value.every(i => i!==null) ? <Transactions value={value} reload={reload}
                                                    setReload={setReload} />
                                       : <></>
          }

        </DialogContent>

        <DialogActions sx={{ position: 'absolute', top: "0.25rem", right: "0.25rem" }}>
          <Fab size='medium' color='error' variant='extended' onClick={() => {
            setOpen(false)
            setValue([null, null])
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


function Transactions({value, reload, setReload}) {
  const [end, setEnd] = useState(false)
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [checked, setChecked] = useState([])

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

      const reqBody = { start_date, end_date }
      await fetch('/api/server/plaid/transactions_get', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody)
      })
        .then(res => res.json())
        .then(data => {
          setTransactions(data.transactions)
          setLoading(false)
        })
        .catch(error => {
          window.alert(error)
          console.error(error)
        })
    }
  })

  const handleCheckbox = (transaction_id) => {
    const currentIndex = checked.indexOf(transaction_id)
    const newChecked = [...checked]

    if(currentIndex === -1) {
      newChecked.push(transaction_id)
    } else {
      newChecked.splice(currentIndex, 1)
    }

    setChecked(newChecked)
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
                                                            <ListItemButton onClick={() => handleCheckbox(transaction_id)}>
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
                  </Card>
      }
    </>
  )
}
