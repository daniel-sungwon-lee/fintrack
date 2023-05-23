import { AddRounded, AddchartRounded, AttachMoneyRounded, BarChartRounded, CloseRounded,
         DeleteRounded, DoneRounded, EditRounded, LockRounded, MoreVertRounded, ReceiptLongRounded }
        from "@mui/icons-material"
import { Alert, Avatar, Box, Card, CardContent, CardHeader, Checkbox, CircularProgress,
         Collapse, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
         Fab, Grow, IconButton, List, ListItem, ListItemAvatar, ListItemButton,
         ListItemIcon, ListItemText, Paper, Skeleton, Slide, Snackbar, SpeedDial,
         SpeedDialAction, SpeedDialIcon, TextField, Tooltip, Zoom } from "@mui/material"
import { useEffect, useState, forwardRef, useRef } from "react"
import dynamic from 'next/dynamic'
const Placeholder = dynamic(() => import('./placeholder'), { ssr: false })
import { StaticDateRangePicker } from "@mui/x-date-pickers-pro"
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
                                                           } title={<TrackerEdit name={name} trackerId={trackerId} userId={userId} setEditModeId={setEditModeId} setOpenSnack2={setOpenSnack2} data={data} setData={setData} />} titleTypographyProps={{ fontSize: '18px' }} action={
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
                                  <div className="d-flex flex-column align-items-start" style={{ width:'calc(100%/3)' }}>
                                    <div className="h6">From: {dayjs(fromDate).format('MMMM D, YYYY')}</div>
                                    <div className="h6">To: {dayjs(toDate).format('MMMM D, YYYY')}</div>
                                  </div>
                                  <ReceiptLottie />
                                  {/* <ReceiptLongRounded color="secondary" fontSize="large" style={{ width: 'calc(100%/3)' }} /> */}
                                  <div className="d-flex align-items-center justify-content-end" style={{ fontSize: '24px', width: 'calc(100%/3)' }}>
                                    {/* Total: {converter.format(total)} */}
                                    <TotalAnimated total={total} totalChange={totalChange} setTotalChange={setTotalChange} userId={userId} trackerId={trackerId} converter={converter} />
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

function ReceiptLottie({}) {
  const lottieRef = useRef()
  return (
    <>
      <Lottie animationData={receiptAnimation} loop={false} lottieRef={lottieRef} className="d-flex justify-content-center align-items-center"
       style={{ width: 'calc(100%/3)' }} onDOMLoaded={() => lottieRef.current.playSegments([0, 220], true)} />
    </>
  )
}
function TotalAnimated({total, totalChange, setTotalChange, userId, trackerId, converter}) {
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
    <div ref={totalRef} className="total" style={{zIndex: '33'}}>
      {
        //skeleton loading here after changing total here?
      }
    </div>
  )
}

