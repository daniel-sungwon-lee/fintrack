import { Button, TextField } from "@mui/material"

export default function Auth () {

  const handleLogin = (e) => {
    e.preventDefault()
  }

  return (
    <>
      <div className="container">

        <form className="d-flex flex-column align-items-center" onSubmit={handleLogin}>
          <TextField id="email" required variant="standard" label="Email"></TextField>
          <TextField id="password" required variant="standard" label="Password"></TextField>
          <Button variant="contained" style={{color: '#00C169'}}>Login</Button>
        </form>

      </div>
    </>
  )
}
