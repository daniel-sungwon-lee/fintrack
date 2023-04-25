import { Button, CircularProgress, Collapse, Zoom, Link, TextField, FormControl,
         InputLabel, Input, InputAdornment, IconButton } from "@mui/material";
import { LoadingButton } from '@mui/lab';
import Image from "next/image";
import { useEffect, useState } from "react";
import { VisibilityRounded, VisibilityOffRounded } from "@mui/icons-material";
import styles from '../styles/Home.module.css'

export default function Auth ({ setUser }) {
  const [page, setPage] = useState('login')
  const [error, setError] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [loading, setLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    const collapseTimeout = setTimeout(() => setShowLogin(true), 300)
  })

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
      setShowPassword(false)

    } else {
      setPage("login")
      setEmail("")
      setPassword("")
      setShowPassword(false)
    }
  }

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
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
          const { user, token } = result

          setUser(user)
          window.localStorage.setItem("finTrackUserToken", token)

          if (window.localStorage.getItem("finTrackUserToken")) {
            window.location.pathname = "/"
          }
        }
      })
      .catch((error) => {
        console.error(error)
        setError(true)
        setErrorText('Please try again')
        setLoading(false)
      })
  }

  const handleAutoFill = (e) => {
    e.preventDefault();
    setEmail('hello@there')
    setPassword('obiwankenobi')
  }

  if(page==="login") {
    return (
      <Collapse in={showLogin} collapsedSize={0}>
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
              sx={{width: '195px'}} />

            <TextField
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handleChange}
              InputProps={{
                endAdornment:
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                    >
                      {showPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
                    </IconButton>
                  </InputAdornment>
              }}
              InputLabelProps={{ required: false }}
              className='mb-5'
              required
              error={error}
              helperText={errorText}
              variant="standard"
              sx={{width: '195px'}}
            />

            <LoadingButton loading={loading} type="submit" className={`mb-5 ${styles.font}`}
              variant="contained" sx={{color: 'white'}}>
              Login
            </LoadingButton>
          </form>

          <div className="d-flex flex-column justify-content-center">
            <h4 className="text-center">Don't have an account?</h4>
            <div className="d-flex justify-content-center">
              <Link onClick={handleSwitch} href="#" underline="none">Sign up</Link>
              <Link sx={{marginLeft: '2rem'}} onClick={handleAutoFill} href="#" underline="none">Demo</Link>
            </div>
          </div>

        </div>
      </Collapse>
    )
  } else {
    return (
      <Zoom in timeout={300}>
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
              helperText={errorText} sx={{width: '195px'}} />

            <FormControl variant="standard" sx={{ width: '195px' }}>
              <InputLabel>Password</InputLabel>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handleChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                    >
                      {showPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
                    </IconButton>
                  </InputAdornment>
                }
                className='mb-5'
                required
                error={error}
                helperText={errorText}
              />
            </FormControl>

            <LoadingButton loading={loading} type="submit" className={`mb-5 ${styles.font}`}
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
      </Zoom>
    )
  }

}
