import { useEffect, useState } from "react"
import Placeholder from "./placeholder"
import { Button, Collapse, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Zoom } from "@mui/material"
import { AddRounded, ArrowDropDownRounded, ArrowDropUpRounded, ArrowRightRounded } from "@mui/icons-material"

export default function Budget({userId}) {
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if(loading) {
      setLoading(false)
    }

  },[loading])

  return (
    <>
      {
        loading ? <Placeholder />
                : <Zoom in timeout={300}>
                    <div className="d-flex flex-column justify-content-center align-items-center"
                     style={{minHeight: '50vh', marginBottom: '7rem'}}>

                      <div className="h2 w-100 mb-0" style={{fontWeight: 'bold', marginTop: '2rem'}}>
                        Frequency
                      </div>

                      <TableContainer component={Paper} sx={{
                       minWidth: '80%', margin: '2.5rem 0rem 0rem', borderRadius: '8px',
                       backgroundColor: '#ffe6c6', padding: '1rem'}}>
                        <Table>
                          <TableHead sx={{backgroundColor: 'white'}}>
                            <TableRow>
                              <TableCell padding="checkbox" sx={{border: 'none', borderRadius: '0.75rem 0 0 0.75rem'}}>
                                <IconButton disabled>
                                  <ArrowDropDownRounded sx={{visibility: 'hidden'}} />
                                </IconButton>
                              </TableCell>
                              <TableCell padding="none">Category</TableCell>
                              <TableCell>Projected</TableCell>
                              <TableCell>Actual</TableCell>
                              <TableCell sx={{borderRadius: '0 0.75rem 0.75rem 0'}}>Available</TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            <TableRow role='button' onClick={()=>setOpen(!open)}>
                              <TableCell padding="checkbox">
                                <IconButton onClick={()=>setOpen(!open)} disabled sx={{color: '#0000008a !important'}}>
                                  {
                                    open ? <ArrowDropDownRounded /> : <ArrowRightRounded />
                                  }
                                </IconButton>
                              </TableCell>
                              <TableCell padding="none">Bills</TableCell>
                              <TableCell>$3333</TableCell>
                              <TableCell>$1342</TableCell>
                              <TableCell>$1991</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell padding="none" colSpan={5}>
                                <Collapse in={open} timeout='auto'>
                                  <div>
                                    <Table sx={{borderRadius: '1rem', backgroundColor: 'white'}}>
                                      <TableBody>
                                        <TableRow>
                                          <TableCell padding="checkbox">
                                            <IconButton disabled>
                                              <ArrowDropDownRounded sx={{ visibility: 'hidden' }} />
                                            </IconButton>
                                          </TableCell>
                                          <TableCell padding="none">Rent</TableCell>
                                          <TableCell>$1000</TableCell>
                                          <TableCell>$1000</TableCell>
                                          <TableCell>0</TableCell>
                                        </TableRow>

                                        <TableRow>
                                          <TableCell colSpan={5} sx={{padding: '8px'}} align="center">
                                            <Tooltip title='Add sub-category' slotProps={{
                                              popper:{modifiers:[{name: 'offset', options:{offset: [0,-7]}}]}
                                             }}>
                                              <IconButton>
                                                <AddRounded />
                                              </IconButton>
                                            </Tooltip>
                                          </TableCell>
                                        </TableRow>
                                      </TableBody>
                                    </Table>
                                  </div>
                                </Collapse>
                              </TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell colSpan={5} align="center">
                                <Button startIcon={<AddRounded />}>Add category</Button>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>

                    </div>
                  </Zoom>
      }
    </>
  )
}
