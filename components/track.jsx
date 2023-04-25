import { AddchartRounded } from "@mui/icons-material"
import { Fab, Zoom } from "@mui/material"
import { useEffect, useState } from "react"
import Placeholder from "./placeholder"
import styles from '../styles/Home.module.css'

export default function Track() {
  const [loading, setLoading] = useState(true)

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
                   borderRadius:"2rem"}}>
                    <div className={`${styles.fab} ${styles.font}`} style={{fontSize: '18px'}}>
                      <AddchartRounded style={{marginRight: "0.5rem"}} />
                      Create new tracker
                    </div>
                  </Fab>

                </div>
              </div>
            </Zoom>
      }
    </>
  )
}
