import { useState } from "react"
import Placeholder from "./placeholder"

export default function Track() {
  const [loading, setLoading] = useState(true)

  return (
    <>
      {
        loading
          ? <Placeholder />
          :
            <div>
              Tracking...
            </div>
      }
    </>
  )
}
