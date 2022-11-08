import { Button } from '@mui/material'
import { useState } from 'react'

export default function Deets ({visible}) {
    const [loading, setLoading] = useState(true)

    return (
        <>
            {
                visible ? (
                    <div>Fuck You</div>
                )
                : <div>nevemind</div>
            }
            <div >Hello, World!</div>
            <Button variant='contained' sx={{color: "black"}} >Fuck Me</Button>
        </>
    )
}
