import { Button, TextField } from "@mui/material"
import Image from "next/image"
import { useState } from "react"

export default function Auth (props) {
  const [page, setPage] = useState('login')
  const [error, setError] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorText, setErrorText] = useState('')

  const handleChange = (e) => {
    const { id, value } = e.target

    if (id === "email") {
      setEmail(value)
    } else {
      setPassword(value)
    }
  }

  const handleSwitch = () => {
    if (page === "login") {
      setPage("signup")
      setEmail("")
      setPassword("")
      setError(false)
      setErrText("")

    } else {
      setPage("login")
      setEmail("")
      setPassword("")
    }
  }

  const handleSignUp = (e) => {
    e.preventDefault()

    const reqBody = { email, password }

    fetch('/api/signup', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody)
    })
      .then(() => {
        setPage("login")
      })
      .catch(() => window.location.reload())
  }

  const handleLogin = (e) => {
    e.preventDefault()

    const reqBody = { email, password }

    fetch('/api/login', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody)
    })
      .then(res => res.json())
      .then(result => {
        if (result.error) {
          setError(true)
          setErrText(result.error)
        }

        if (result.token && result.user) {
          props.handleLogin(result)
        }
      })
      .catch(() => window.location.reload())
  }

  if(page==="login") {
    return (
      <>
        <div className="container">

        <div className="d-flex flex-column align-items-center m-5 text-center">
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
  } else {
    return (
      <>
        <div className="container">

          <div className="d-flex flex-column align-items-center m-5">
            <h1 className="mb-2">
              Create a new FinTrack account
            </h1>
            <h5>And start tracking your finances!</h5>
          </div>

          <div className="d-flex justify-content-center m-5">
            <Image draggable='false' src="/images/money.svg" alt="FinTrack Logo" width={'500'} height={'300'} />
          </div>

          <form className="d-flex flex-column align-items-center m-5" onSubmit={handleLogin}>
            <TextField value={email} className="mb-3" id="email" required variant="standard" label="Email" onChange={handleChange} InputLabelProps={{ required: false }} error={error}></TextField>
            <TextField value={password} className="mb-5" id="password" required variant="standard" label="Password" onChange={handleChange} InputLabelProps={{ required: false }} error={error}></TextField>
            <Button type="submit" className="mb-5" variant="contained" sx={{ backgroundColor: "#00C169" }}>Login</Button>
          </form>

        </div>
      </>
    )
  }

}