function TrackerEdit({name, trackerId, userId, setEditModeId, setOpenSnack2, data, setData}) {
  const [newName, setNewName] = useState(name)
  const [error, setError] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  const handleEdit = async (trackerId, e) => {
    const cardNode = e.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode
    setEditLoading(true)

    await fetch(`/api/server/trackers/${userId}/${trackerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({newName})
    })
      .then(() => {
        const trackerIds = data.map(tracker => tracker.trackerId)
        const idIndex = trackerIds.indexOf(trackerId)
        data[idIndex].name = newName

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
  const [end, setEnd] = useState(false)
  const [speedDialLoading, setSpeedDialLoading] = useState(false)
  const [openSnack, setOpenSnack] = useState(false)
  const [newTotal, setNewTotal] = useState(null)
  const [editModeId, setEditModeId] = useState(null)
  const [openSnack2, setOpenSnack2] = useState(false)
  const [expand, setExpand] = useState(false)
  const [transactionName, setTransactionName] = useState('')
  const [addTransactionLoading, setAddTransactionLoading] = useState(false)
  const [addTransactionError, setAddTransactionError] = useState(false)
  const [transactionDate, setTransactionDate] = useState(dayjs())
  const [transactionAmount, setTransactionAmount] = useState('')
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
      setTransactionName('')
      setAddTransactionLoading(false)
      setAddTransactionError(false)
      setTransactionDate(dayjs())
      setTransactionAmount(0)
    }
  },[loading, end, trackerId, userId, setTotal, expand])

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

          setSpeedDialLoading(false)
          setOpenSnack(true)

          const amounts = newTransactions.map(transaction => parseFloat(transaction.amount) * -1)
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

  const handleAddTransaction = async (e) => {
    e.preventDefault()
    setAddTransactionLoading(true)

    function customTransactionIdGenerator() {
      var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      };
      return ('custom' + S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
    }

    const reqBody = {
      transaction_id: customTransactionIdGenerator(),
      trackerId: trackerId,
      account_id: 'Custom (added)',
      amount: transactionAmount * -1,
      category: 'custom',
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
        setOpenSnack3(true)
        setAddTransactionLoading(false)
        setTransactionName('')
        setTransactionAmount('')
        setTransactionDate(dayjs())
        setTimeout(() => setExpand(false), 300)

        const amounts = transactions.map(transaction => parseFloat(transaction.amount) * -1)
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

  return (
    <>
      <Dialog open={open} TransitionComponent={Transition2} onClose={() => {
        setLoading(true)
        setEnd(false)
        setTransactions(null)
        setTrackerId(null)
        setTrackerName(null)
        setTotal(null)
        setFromDate(null)
        setToDate(null)
        setOpen(false)
        setNewTotal(null)
        setTotalChange(true)
        setEditModeId(null)
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
                              {
                                transactions ? <>
                                                 {
                                                    transactions.map(transaction => {
                                                      const { transaction_id, account_id, amount, category,
                                                              date, iso_currency_code, name } = transaction

                                                      return (
                                                        <ListItem key={transaction_id} id={transaction_id} secondaryAction={
                                                          <div>{converter.format(amount * -1)}</div>
                                                         } sx={{background:'white', borderRadius:'1rem', margin:'0.5rem auto', width: '97%', transition: 'all ease 0.3s',
                                                         boxShadow:'rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px'}}>
                                                          <ListItemAvatar>
                                                            {
                                                              editModeId === transaction_id
                                                                ? <SpeedDial className="invisible" ariaLabel="Options SpeedDial" icon={<SpeedDialIcon icon={<MoreVertRounded />}
                                                                   openIcon={<CloseRounded color="error" />} />} sx={{ position: 'relative', right: '1rem' }}
                                                                   FabProps={{ sx: { boxShadow: 'none !important', background: 'transparent !important' }, disableRipple: true }}
                                                                   direction="down">
                                                                    <SpeedDialAction tooltipTitle='Edit' tooltipPlacement="right" icon={<EditRounded />} onClick={(e) => handleSpeedDial('edit', transaction_id, e)} disabled={false} />
                                                                    <SpeedDialAction tooltipTitle='Delete' tooltipPlacement="right" icon={speedDialLoading ? <CircularProgress color="inherit" size={20} thickness={5} /> : <DeleteRounded color="error" />}
                                                                     onClick={(e) => handleSpeedDial('delete', transaction_id, e)} FabProps={{ disabled: speedDialLoading }} />
                                                                  </SpeedDial>
                                                                : <SpeedDial ariaLabel="Options SpeedDial" icon={<SpeedDialIcon icon={<MoreVertRounded />}
                                                                   openIcon={<CloseRounded color="error" />} />} sx={{ position: 'relative', right: '1rem' }}
                                                                   FabProps={{ sx: { boxShadow: 'none !important', background: 'transparent !important' }, disableRipple: true }}
                                                                   direction="down">
                                                                    <SpeedDialAction tooltipTitle='Edit' tooltipPlacement="right" icon={<EditRounded />} onClick={(e) => handleSpeedDial('edit', transaction_id, e)} disabled={false} />
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
                                                    })
                                                 }
                                               </>
                                             : <></>

                              }
                              <ListItem className="d-flex flex-column">
                                <Collapse in={expand} timeout='auto' sx={{width: '100%', background: 'white', borderRadius: '1rem'}}>
                                  <form onSubmit={handleAddTransaction}>
                                    <ListItemText sx={{padding: '1rem'}} primary={
                                      <div className="d-flex justify-content-between">
                                        <TextField value={transactionName} type="name" id="name" required disabled={addTransactionLoading}
                                          variant="standard" label="Transaction name" onChange={(e) => setTransactionName(e.target.value)}
                                          InputLabelProps={{ required: false }} error={addTransactionError} sx={{ marginBottom: '0.5rem' }}
                                          helperText={addTransactionError ? 'Please try again' : 'Ex: Aesop'} />

                                        <TextField value={transactionAmount} type="currency" id="amount" required disabled={addTransactionLoading}
                                          variant="standard" label="Transaction amount" onChange={(e) => setTransactionAmount(e.target.value)}
                                          InputLabelProps={{ required: false }} error={addTransactionError} InputProps={{inputComponent: NumericFormatCustom}}
                                          helperText={addTransactionError ? 'Please try again' : ''} placeholder="$0" />
                                      </div>
                                      } secondary={
                                      <div className="d-flex justify-content-between">
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                          <DatePicker label='Transaction date' value={transactionDate} onChange={(newValue) => setTransactionDate(newValue)}
                                          slotProps={{textField: {variant: 'standard', error: addTransactionError, helperText: addTransactionError ? 'Please try again' : '',
                                          required: true, InputLabelProps: {required: false}}}} disabled={addTransactionLoading} />
                                        </LocalizationProvider>

                                        <LoadingButton loading={addTransactionLoading} type="submit" sx={{
                                          top: '0.65rem', left: '0.25rem', textTransform: 'none' }}
                                          loadingPosition="start" startIcon={<DoneRounded />}>
                                          Submit
                                        </LoadingButton>
                                      </div>
                                      } />
                                  </form>
                                </Collapse>
                                <ListItemButton className="d-flex justify-content-center" disabled={addTransactionLoading}
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
          <Fab size='medium' color='error' variant='extended' onClick={() => {
            setLoading(true)
            setEnd(false)
            setTransactions(null)
            setTrackerId(null)
            setTrackerName(null)
            setTotal(null)
            setFromDate(null)
            setToDate(null)
            setOpen(false)
            setNewTotal(null)
            setTotalChange(true)
            setEditModeId(null)
            setExpand(false)
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
          <Alert variant="filled" color="error" sx={{ width: '100%', color: 'white' }}
            onClose={handleSnackClose}>
            Transaction deleted
          </Alert>
        </Snackbar>
        <Snackbar open={openSnack2} autoHideDuration={3333} onClose={handleSnackClose2}
          TransitionComponent={TransitionLeft}>
          <Alert variant="filled" color="primary" sx={{ width: '100%', color: 'white' }}
            onClose={handleSnackClose2}>
            Transaction updated
          </Alert>
        </Snackbar>
        <Snackbar open={openSnack3} autoHideDuration={3333} onClose={handleSnackClose3}
          TransitionComponent={TransitionLeft}>
          <Alert variant="filled" color="primary" sx={{ width: '100%', color: 'white' }}
            onClose={handleSnackClose3}>
            Transaction added
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
                setTransactions(transactionsArr)
                setLoading(false)
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
          amounts.push(transaction.amount * -1)
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
      if(account_id === 'Custom (added)') {
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
