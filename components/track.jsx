import { AddRounded, AddchartRounded, ArrowDropDownRounded, AttachMoneyRounded, BarChartRounded,
         CategoryRounded, CloseRounded, DeleteRounded, DoneRounded, EditRounded, LockRounded,
         MoreVertRounded, ReceiptLongRounded } from "@mui/icons-material"
import { Alert, Avatar, Box, Card, CardContent, CardHeader, Checkbox, CircularProgress,
         Collapse, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
         Fab, FormControl, Grow, IconButton, FormHelperText, List, ListItem, ListItemAvatar,
         ListItemButton, ListItemIcon, ListItemText, MenuItem, Paper, Select, Skeleton,
         Slide, Snackbar, SpeedDial, SpeedDialAction, SpeedDialIcon, TextField, Tooltip,
         Zoom } from "@mui/material"
import { useEffect, useState, forwardRef, useRef } from "react"
import dynamic from 'next/dynamic'
const Placeholder = dynamic(() => import('./placeholder'), { ssr: false })
import { DateRangePicker, SingleInputDateRangeField, StaticDateRangePicker } from "@mui/x-date-pickers-pro"
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from "dayjs"
import { LoadingButton } from "@mui/lab"
import Lottie from 'lottie-react'
import receiptAnimation from '/public/lotties/receipt.json'
import { gsap } from "gsap"
import { NumericFormat } from "react-number-format"
import PropTypes from 'prop-types'

const TransitionLeft = (props) => {
  return <Slide {...props} direction="right" />
}

export default function Track({userId}) {
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [tokens, setTokens] = useState(null)
  const [open, setOpen] = useState(false)

  const [trackers, setTrackers] = useState(null)
  const [end, setEnd] = useState(false)
  const [openSnack, setOpenSnack] = useState(false)
  const [openSnack2, setOpenSnack2] = useState(false)

  useEffect(() => {
    const fetchData = async () => {

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
              setReady(true)

            } else {
              setTokens(null)
              setReady(true)
            }
          })
          .catch(error => {
            window.alert(error)
            console.error(error)
          })
      }
    }
    fetchData()

    if(trackers && trackers.length===0) {
      setTrackers(null)
    }
  },[loading, end, trackers, userId])

  const handleSnackClose = (e, reason) => {
    if(reason === 'clickaway') {
      return
    }
    setOpenSnack(false)
  }
  const handleSnackClose2 = (e, reason) => {
    if(reason === 'clickaway') {
      return
    }
    setOpenSnack2(false)
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
                                setOpenSnack={setOpenSnack} setOpenSnack2={setOpenSnack2} />
                             : <h2 className="mb-3" style={{opacity: '0.7'}}>Such empty...</h2>
                  }

                  <Fab variant="extended" size="medium" color="secondary" sx={{padding:"1.5rem",
                   borderRadius:"2rem"}} onClick={() => setOpen(true)} disabled={!tokens}>
                    <Box className='d-flex align-items-center' sx={{fontSize: '18px',
                     color: '', textTransform: 'none', lineHeight: 1}}>
                      {
                        ready ? <>
                                  {
                                    tokens ? <>
                                               <AddchartRounded style={{ marginRight: "0.5rem" }} />
                                               Create new tracker
                                             </>
                                           : <>
                                               <LockRounded color="inherit" size={30} sx={{ marginRight: '0.5rem' }}
                                                thickness={5} />
                                               Connect bank to create tracker
                                             </>
                                  }
                                </>
                              : <>
                                  <CircularProgress color="inherit" size={25} sx={{ marginRight: '1rem' }}
                                    thickness={5} />
                                  Loading...
                                </>
                      }
                    </Box>
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
                  <Snackbar open={openSnack2} autoHideDuration={3333} onClose={handleSnackClose2}
                    TransitionComponent={TransitionLeft}>
                    <Alert variant="filled" color="primary" sx={{ width: '100%', color: 'white' }}
                      onClose={handleSnackClose2}>
                      Tracker updated
                    </Alert>
                  </Snackbar>

                </div>
              </div>
            </Zoom>
      }
    </>
  )
}


