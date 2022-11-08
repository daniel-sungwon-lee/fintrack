import { Button, TextField } from "@mui/material"
import Image from "next/image"

export default function Auth () {

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
          <TextField className="mb-3" id="email" required variant="standard" label="Email" InputLabelProps={{required: false}}></TextField>
          <TextField className="mb-5" id="password" required variant="standard" label="Password" InputLabelProps={{required: false}}></TextField>
          <Button type="submit" className="mb-5" variant="contained" sx={{backgroundColor: "#00C169"}}>Login</Button>
        </form>

      </div>
    </>
  )
}
