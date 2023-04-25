import { AddchartRounded, CloseRounded } from "@mui/icons-material"
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
         Fab, Slide, Zoom } from "@mui/material"
import { useEffect, useState, forwardRef } from "react"
import Placeholder from "./placeholder"
import styles from '../styles/Home.module.css'

export default function Track() {
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setLoading(false)
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

function TrackDialog({open, setOpen}) {

  return (
    <>
      <Dialog fullScreen closeAfterTransition keepMounted open={open}
       onClose={() => setOpen(false)} TransitionComponent={Transition}>
        <DialogTitle>Tracker</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Time Range:
          </DialogContentText>

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
