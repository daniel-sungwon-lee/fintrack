import { Button, CircularProgress, Link, TextField } from "@mui/material";
import { LoadingButton } from '@mui/lab';
import Image from "next/image";
import { useState } from "react";

export default function Auth ({handleLoginRoot}) {
  const [page, setPage] = useState('login')
  const [error, setError] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorText, setErrorText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { id, value } = e.target

    if (id === "email") {
      setEmail(value)
    } else if (id === "password") {
      setPassword(value)
    }

    if(value.length === 0) {
      setError(false)
      setErrorText('')
    }
  }

  const handleSwitch = () => {
    if (page === "login") {
      setPage("signup")
      setEmail("")
      setPassword("")
      setError(false)
      setErrorText("")

    } else {
      setPage("login")
      setEmail("")
      setPassword("")
    }
  }

  const handleSignUp = (e) => {
    e.preventDefault()

    setLoading(true)

    const reqBody = { email, password }

    fetch('/api/server/signup', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody)
    })
      .then(() => {
        setPage("login")
        setLoading(false)
      })
      .catch((error) => {
        console.error(error)
        setError(true)
        setErrorText('Please try again')
        setLoading(false)
      })
  }

  const handleLogin = (e) => {
    e.preventDefault()

    setLoading(true)

    const reqBody = { email, password }

    fetch('/api/server/login', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody)
    })
      .then(res => res.json())
      .then(result => {
        if (result.error) {
          setError(true)
          setErrorText(result.error)
          setLoading(false)
        }

        if (result.token && result.user) {
          handleLoginRoot(result)
          setLoading(false)
        }
      })
      .catch((error) => {
        console.error(error)
        setError(true)
        setErrorText('Please try again')
        setLoading(false)
      })
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

          <form className="d-flex flex-column align-items-center mx-5 mt-5" onSubmit={handleLogin}>
            <TextField value={email} type="email" className="mb-3" id="email" required
              variant="standard" label="Email" onChange={handleChange} InputLabelProps={{required: false}} error={error}
              helperText={errorText} />

            <TextField value={password} type="password" className="mb-5" id="password" required
              variant="standard" label="Password" onChange={handleChange} InputLabelProps={{required: false}} error={error}
              helperText={errorText} />

            <LoadingButton loading={loading} type="submit" className="mb-5"
              variant="contained" sx={{color: 'white'}}>
              Login
            </LoadingButton>
          </form>

          <div className="d-flex flex-column justify-content-center">
            <h4 className="text-center">Don't have an account?</h4>
            <div className="d-flex justify-content-center">
              <Link onClick={handleSwitch} href="#" underline="none">Sign up</Link>
            </div>
          </div>

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

          <form className="d-flex flex-column align-items-center mx-5 mt-5" onSubmit={handleSignUp}>
            <TextField value={email} type="email" className="mb-3" id="email" required
              variant="standard" label="Email" onChange={handleChange} InputLabelProps={{ required: false }} error={error}
              helperText={errorText} />

            <TextField value={password} type='password' className="mb-5" id="password"
              required variant="standard" label="Password" onChange={handleChange} InputLabelProps={{ required: false }} error={error}
              helperText={errorText} />

            <LoadingButton loading={loading} type="submit" className="mb-5"
              variant="contained" sx={{color:'white'}}>
              Sign up
            </LoadingButton>
          </form>

          <div className="d-flex flex-column justify-content-center">
            <div className="d-flex justify-content-center">
              <Link onClick={handleSwitch} href="#" underline="none">Return to login</Link>
            </div>
          </div>

        </div>
      </>
    )
  }

}
