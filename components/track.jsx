import { AddchartRounded, CloseRounded } from "@mui/icons-material"
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
         Fab, Slide, Zoom } from "@mui/material"
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
              <div className="d-flex justify-content-center align-items-center my-5" style={{minHeight: '50vh'}}>
                <div className="text-center">
                  <h2 className="mb-3" style={{opacity: '0.7'}}>Such empty...</h2>

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
       onClose={() => setOpen(false)} TransitionComponent={Transition}>
        <DialogTitle>Tracker</DialogTitle>

        <DialogContent>
          <DialogContentText>Time:</DialogContentText>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <StaticDateRangePicker value={value} onChange={(value) => setValue(value)}
             slotProps={{
              shortcuts: {
                items: shortcutsItems,
              },
              actionBar: { actions: [] },
             }} calendars={2} />
          </LocalizationProvider>

        </DialogContent>

        <DialogActions sx={{ position: 'absolute', top: "0.25rem", right: "0.25rem" }}>
          <Fab size='medium' color='error' variant='extended' onClick={() => {
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
