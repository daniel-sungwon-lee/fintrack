import { AccountBalanceRounded } from "@mui/icons-material"
import { Fab, Zoom } from "@mui/material"
import { useEffect, useState } from "react"
import Placeholder from "./placeholder"
import styles from '../styles/Home.module.css'

export default function Overview() {
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
            <Zoom in>
              <div className="d-flex justify-content-center align-items-center"
               style={{minHeight: '50vh'}}>

                <Fab variant="extended" size="large" color="primary"
                 sx={{padding: '2rem', borderRadius: '2rem'}}>
                  <div className={styles.fab} style={{fontSize: '20px'}}>
                    <AccountBalanceRounded style={{ marginRight: "0.5rem" }} />
                    Connect bank account
                  </div>
                </Fab>

              </div>
            </Zoom>
      }
    </>
  )
}
