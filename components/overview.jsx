import { Zoom } from "@mui/material"
import { useEffect, useState } from "react"
import Placeholder from "./placeholder"

import Link from './plaid/link.tsx'

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

                <Link />

              </div>
            </Zoom>
      }
    </>
  )
}
