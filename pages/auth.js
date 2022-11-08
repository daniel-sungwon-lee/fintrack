import { Button, TextField } from "@mui/material"
import Image from "next/image"
import { useState } from "react"

export default function Auth () {
  const [error, setError] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleChange = (e) => {
    const { id, value } = e.target

    if (id === "email") {
      setEmail(value)
    } else {
      setPassword(value)
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
  }

  return (
    <>
      <div className="container">

      <div className="d-flex flex-column align-items-center m-5">
        <h1 className="mb-2">
          FinTrack
        </h1>
        <h5>A finance tracking app</h5>
      </div>

      <div className="d-flex justify-content-center m-5">
        <Image draggable='false' src="/images/money.svg" alt="FinTrack Logo" width={'500'} height={'300'} />
      </div>

        <form className="d-flex flex-column align-items-center m-5" onSubmit={handleLogin}>
          <TextField value={email} className="mb-3" id="email" required variant="standard" label="Email" onChange={handleChange} InputLabelProps={{required: false}} error={error}></TextField>
          <TextField value={password} className="mb-5" id="password" required variant="standard" label="Password" onChange={handleChange} InputLabelProps={{required: false}} error={error}></TextField>
          <Button type="submit" className="mb-5" variant="contained" sx={{backgroundColor: "#00C169"}}>Login</Button>
        </form>

      </div>
    </>
  )
}
