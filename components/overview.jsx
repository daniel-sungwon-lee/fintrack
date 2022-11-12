import { useState } from "react"
import Placeholder from "./placeholder"

export default function Overview() {
  const [loading, setLoading] = useState(true)

  return (
    <>
      {
        loading
          ? <Placeholder />
          :
            <div>
              Home!
            </div>
      }
    </>
  )
}