function Trackers({data, setData, userId, setOpenSnack, setOpenSnack2}) {
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [trackerId, setTrackerId] = useState(null)
  const [trackerName, setTrackerName] = useState(null)
  const [total, setTotal] = useState(null)
  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)
  const [speedDialLoading, setSpeedDialLoading] = useState(false)
  const [editModeId, setEditModeId] = useState(null)
  const [totalChange, setTotalChange] = useState(false)

  useEffect(() => {
    if(data) {
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }
  },[data])

  const handleSpeedDial= async (type, trackerId, e) => {
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
      setEditModeId(trackerId)
      e.currentTarget.parentNode.parentNode.nextSibling.style.cursor = 'initial'
      e.currentTarget.parentNode.parentNode.nextSibling.style.background = '#FFE6C6'
    }
  }

  const converter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

  return (
    <Paper className="d-flex flex-column align-items-center" sx={{
     minWidth: "80%", margin: "5rem 1rem", bgcolor: "#00C169", borderRadius: "8px",
     paddingBottom: '3.5rem' }} elevation={3}>
      {
        loading ? <>
                    <Skeleton className="mb-0 text-center m-5" variant="rectangle" sx={{ borderRadius: '1rem' }}>
                      <div className="h2 mb-0" style={{ fontWeight: 'bold' }}>Tracker name</div>
                    </Skeleton>

                    <Skeleton variant="rectangle" sx={{ borderRadius: '1rem', margin: '2rem' }}>
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
                          <ReceiptLottie />
                        </CardContent>
                      </Card>
                    </Skeleton>
                  </>
                : <>
                    <div className="h2 mb-0 text-center m-5" style={{ fontWeight: 'bold', color: 'white' }}>Trackers</div>

                    {
                      data.map(tracker => {
                        const { trackerId, name, total, fromDate, toDate } = tracker

                        return (
                          <div key={trackerId} id={trackerId} style={{position: 'relative'}}>
                            {
                              editModeId === trackerId ? <></>
                                                       : <>
                                                          <SpeedDial ariaLabel="Options SpeedDial" icon={<SpeedDialIcon icon={<MoreVertRounded />}
                                                            openIcon={<CloseRounded color="error" />} />} sx={{ position: 'absolute', right: '2rem', top: '2.4rem' }}
                                                            FabProps={{ sx: { boxShadow: 'none !important', background: 'transparent !important' }, disableRipple: true }}
                                                            direction="down">
                                                              <SpeedDialAction tooltipTitle='Edit' icon={<EditRounded />} onClick={(e) => handleSpeedDial('edit', trackerId, e)} disabled={editModeId !== trackerId && editModeId !== null} />
                                                              <SpeedDialAction tooltipTitle='Delete' icon={speedDialLoading ? <CircularProgress color="inherit" size={20} thickness={5} /> : <DeleteRounded color="error" />}
                                                              onClick={(e) => handleSpeedDial('delete', trackerId, e)} FabProps={{ disabled: speedDialLoading }} />
                                                          </SpeedDial>
                                                         </>
                            }
                            <Card sx={{ margin: "2rem", borderRadius: "1rem", transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms' }} style={{cursor: 'pointer'}} onMouseEnter={(e) =>
                              e.currentTarget.style.boxShadow = "0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)"}
                              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)"}
                              onClick={(e) => {
                                if(e.currentTarget.querySelector('aside')){
                                  setOpen(false)
                                } else {
                                  setTrackerId(trackerId)
                                  setTrackerName(name)
                                  setTotal(total)
                                  setFromDate(fromDate)
                                  setToDate(toDate)
                                  setOpen(true)
                                }
                              }}>
                              {
                                editModeId === trackerId ? <CardHeader avatar={
                                                             <Avatar sx={{ bgcolor: "#00C169" }}>
                                                               <BarChartRounded color="secondary" />
                                                             </Avatar>
                                                           } title={<TrackerEdit name={name} trackerId={trackerId} fromDate={fromDate} toDate={toDate} userId={userId} setEditModeId={setEditModeId} setOpenSnack2={setOpenSnack2} data={data} setData={setData} />} titleTypographyProps={{ fontSize: '18px' }} action={
                                                             <Avatar sx={{ bgcolor: "#00C169", visibility: 'hidden', marginLeft: '24px' }}>
                                                               <BarChartRounded color="secondary" />
                                                             </Avatar>
                                                           } />
                                                         : <CardHeader avatar={
                                                             <Avatar sx={{ bgcolor: "#00C169" }}>
                                                               <BarChartRounded color="secondary" />
                                                             </Avatar>
                                                           } title={name} titleTypographyProps={{ fontSize: '18px' }} action={
                                                             <Avatar sx={{ bgcolor: "#00C169", visibility: 'hidden', marginLeft: '24px' }}>
                                                               <BarChartRounded color="secondary" />
                                                             </Avatar>
                                                           } />
                              }
                              <CardContent>
                                <div style={{ height: 0 }} className="invisible">
                                  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam quisquam eligendi repellendus voluptas ducimus minus provident rem beatae, quia cumque optio quidem facilis magni quo tenetur! Iste hic alias provident.
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                  {
                                    editModeId === trackerId ? <div className="invisible d-flex flex-column align-items-start" style={{ width:'calc(100%/3)' }}>
                                                                 <div className="h6">From: {dayjs(fromDate).format('MMMM D, YYYY')}</div>
                                                                 <div className="h6">To: {dayjs(toDate).format('MMMM D, YYYY')}</div>
                                                               </div>
                                                             : <div className="d-flex flex-column align-items-start" style={{ width:'calc(100%/3)' }}>
                                                                 <div className="h6">From: {dayjs(fromDate).format('MMMM D, YYYY')}</div>
                                                                 <div className="h6">To: {dayjs(toDate).format('MMMM D, YYYY')}</div>
                                                               </div>
                                  }
                                  {
                                    editModeId === trackerId && window.screen.availWidth<768 ? <ReceiptLottie className={'invisible'} />
                                                                                             : <ReceiptLottie className={''} />
                                  }
                                  <div className="d-flex align-items-center justify-content-end" style={{ fontSize: '24px', width: 'calc(100%/3)' }}>
                                    {
                                      editModeId === trackerId && window.screen.availWidth<768 ? <TotalAnimated className={'invisible'} total={total} totalChange={totalChange} setTotalChange={setTotalChange} userId={userId} trackerId={trackerId} converter={converter} />
                                                                                               : <TotalAnimated className={''} total={total} totalChange={totalChange} setTotalChange={setTotalChange} userId={userId} trackerId={trackerId} converter={converter} />
                                    }
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
       total={total} setTotal={setTotal} fromDate={fromDate} setFromDate={setFromDate}
       toDate={toDate} setToDate={setToDate} userId={userId} setTotalChange={setTotalChange} />

    </Paper>
  )
}

function ReceiptLottie({className}) {
  const lottieRef = useRef()
  return (
    <>
      <Lottie animationData={receiptAnimation} loop={false} lottieRef={lottieRef} className={`d-flex justify-content-center align-items-center ${className}`}
       style={{ width: 'calc(100%/3)' }} onDOMLoaded={() => lottieRef.current.playSegments([0, 220], true)} />
    </>
  )
}
function TotalAnimated({className, total, totalChange, setTotalChange, userId, trackerId, converter}) {
  const [load, setLoad] = useState(true)
  const totalRef = useRef()
  const tl = gsap.timeline({delay:1.5})

  useEffect(() => {
    if(load) {
      setLoad(false)
      const count = {value: 0}, newValue = total
      tl.to(count, { value: newValue, onUpdate: () => {
        if(totalRef.current){
          totalRef.current.textContent = `Total: ${converter.format(count.value)}`
        }
      }})
        .fromTo(totalRef.current, {opacity:0}, {opacity:1, duration:0.5}, "<")
    }

    if(totalChange) {
      setTotalChange(false)

      fetch(`/api/server/trackers/${userId}/${trackerId}`)
        .then(res => res.json())
        .then(data => {
          if(totalRef.current){
            totalRef.current.textContent = `Total: ${converter.format(data.total)}`
          }
        })
        .catch(error => {
          window.alert(error)
          console.error(error)
        })
    }
  },[load, totalChange, setTotalChange, total, tl, converter, userId, trackerId])

  return (
    <div ref={totalRef} className={`${className} total`} style={{zIndex: '33'}}>
      {
        //skeleton loading here after changing total here? or increment to updated total w/ animation?
      }
    </div>
  )
}

function TrackerEdit({name, trackerId, fromDate, toDate, userId, setEditModeId, setOpenSnack2, data, setData}) {
  const [newName, setNewName] = useState(name)
  const [dateRange, setDateRange] = useState([dayjs(fromDate), dayjs(toDate)])
  const [error, setError] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  const handleEdit = async (trackerId, e) => {
    const cardNode = e.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode
    setEditLoading(true)

    const reqBody = {
      newName,
      newFromDate: dayjs(dateRange[0].$d).format('MM-DD-YYYY'),
      newToDate: dayjs(dateRange[1].$d).format('MM-DD-YYYY')
    }

    await fetch(`/api/server/trackers/${userId}/${trackerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody)
    })
      .then(() => {
        const trackerIds = data.map(tracker => tracker.trackerId)
        const idIndex = trackerIds.indexOf(trackerId)
        data[idIndex].name = newName
        data[idIndex].fromDate = dayjs(dateRange[0]).format('MMMM D, YYYY')
        data[idIndex].toDate = dayjs(dateRange[1]).format('MMMM D, YYYY')

        setEditLoading(false)
        setEditModeId(null)
        setData(data)
        setOpenSnack2(true)
        cardNode.style.cursor = 'pointer'
        cardNode.style.background = 'white'
      })
      .catch(error => {
        setEditLoading(false)
        setError(true)
        window.alert(error)
        console.error(error)
      })
  }

  return (
    <>
      <TextField value={newName} type="name" id="name" required disabled={editLoading}
       variant="standard" label="Tracker name" onChange={(e) => setNewName(e.target.value)}
       InputLabelProps={{ required: false }} error={error}
       helperText={error ? 'Please try again' : 'Ex: Gas'} />

      <aside>
        <Tooltip title='Submit' placement="left" componentsProps={{ tooltip: { sx: { bgcolor: "#00C169" } } }}>
          <IconButton onClick={(e) => handleEdit(trackerId, e)} sx={{ position: 'absolute', right: '2.5rem', top: '2.9rem' }}
           disabled={editLoading}>
            {
              editLoading ? <CircularProgress color="inherit" size={24} thickness={5} />
                          : <DoneRounded color="primary" />
            }
          </IconButton>
        </Tooltip>
        <Tooltip title='Cancel' placement="left" componentsProps={{ tooltip: { sx: { bgcolor: "#d32f2f" } } }}>
          <IconButton onClick={(e) => {
             setEditModeId(null)
             e.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode.style.cursor='pointer'
             e.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode.style.background = 'white'
           }} sx={{ position: 'absolute', right: '2.5rem', top: '5.5rem', color: '#d32f2f' }}
           disabled={editLoading}>
            <CloseRounded />
          </IconButton>
        </Tooltip>
      </aside>

      <Box sx={{position: 'absolute', left: '3rem', top: '54%', zIndex: 333}}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateRangePicker label='Date range' slots={{ field: SingleInputDateRangeField }} calendars={1} value={dateRange}
           onChange={(newValue) => setDateRange(newValue)} disabled={editLoading} onOpen={() => setTimeout(() => document.querySelector('.trackerDateRangeEdit .MuiDateRangeCalendar-root').firstChild.remove(), 100)}
           slotProps={{textField: {variant: 'standard', error: error, helperText: error ? 'Please try again' : ''},
                       popper: {className: 'trackerDateRangeEdit'}, dialog: {className: 'trackerDateRangeEdit'}}} />
        </LocalizationProvider>
      </Box>
    </>
  )
}


const Transition2 = forwardRef(function Transition(props, ref) {
  return <Grow in timeout='auto' ref={ref} {...props} />
})

const NumericFormatCustom = forwardRef(function NumericFormatCustom(props, ref) {
  const { onChange, ...other } = props

  return (
    <NumericFormat {...other} getInputRef={ref} onValueChange={(values) => {
      onChange({target: {name: props.name, value: values.value},})
     }} thousandSeparator valueIsNumericString prefix="$" />
  )
})
NumericFormatCustom.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

function TrackerDetails({ open, setOpen, trackerId, setTrackerId, trackerName, setTrackerName, total, setTotal, fromDate, setFromDate, toDate, setToDate, userId, setTotalChange }) {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [end, setEnd] = useState(false)

  const [categorySpeedDialLoading, setCategorySpeedDialLoading] = useState(false)
  const [openSnack5, setOpenSnack5] = useState(false)
  const [newCategory, setNewCategory] = useState(null)
  const [categoryEditLoading, setCategoryEditLoading] = useState(false)
  const [categoryError, setCategoryError] = useState(false)
  const [openSnack4, setOpenSnack4] = useState(false)

  const [speedDialLoading, setSpeedDialLoading] = useState(false)
  const [openSnack, setOpenSnack] = useState(false)
  const [newTotal, setNewTotal] = useState(null)

  const [editModeId, setEditModeId] = useState(null)
  const [openSnack2, setOpenSnack2] = useState(false)

  const [expand, setExpand] = useState(false)
  const [transactionCategory, setTransactionCategory] = useState('')
  const [transactionName, setTransactionName] = useState('')
  const [addTransactionLoading, setAddTransactionLoading] = useState(false)
  const [addTransactionError, setAddTransactionError] = useState(false)
  const [transactionDate, setTransactionDate] = useState('')
  const [transactionAmount, setTransactionAmount] = useState('')
  const [transactionAccount, setTransactionAccount] = useState(['',''])
  const [selectLoading, setSelectLoading] = useState(true)
  const [connectedAccounts, setConnectedAccounts] = useState([])
  const [transactionAccountCustom, setTransactionAccountCustom] = useState('')
  const [openSnack3, setOpenSnack3] = useState(false)

  const converter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

  useEffect(() => {
    const fetchData = async () => {

      if(loading && !end && trackerId) {
        setEnd(true)

        await fetch(`/api/server/trackers/${userId}/${trackerId}`)
          .then(res => res.json())
          .then(data => {
            setTotal(data.total)
          })
          .catch(error => {
            window.alert(error)
            console.error(error)
          })

        await fetch(`/api/server/transactions/${trackerId}`)
          .then(res => res.json())
          .then(data => {
            setTransactions(data)
            setCategories(data.map(transaction => transaction.category.replace(/[{()}"']/g, '').split(',')[0]).filter((c,i,a) => a.indexOf(c) === i))
            setLoading(false)
          })
          .catch(error => {
            window.alert(error)
            console.error(error)
          })
      }
    }
    fetchData()

    if(!expand) {
      setTransactionCategory('')
      setTransactionName('')
      setAddTransactionLoading(false)
      setAddTransactionError(false)
      setTransactionDate('')
      setTransactionAmount('')
      setTransactionAccount(['',''])
      setConnectedAccounts([])
      setTransactionAccountCustom('')
      setSelectLoading(true)
    }
    if(transactionAccount[1] !== 'Custom (added)') {
      setTransactionAccountCustom('')
    }
  },[loading, end, trackerId, userId, setTotal, expand, transactionAccount])

  const handleSpeedDial = async (type, transaction_id, e) => {
    if(type === 'delete') {
      setSpeedDialLoading(true)

      await fetch(`/api/server/transactions/${trackerId}/${transaction_id}`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" }
      })
        .then(() => {
          const transactionIds = transactions.map(transaction => transaction.transaction_id)
          const idIndex = transactionIds.indexOf(transaction_id)
          const newTransactions = transactions.toSpliced(idIndex, 1)
          setTransactions(newTransactions)
          setCategories(newTransactions.map(transaction => transaction.category.replace(/[{()}"']/g, '').split(',')[0]).filter((c,i,a) => a.indexOf(c) === i))

          setSpeedDialLoading(false)
          setOpenSnack(true)

          const amounts = newTransactions.map(transaction => parseFloat(transaction.amount))
          const newTrackerTotal = amounts.reduce((a,b) => a + b, 0)
          setNewTotal(newTrackerTotal)
        })
        .catch(error => {
          setSpeedDialLoading(false)
          window.alert(error)
          console.error(error)
        })

    } else {
      setEditModeId(transaction_id)
      setExpand(false)
    }
  }

  const handleCategorySpeedDial = (type, category, e) => {
    if(type === 'delete') {
      setCategorySpeedDialLoading(true)

      const deleteTransactionCategories = transactions.filter(transaction => transaction.category.replace(/[{()}"']/g, '').split(',')[0] === category)

      for (let i = 0; i < deleteTransactionCategories.length; i++) {
        if(i === deleteTransactionCategories.length -1) {
          fetch(`/api/server/transactions/${trackerId}/${deleteTransactionCategories[i].transaction_id}`, {
            method: 'DELETE',
            headers: { "Content-Type": "application/json" }
          })
            .then(() => {
              const newTransactions = transactions.filter(transaction => transaction.category.replace(/[{()}"']/g, '').split(',')[0] !== category)
              setTransactions(newTransactions)
              setCategories(newTransactions.map(transaction => transaction.category.replace(/[{()}"']/g, '').split(',')[0]).filter((c, i, a) => a.indexOf(c) === i))

              setCategorySpeedDialLoading(false)
              setOpenSnack5(true)

              const amounts = newTransactions.map(transaction => parseFloat(transaction.amount))
              const newTrackerTotal = amounts.reduce((a, b) => a + b, 0)
              setNewTotal(newTrackerTotal)
            })
            .catch(error => {
              setCategorySpeedDialLoading(false)
              window.alert(error)
              console.error(error)
            })

        } else {
          fetch(`/api/server/transactions/${trackerId}/${deleteTransactionCategories[i].transaction_id}`, {
            method: 'DELETE',
            headers: { "Content-Type": "application/json" }
          })
            .then(() => {

            })
            .catch(error => {
              setCategorySpeedDialLoading(false)
              window.alert(error)
              console.error(error)
            })
        }
      }

    } else {
      if(e.currentTarget.ariaLabel === 'Edit') {
        setEditModeId(category)
        setExpand(false)

      } else {
        e.preventDefault()
        setCategoryEditLoading(true)

        const changedTransactionCategories = transactions.filter(transaction => transaction.category.replace(/[{()}"']/g, '').split(',')[0] === category)

        for(let i=0; i<changedTransactionCategories.length; i++) {
          if(i === changedTransactionCategories.length -1) {
            fetch(`/api/server/transactions/${trackerId}/${changedTransactionCategories[i].transaction_id}?update=category`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ newCategory })
            })
              .then(() => {
                transactions.forEach(transaction => {
                  if(transaction.category.replace(/[{()}"']/g, '').split(',')[0] === category) {
                    transaction.category = newCategory
                  } else {
                    transaction.category = transaction.category.replace(/[{()}"']/g, '').split(',')[0]
                  }
                })

                const updatedCategories = transactions.map(transaction => transaction.category).filter((c,i,a) => a.indexOf(c) === i)

                setCategoryEditLoading(false)
                setEditModeId(null)
                setCategoryError(false)
                setNewCategory(null)
                setCategories(updatedCategories)
                setOpenSnack4(true)
              })
              .catch(error => {
                setCategoryEditLoading(false)
                setCategoryError(true)
                window.alert(error)
                console.error(error)
              })

          } else {
            fetch(`/api/server/transactions/${trackerId}/${changedTransactionCategories[i].transaction_id}?update=category`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ newCategory })
            })
              .then(() => {

              })
              .catch(error => {
                setCategoryEditLoading(false)
                setCategoryError(true)
                window.alert(error)
                console.error(error)
              })
          }
        }
      }
    }
  }

  const handleAddTransaction = async (e) => {
    e.preventDefault()
    setAddTransactionLoading(true)

    function customTransactionIdGenerator() {
      var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      };
      return ('added' + S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
    }

    const reqBody = {
      transaction_id: customTransactionIdGenerator(),
      trackerId: trackerId,
      account_id: transactionAccount[1] === "Custom (added)" ? `${transactionAccountCustom} (custom)` : transactionAccount[1],
      amount: transactionAmount,
      category: transactionCategory,
      date: dayjs(transactionDate.$d).format('YYYY-MM-DD'),
      iso_currency_code: 'USD',
      name: transactionName
    }

    await fetch(`/api/server/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody)
    })
      .then(() => {
        transactions.push(reqBody)
        setCategories(transactions.map(transaction => transaction.category.replace(/[{()}"']/g, '').split(',')[0]).filter((c,i,a) => a.indexOf(c) === i))
        setOpenSnack3(true)
        setAddTransactionLoading(false)
        setTransactionCategory('')
        setTransactionName('')
        setTransactionAmount('')
        setTransactionDate('')
        setTransactionAccount(['',''])
        setTransactionAccountCustom('')
        setTimeout(() => setExpand(false), 300)

        const amounts = transactions.map(transaction => parseFloat(transaction.amount))
        const newTrackerTotal = amounts.reduce((a, b) => a + b, 0)
        setNewTotal(newTrackerTotal)
      })
      .catch(error => {
        setAddTransactionLoading(false)
        setAddTransactionError(true)
        window.alert(error)
        console.error(error)
      })
  }

  const handleSnackClose = (e, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenSnack(false)
  }
  const handleSnackClose2 = (e, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenSnack2(false)
  }
  const handleSnackClose3 = (e, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenSnack3(false)
  }
  const handleSnackClose4 = (e, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenSnack4(false)
  }
  const handleSnackClose5 = (e, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenSnack5(false)
  }

  return (
    <>
      <Dialog open={open} TransitionComponent={Transition2} onClose={() => {
        setLoading(true)
        setEnd(false)
        setTransactions(null)
        setCategories(null)
        setTrackerId(null)
        setTrackerName(null)
        setTotal(null)
        setFromDate(null)
        setToDate(null)
        setOpen(false)
        setNewTotal(null)
        setTotalChange(true)
        setEditModeId(null)
        setCategoryError(false)
        setNewCategory(null)
        setCategoryEditLoading(false) //don't want to unless user has to
        setCategorySpeedDialLoading(false) //same as above :)
        setExpand(false)
       }}
       closeAfterTransition keepMounted fullScreen PaperProps={{style: {background: "#FFD800",
       alignItems: "center", padding: "3rem 0rem"}}} scroll="body">
        <DialogTitle className="w-100 text-center">
          {
            loading ? <Skeleton variant="rectangle" sx={{margin: 'auto', borderRadius: '1rem'}}>
                        <div className='h2'>Groceries and Gas</div>
                      </Skeleton>
                    : <div className='h2'>{trackerName}</div>
          }
        </DialogTitle>
        <DialogContent className="w-100">

          <DialogContentText sx={{marginBottom:'3rem', color:'black'}}>
            {
              loading ? <>
                          <Skeleton variant="rectangle" sx={{margin: 'auto', borderRadius: '1rem'}}>
                            <span className="h4 text-center d-block">6/6/1997 to 5/9/2023</span>
                          </Skeleton>
                          <Skeleton variant="rectangle" sx={{margin: 'auto', borderRadius: '1rem'}}>
                            <span className="h4 text-center d-block">Total expenditure</span>
                          </Skeleton>
                        </>
                      : <>
                          <span className="h4 text-center d-block">
                            {dayjs(fromDate).format('MM/DD/YY')} &ndash; {dayjs(toDate).format('MM/DD/YY')}
                          </span>
                          <span className="h4 text-center d-block">
                            Total:
                            {
                              newTotal === null ? <> {converter.format(total)}</>
                                                : <TrackerTotal userId={userId} trackerId={trackerId} newTotal={newTotal} converter={converter} />
                            }
                          </span>
                        </>
            }
          </DialogContentText>

          <Card sx={{bgcolor: '#00C169', borderRadius: '1rem', maxWidth: '1000px'}} className="m-auto">
            <CardContent>
              <div className="h4 text-center m-3" style={{fontWeight: 'bold', color: 'white'}}>
                Transactions
              </div>
              <List>
                {
                  loading ? <Skeleton variant="rectangle" sx={{borderRadius: '2rem', maxWidth: '100%'}}>
                              <Box sx={{ background: '#FFD6A0', padding: '1rem' }}>
                                <CategoryRounded />
                                <span> Category</span>
                              </Box>
                            </Skeleton>
                          : <>
                              {
                                categories.map(category => {
                                  const parsedCategory = category.replace(/[{()}"']/g, '').split(',')

                                  return (
                                    <Box key={category} sx={{marginBottom: '1rem'}}>
                                      <Box className='d-flex justify-content-between' sx={{ background: '#FFD6A0', padding: '1rem', borderRadius: '2rem', position: 'relative' }}>
                                        {
                                          editModeId === parsedCategory[0]
                                            ? <div className="w-100">
                                                <form className="d-flex justify-content-between w-100 align-items-center"
                                                 onSubmit={(e) => handleCategorySpeedDial('edit', parsedCategory[0], e)}>
                                                  <TextField value={newCategory} id="categoryName" required disabled={categoryEditLoading}
                                                    variant="standard" label="Category name" onChange={(e) => setNewCategory(e.target.value)}
                                                    InputLabelProps={{ required: false }} error={categoryError}
                                                    helperText={categoryError ? 'Please try again' : 'Ex: Groceries'} />

                                                  <div className="d-flex">
                                                    <Tooltip title='Submit' placement="top" componentsProps={{ tooltip: { sx: { bgcolor: "#00C169" } } }}>
                                                      <IconButton type="submit" disabled={categoryEditLoading}>
                                                        {
                                                          categoryEditLoading ? <CircularProgress color="inherit" size={24} thickness={5} />
                                                                              : <DoneRounded color="primary" />
                                                        }
                                                      </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title='Cancel' placement="top" componentsProps={{ tooltip: { sx: { bgcolor: "#d32f2f" } } }}>
                                                      <IconButton onClick={(e) => {
                                                        setEditModeId(null)
                                                        setCategoryError(false)
                                                        setNewCategory(null)
                                                       }} sx={{ color: '#d32f2f' }} disabled={categoryEditLoading}>
                                                        <CloseRounded />
                                                      </IconButton>
                                                    </Tooltip>
                                                  </div>
                                                </form>
                                              </div>
                                            : <div>
                                                <CategoryRounded />
                                                <span> {parsedCategory[0]}</span>
                                              </div>
                                        }
                                        <div>
                                          {
                                            editModeId === parsedCategory[0]
                                              ? <></>
                                              : <div style={{ position: 'relative', right: '2rem' }}>
                                                  {
                                                    converter.format(transactions.map(transaction => transaction.category.replace(/[{()}"']/g, '').split(',')[0] === category ? transaction : { amount: 0 }).reduce((a, b) => a + parseFloat(b.amount), 0))
                                                  }
                                                </div>
                                          }
                                          {
                                            editModeId === parsedCategory[0]
                                              ? <></>
                                              : <SpeedDial ariaLabel="Category Options SpeedDial" icon={<SpeedDialIcon icon={<MoreVertRounded />}
                                                 openIcon={<CloseRounded color="error" />} />} sx={{ position: 'absolute', right: '0', top: '0' }}
                                                 FabProps={{ sx: { boxShadow: 'none !important', background: 'transparent !important' }, disableRipple: true, disabled: categoryEditLoading }}
                                                 direction="down">
                                                  <SpeedDialAction tooltipTitle='Edit' tooltipPlacement="left" icon={<EditRounded />} onClick={(e) => handleCategorySpeedDial('edit', parsedCategory[0], e)} disabled={editModeId !== parsedCategory[0] && editModeId !== null  || categorySpeedDialLoading} />
                                                  <SpeedDialAction tooltipTitle='Delete' tooltipPlacement="left" icon={categorySpeedDialLoading ? <CircularProgress color="inherit" size={20} thickness={5} /> : <DeleteRounded color="error" />}
                                                   onClick={(e) => handleCategorySpeedDial('delete', parsedCategory[0], e)} FabProps={{ disabled: categorySpeedDialLoading }} />
                                                </SpeedDial>
                                          }
                                        </div>
                                      </Box>

                                      {
                                        transactions.map(transaction => {
                                          const { transaction_id, account_id, amount,
                                            date, iso_currency_code, name } = transaction

                                          if(transaction.category.replace(/[{()}"']/g, '').split(',')[0] === category) {
                                            return (
                                              <ListItem key={transaction_id} id={transaction_id} secondaryAction={
                                                <div>{converter.format(amount)}</div>
                                               } sx={{
                                                 background: 'white', borderRadius: '1rem', margin: '0.5rem auto', width: '97%', transition: 'all ease 0.3s',
                                                 boxShadow: 'rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px'
                                               }}>
                                                <ListItemAvatar>
                                                  {
                                                    editModeId === transaction_id
                                                      ? <SpeedDial className="invisible" ariaLabel="Options SpeedDial" icon={<SpeedDialIcon icon={<MoreVertRounded />}
                                                         openIcon={<CloseRounded color="error" />} />} sx={{ position: 'relative', right: '1rem' }}
                                                         FabProps={{ sx: { boxShadow: 'none !important', background: 'transparent !important' }, disableRipple: true, disabled: categoryEditLoading || categorySpeedDialLoading }}
                                                         direction="down">
                                                          <SpeedDialAction tooltipTitle='Edit' tooltipPlacement="right" icon={<EditRounded />} onClick={(e) => handleSpeedDial('edit', transaction_id, e)} />
                                                          <SpeedDialAction tooltipTitle='Delete' tooltipPlacement="right" icon={speedDialLoading ? <CircularProgress color="inherit" size={20} thickness={5} /> : <DeleteRounded color="error" />}
                                                           onClick={(e) => handleSpeedDial('delete', transaction_id, e)} FabProps={{ disabled: speedDialLoading }} />
                                                        </SpeedDial>
                                                      : <SpeedDial ariaLabel="Options SpeedDial" icon={<SpeedDialIcon icon={<MoreVertRounded />}
                                                         openIcon={<CloseRounded color="error" />} />} sx={{ position: 'relative', right: '1rem' }}
                                                         FabProps={{ sx: { boxShadow: 'none !important', background: 'transparent !important' }, disableRipple: true, disabled: categoryEditLoading || categorySpeedDialLoading }}
                                                         direction="down">
                                                          <SpeedDialAction tooltipTitle='Edit' tooltipPlacement="right" icon={<EditRounded />} onClick={(e) => handleSpeedDial('edit', transaction_id, e)} />
                                                          <SpeedDialAction tooltipTitle='Delete' tooltipPlacement="right" icon={speedDialLoading ? <CircularProgress color="inherit" size={20} thickness={5} /> : <DeleteRounded color="error" />}
                                                           onClick={(e) => handleSpeedDial('delete', transaction_id, e)} FabProps={{ disabled: speedDialLoading }} />
                                                        </SpeedDial>
                                                  }
                                                </ListItemAvatar>
                                                <ListItemText primary={
                                                  editModeId === transaction_id
                                                    ? <TransactionEdit name={name} transaction_id={transaction_id} transactions={transactions} setTransactions={setTransactions}
                                                      setEditModeId={setEditModeId} trackerId={trackerId} setOpenSnack2={setOpenSnack2} />
                                                    : name
                                                } secondary={
                                                  <span className="d-block">
                                                    {dayjs(date).format('MMMM D, YYYY')}
                                                    <TransactionInfo account_id={account_id} />
                                                  </span>
                                                } />
                                              </ListItem>
                                            )

                                          } else {
                                            return
                                          }
                                        })
                                      }
                                    </Box>
                                  )
                                })
                              }
                            </>
                }
                {
                  loading ? <>
                              <Skeleton variant="rectangle" sx={{margin:'8px 16px', borderRadius: '1rem'}}>
                                <ListItem sx={{width: '100vw'}}>
                                  <ListItemAvatar>
                                    <SpeedDial ariaLabel="Options SpeedDial" icon={<SpeedDialIcon icon={<MoreVertRounded />}
                                     openIcon={<CloseRounded color="error" />} />} sx={{position: 'relative', right: '1rem'}}
                                     FabProps={{ sx: { boxShadow: 'none !important', background: 'transparent !important' }, disableRipple: true }}
                                     direction="down">
                                      <SpeedDialAction tooltipTitle='Edit' tooltipPlacement="right" icon={<EditRounded />} onClick={(e) => handleSpeedDial('edit', transaction_id, e)} disabled={false} />
                                      <SpeedDialAction tooltipTitle='Delete' tooltipPlacement="right" icon={speedDialLoading ? <CircularProgress color="inherit" size={20} thickness={5} /> : <DeleteRounded color="error" />}
                                       onClick={(e) => handleSpeedDial('delete', transaction_id, e)} FabProps={{ disabled: speedDialLoading }} />
                                    </SpeedDial>
                                  </ListItemAvatar>
                                  <ListItemText primary="$420.69" secondary="June 6th, 2023" />
                                </ListItem>
                              </Skeleton>
                              <Skeleton variant="rectangle" sx={{margin:'8px 16px', borderRadius: '1rem'}}>
                                <ListItem sx={{width: '100vw'}}>
                                  <ListItemAvatar>
                                    <SpeedDial ariaLabel="Options SpeedDial" icon={<SpeedDialIcon icon={<MoreVertRounded />}
                                     openIcon={<CloseRounded color="error" />} />} sx={{position: 'relative', right: '1rem'}}
                                     FabProps={{ sx: { boxShadow: 'none !important', background: 'transparent !important' }, disableRipple: true }}
                                     direction="down">
                                      <SpeedDialAction tooltipTitle='Edit' tooltipPlacement="right" icon={<EditRounded />} onClick={(e) => handleSpeedDial('edit', transaction_id, e)} disabled={false} />
                                      <SpeedDialAction tooltipTitle='Delete' tooltipPlacement="right" icon={speedDialLoading ? <CircularProgress color="inherit" size={20} thickness={5} /> : <DeleteRounded color="error" />}
                                       onClick={(e) => handleSpeedDial('delete', transaction_id, e)} FabProps={{ disabled: speedDialLoading }} />
                                    </SpeedDial>
                                  </ListItemAvatar>
                                  <ListItemText primary="$3.33" secondary="April 20th, 2023" />
                                </ListItem>
                              </Skeleton>
                              <Skeleton variant="rectangle" sx={{margin:'8px 16px', borderRadius: '1rem'}}>
                                <ListItem sx={{width: '100vw'}}>
                                  <ListItemAvatar>
                                    <SpeedDial ariaLabel="Options SpeedDial" icon={<SpeedDialIcon icon={<MoreVertRounded />}
                                     openIcon={<CloseRounded color="error" />} />} sx={{position: 'relative', right: '1rem'}}
                                     FabProps={{ sx: { boxShadow: 'none !important', background: 'transparent !important' }, disableRipple: true }}
                                     direction="down">
                                      <SpeedDialAction tooltipTitle='Edit' tooltipPlacement="right" icon={<EditRounded />} onClick={(e) => handleSpeedDial('edit', transaction_id, e)} disabled={false} />
                                      <SpeedDialAction tooltipTitle='Delete' tooltipPlacement="right" icon={speedDialLoading ? <CircularProgress color="inherit" size={20} thickness={5} /> : <DeleteRounded color="error" />}
                                       onClick={(e) => handleSpeedDial('delete', transaction_id, e)} FabProps={{ disabled: speedDialLoading }} />
                                    </SpeedDial>
                                  </ListItemAvatar>
                                  <ListItemText primary="$69.42" secondary="May 4th, 2023" />
                                </ListItem>
                              </Skeleton>
                            </>
                          : <>
                              <ListItem className="d-flex flex-column">
                                <Collapse in={expand} timeout='auto' sx={{width: '100%', background: 'white', borderRadius: '1rem'}}>
                                  <form onSubmit={handleAddTransaction}>
                                    <ListItemText sx={{padding: '1rem'}} primary={
                                      <>
                                        <div className="d-flex justify-content-start">
                                          <TextField value={transactionCategory} id="category" required disabled={addTransactionLoading}
                                            variant="standard" label="Category" onChange={(e) => setTransactionCategory(e.target.value)}
                                            InputLabelProps={{ required: false }} error={addTransactionError} sx={{ marginBottom: '0.5rem' }}
                                            helperText={addTransactionError ? 'Please try again' : 'Ex: Shopping'} fullWidth />
                                        </div>

                                        <div className="d-flex justify-content-between">
                                          <TextField value={transactionName} type="name" id="name" required disabled={addTransactionLoading}
                                            variant="standard" label="Name" onChange={(e) => setTransactionName(e.target.value)}
                                            InputLabelProps={{ required: false }} error={addTransactionError} sx={{ marginBottom: '0.5rem' }}
                                            helperText={addTransactionError ? 'Please try again' : 'Ex: Aesop'} />

                                          <TextField value={transactionAmount} type="currency" id="amount" required disabled={addTransactionLoading}
                                            variant="standard" label="Amount" onChange={(e) => setTransactionAmount(e.target.value)}
                                            InputLabelProps={{ required: false }} error={addTransactionError} InputProps={{inputComponent: NumericFormatCustom}}
                                            helperText={addTransactionError ? 'Please try again' : ''} placeholder="$0.00" />
                                        </div>

                                        <div className="d-flex justify-content-between mb-2">
                                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker label='Date' value={transactionDate} onChange={(newValue) => setTransactionDate(newValue)} minDate={dayjs(fromDate)}
                                            slotProps={{textField: {variant: 'standard', error: addTransactionError, helperText: addTransactionError ? 'Please try again' : '',
                                            required: true, InputLabelProps: {required: false}}}} disabled={addTransactionLoading} maxDate={dayjs(toDate)} />
                                          </LocalizationProvider>

                                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker className="invisible" label='Date' value={transactionDate} onChange={(newValue) => setTransactionDate(newValue)} minDate={dayjs(fromDate)}
                                            slotProps={{textField: {fullWidth: true, variant: 'standard', error: addTransactionError, helperText: addTransactionError ? 'Please try again' : '',
                                            required: true, InputLabelProps: {required: false}}}} disabled={addTransactionLoading} maxDate={dayjs(toDate)} />
                                          </LocalizationProvider>
                                        </div>

                                        <div className="d-flex">
                                          <FormControl variant="standard" required error={addTransactionError} disabled={addTransactionLoading}
                                           sx={{minWidth: '22.5%'}}>
                                            <Select value={transactionAccount[0]} onChange={(e, child) => {
                                              setTransactionAccount([e.target.value, child.key.substring(4)])
                                            }}
                                             IconComponent={ArrowDropDownRounded} onOpen={() => {
                                               if(selectLoading) {
                                                 fetch(`/api/server/institutions?userId=${userId}`)
                                                   .then(res => res.json())
                                                   .then(data => {
                                                     const allAccounts = []

                                                     for(let i=0; i<data.length; i++) {
                                                      if(i === data.length-1) {
                                                        fetch(`/api/server/accounts?item_id=${data[i].item_id}`)
                                                          .then(res => res.json())
                                                          .then(accounts => {
                                                            accounts.map(account => {
                                                              allAccounts.push(account)
                                                            })
                                                            setTimeout(() => {
                                                              setConnectedAccounts(allAccounts)
                                                              setSelectLoading(false)
                                                            },300)
                                                          })
                                                          .catch(error => {
                                                            window.alert(error)
                                                            console.error(error)
                                                          })
                                                      } else {
                                                        fetch(`/api/server/accounts?item_id=${data[i].item_id}`)
                                                          .then(res => res.json())
                                                          .then(accounts => {
                                                            accounts.map(account => allAccounts.push(account))
                                                          })
                                                          .catch(error => {
                                                            window.alert(error)
                                                            console.error(error)
                                                          })
                                                      }
                                                     }
                                                   })
                                                   .catch(error => {
                                                     window.alert(error)
                                                     console.error(error)
                                                   })
                                               }
                                             }}>
                                              {
                                                selectLoading ? <Skeleton variant="rectangle" sx={{ borderRadius: '1rem', maxWidth: '90%', margin: 'auto' }}>
                                                                  <MenuItem value='SoFi Checking'>SoFi Checking</MenuItem>
                                                                </Skeleton>
                                                              : [
                                                                  connectedAccounts.map(account => {
                                                                    const {name, account_id} = account

                                                                    return (
                                                                      <MenuItem key={account_id} value={name}>{name}</MenuItem>
                                                                    )
                                                                  }),
                                                                  <MenuItem key='leCustom (added)' value='Custom'>Custom</MenuItem>
                                                                ]
                                              }
                                            </Select>
                                            <FormHelperText error={addTransactionError} sx={{marginLeft: '0'}}>
                                              {
                                                addTransactionError ? <>Please try again <span className="invisible d-inline">spa</span></>
                                                                    : <>Account <span className="invisible">Transaction</span></>
                                              }
                                            </FormHelperText>
                                          </FormControl>
                                        </div>

                                        <>
                                          {
                                            transactionAccount[0] === 'Custom' ? <div className="d-flex justify-content-between">
                                                                                   <TextField value={transactionAccountCustom} id="transactionAccount" required disabled={addTransactionLoading}
                                                                                    variant="standard" label="Account name" onChange={(e) => setTransactionAccountCustom(e.target.value)}
                                                                                    InputLabelProps={{ required: false }} error={addTransactionError}
                                                                                    helperText={addTransactionError ? 'Please try again' : 'Ex: Discover It'} />

                                                                                   <TextField className="invisible" value={transactionAccountCustom} id="transactionAccount" required disabled={addTransactionLoading}
                                                                                    variant="standard" label="Account name" onChange={(e) => setTransactionAccountCustom(e.target.value)}
                                                                                    InputLabelProps={{ required: false }} error={addTransactionError}
                                                                                    helperText={addTransactionError ? 'Please try again' : 'Ex: Discover It'} />
                                                                                 </div>
                                                                               : <></>
                                          }
                                        </>
                                      </>
                                     } secondary={
                                        <span className="d-flex justify-content-center">
                                          <LoadingButton loading={addTransactionLoading} type="submit" sx={{
                                           top: '0.65rem', left: '0.25rem', textTransform: 'none', borderRadius: '2rem', padding: '6px 16px' }}
                                           loadingPosition="start" startIcon={<DoneRounded />}>
                                            Submit
                                          </LoadingButton>
                                        </span>
                                      } />
                                  </form>
                                </Collapse>
                                <ListItemButton className="d-flex justify-content-center" disabled={addTransactionLoading || categoryEditLoading || categorySpeedDialLoading}
                                 sx={{color: 'white', borderRadius: '1rem', width: '100%', marginTop: '1rem'}} onClick={() => {
                                  setExpand(!expand)
                                  setEditModeId(null)
                                 }}>
                                  <div className="d-flex">
                                    {
                                      expand ? <><CloseRounded /> Cancel</>
                                             : <><AddRounded /> Add transaction</>
                                    }
                                  </div>
                                </ListItemButton>
                              </ListItem>
                            </>
                }
              </List>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions sx={{position:'absolute', top:"0.25rem", right:"0.25rem"}}>
          <Fab size='medium' color='error' variant='extended' disabled={categoryEditLoading || categorySpeedDialLoading} onClick={() => {
            setLoading(true)
            setEnd(false)
            setTransactions(null)
            setCategories(null)
            setTrackerId(null)
            setTrackerName(null)
            setTotal(null)
            setFromDate(null)
            setToDate(null)
            setOpen(false)
            setNewTotal(null)
            setTotalChange(true)
            setEditModeId(null)
            setCategoryError(false)
            setNewCategory(null)
            setExpand(false)
           }}>
            <Box className='d-flex align-items-center' sx={{
             color: 'white', textTransform: 'none', lineHeight: 1}}>
              <CloseRounded style={{marginRight:'0.25rem'}} />
              Close
            </Box>
          </Fab>
        </DialogActions>

        <Snackbar open={openSnack3} autoHideDuration={3333} onClose={handleSnackClose3}
          TransitionComponent={TransitionLeft}>
          <Alert variant="filled" color="primary" sx={{ width: '100%', color: 'white' }}
            onClose={handleSnackClose3}>
            Transaction added
          </Alert>
        </Snackbar>
        <Snackbar open={openSnack4} autoHideDuration={3333} onClose={handleSnackClose4}
          TransitionComponent={TransitionLeft}>
          <Alert variant="filled" color="primary" sx={{ width: '100%', color: 'white' }}
            onClose={handleSnackClose4}>
            Category updated
          </Alert>
        </Snackbar>
        <Snackbar open={openSnack2} autoHideDuration={3333} onClose={handleSnackClose2}
          TransitionComponent={TransitionLeft}>
          <Alert variant="filled" color="primary" sx={{ width: '100%', color: 'white' }}
            onClose={handleSnackClose2}>
            Transaction updated
          </Alert>
        </Snackbar>
        <Snackbar open={openSnack5} autoHideDuration={3333} onClose={handleSnackClose5}
          TransitionComponent={TransitionLeft}>
          <Alert variant="filled" color="error" sx={{ width: '100%', color: 'white' }}
            onClose={handleSnackClose5}>
            Category deleted
          </Alert>
        </Snackbar>
        <Snackbar open={openSnack} autoHideDuration={3333} onClose={handleSnackClose}
          TransitionComponent={TransitionLeft}>
          <Alert variant="filled" color="error" sx={{ width: '100%', color: 'white' }}
            onClose={handleSnackClose}>
            Transaction deleted
          </Alert>
        </Snackbar>

      </Dialog>
    </>
  )
}

function TrackerTotal({userId, trackerId, newTotal, converter}) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/server/trackers/${userId}/${trackerId}?update=total`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newTotal })
    })
      .then(() => {
        setLoading(false)
      })
      .catch(error => {
        window.alert(error)
        console.error(error)
      })
  },[newTotal, trackerId, userId])

  return (
    <>
      {
        loading ? <Skeleton className="d-inline" variant="rectangle" sx={{ borderRadius: '1rem' }}>
                    <span className="d-inline"> {converter.format(newTotal)}</span>
                  </Skeleton>
                : <span className="d-inline"> {converter.format(newTotal)}</span>
      }
    </>
  )
}

function TransactionEdit({name, transaction_id, transactions, setTransactions, setEditModeId, trackerId, setOpenSnack2}) {
  const [newName, setNewName] = useState(name)
  const [error, setError] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    document.getElementById('transactionEdit').parentNode.parentNode.parentNode.style.background = '#FFE6C6'

    return () => {
      if(document.getElementById(transaction_id)) {
        document.getElementById(transaction_id).style.background = 'white'
      }
    }
  })

  const handleEdit = async (transaction_id) => {
    setEditLoading(true)

    await fetch(`/api/server/transactions/${trackerId}/${transaction_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({newName})
    })
      .then(() => {
        const transactionIds = transactions.map(transaction => transaction.transaction_id)
        const idIndex = transactionIds.indexOf(transaction_id)
        transactions[idIndex].name = newName

        setEditLoading(false)
        setEditModeId(null)
        setTransactions(transactions)
        setOpenSnack2(true)
      })
      .catch(error => {
        setEditLoading(false)
        setError(true)
        window.alert(error)
        console.error(error)
      })
  }

  return (
    <div id="transactionEdit">
      <TextField value={newName} type="name" id="name" required disabled={editLoading}
       variant="standard" label="Transaction name" onChange={(e) => setNewName(e.target.value)}
       InputLabelProps={{ required: false }} error={error} sx={{marginBottom: '0.75rem'}}
       helperText={error ? 'Please try again' : 'Ex: Acne Studios'} />

      <Tooltip title='Submit' placement="right" componentsProps={{ tooltip: { sx: { bgcolor: "#00C169" } } }}>
        <IconButton onClick={(e) => handleEdit(transaction_id)} sx={{ position: 'absolute', left: '0.5rem', top: '1rem' }}
         disabled={editLoading}>
          {
            editLoading ? <CircularProgress color="inherit" size={24} thickness={5} />
                        : <DoneRounded color="primary" />
          }
        </IconButton>
      </Tooltip>
      <Tooltip title='Cancel' placement="right" componentsProps={{ tooltip: { sx: { bgcolor: "#d32f2f" } } }}>
        <IconButton onClick={(e) => {setEditModeId(null)}} sx={{ position: 'absolute', left: '0.5rem', top: '3.5rem', color: '#d32f2f' }}
         disabled={editLoading}>
          <CloseRounded />
        </IconButton>
      </Tooltip>
    </div>
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
  },[open, firstTime])

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
            <Box className='d-flex align-items-center' sx={{
             color: 'white', textTransform: 'none', lineHeight: 1}}>
              <CloseRounded style={{marginRight:'0.25rem'}} />
              Close
            </Box>
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

  const [expand, setExpand] = useState(false)
  const [trackerName, setTrackerName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {

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

        const transactionsArr = []
        for(let i =0; i<tokens.length; i++){
          const reqBody = { start_date, end_date }

          if(i === tokens.length-1){
            fetch(`/api/server/plaid/transactions_get?accessToken=${tokens[i]}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(reqBody)
            })
              .then(res => res.json())
              .then(data => {
                data.transactions.map(transaction => transactionsArr.push(transaction))
                setTimeout(() => {
                  setTransactions(transactionsArr)
                  setLoading(false)
                },500)
              })
              .catch(error => {
                window.alert(error)
                console.error(error)
              })

          } else {
            fetch(`/api/server/plaid/transactions_get?accessToken=${tokens[i]}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(reqBody)
            })
              .then(res => res.json())
              .then(data => {
                data.transactions.map(transaction => transactionsArr.push(transaction))
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

    if(checked.length > 0) {
      setExpand(true)
    } else if(checked.length === 0) {
      setExpand(false)
      setTrackerName('')
    }
  },[reload, end, loading, checked.length, tokens, value, setReload])

  const handleSelectAll = () => {
    const newChecked = transactions.map(transaction => transaction.transaction_id)
    setChecked(newChecked)

    if(checked.length === transactions.length) {
      setChecked([])
    }
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const amounts = []
    checked.map(id => {
      transactions.map(transaction => {
        if(transaction.transaction_id === id){
          amounts.push(transaction.amount)
        }
      })
    })

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

  const converter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

  return (
    <>
      <p className="mt-2">Transactions:</p>
      {
        loading ? <Skeleton variant="rectangle" sx={{borderRadius: '1rem'}}>
                    <div className="p-5">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Doloribus nulla eos accusantium sit inventore ab dolorem hic repellendus accusamus ad, aliquid ipsum explicabo quis rerum dolor incidunt aut, sed sequi!</div>
                  </Skeleton>
                : <Card sx={{borderRadius: '8px', backgroundColor: '#FFD800'}}>
                    {
                      transactions.length > 0 ? <CardHeader title={`${checked.length} selected`} sx={{paddingBottom:'0'}} avatar={
                                                  <Checkbox checked={checked.length === transactions.length} indeterminate={checked.length !== transactions.length && checked.length > 0}
                                                   onClick={handleSelectAll} />
                                                 } titleTypographyProps={{style:{fontSize:'16px'}}} />
                                              : <></>
                    }
                    <CardContent>
                      {
                        transactions.length > 0 ? <List className="track-transactions-list">
                                                    {
                                                      transactions.map(transaction => {
                                                        const {account_id, amount, category, date, iso_currency_code,
                                                              name, transaction_id} = transaction

                                                        return (
                                                          <ListItem key={transaction_id} secondaryAction={
                                                            <div>{converter.format(amount * -1)}</div>
                                                           } sx={{
                                                            background: 'white', borderRadius: '1rem', marginBottom: '0.5rem',
                                                            boxShadow: 'rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px'
                                                           }} disablePadding>
                                                            <ListItemButton disabled={submitting} onClick={() => handleCheckbox(transaction_id)}>
                                                              <ListItemIcon>
                                                                <Checkbox edge='start' checked={checked.indexOf(transaction_id) !== -1}
                                                                 disableRipple />
                                                              </ListItemIcon>
                                                              <ListItemText primary={name} secondary={
                                                                <span className="d-block">
                                                                  {dayjs(date).format('MMMM D, YYYY')}
                                                                  <TransactionInfo account_id={account_id} />
                                                                </span>
                                                               } />
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

                          <LoadingButton loading={submitting} type="submit" className='mb-5'
                            variant="contained" sx={{ color: 'white', textTransform: 'none',
                            }} loadingPosition="start"
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


function TransactionInfo({account_id}) {
  const [loading, setLoading] = useState(true)
  const [accountName, setAccountName] = useState(null)

  useEffect(() => {
    if (loading) {
      const idArr = account_id.split(' ')

      if(idArr[idArr.length-1] === '(custom)') {
        setAccountName(account_id)
        setLoading(false)

      } else {
        fetch(`/api/server/accounts/${account_id}`)
          .then(res => res.json())
          .then(info => {
            setAccountName(info.name)
            setLoading(false)
          })
          .catch(error => {
            window.alert(error)
            console.error(error)
          })
      }
    }
  },[loading, account_id])

  return (
    <>
      {
        loading ? <Skeleton variant="rectangle" sx={{ borderRadius: '1rem' }}>
                    <span>Checking account</span>
                  </Skeleton>
                : <span className="d-block">{accountName}</span>
      }
    </>
  )
}
