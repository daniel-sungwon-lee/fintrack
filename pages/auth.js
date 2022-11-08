import { Button, TextField } from "@mui/material"
import Image from "next/dist/client/image"

export default function Auth () {

  const handleLogin = (e) => {
    e.preventDefault()
  }

  return (
    <>
      <div className="container">

      <div className="d-flex justify-content-center m-5">
        <Image src="/images/money.svg" alt="FinTrack Logo" width='25%' />
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
