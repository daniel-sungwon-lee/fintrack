import { useEffect, useState } from "react"
import Placeholder from "./placeholder"
import { Box, Button, CircularProgress, Collapse, Fab, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Zoom } from "@mui/material"
import { AddCardRounded, AddRounded, ArrowDropDownRounded, ArrowDropUpRounded, ArrowRightRounded, PostAddRounded } from "@mui/icons-material"

export default function Budget({userId}) {
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if(loading) {
      setLoading(false)
      setReady(true)
    }

  },[loading])

  return (
    <>
      {
        loading ? <Placeholder />
                : <Zoom in timeout={300}>
                    <div className="d-flex flex-column justify-content-center align-items-center"
                     style={{minHeight: '50vh', marginBottom: '7rem'}}>

                      <div className="w-100" style={{marginBottom: '5rem'}}>
                        <div className="h2 w-100 mb-0" style={{fontWeight: 'bold', marginTop: '2.25rem'}}>
                          Frequency
                        </div>

                        <TableContainer component={Paper} sx={{
                        minWidth: '80%', margin: '2rem 0rem 0rem', borderRadius: '8px',
                        backgroundColor: '#ffe6c6', padding: '1rem'}}>
                          <Table>
                            <TableHead sx={{backgroundColor: '#00c169'}}>
                              <TableRow>
                                <TableCell padding="checkbox" sx={{borderRadius: '0.75rem 0 0 0.75rem'}}>
                                  <IconButton disabled>
                                    <ArrowDropDownRounded sx={{visibility: 'hidden'}} />
                                  </IconButton>
                                </TableCell>
                                <TableCell padding="none" sx={{color: 'white'}}>Category</TableCell>
                                <TableCell align="right" sx={{color: 'white'}}>Projected</TableCell>
                                <TableCell align="right" sx={{color: 'white'}}>Actual</TableCell>
                                <TableCell align="right" sx={{borderRadius: '0 0.75rem 0.75rem 0', color: 'white'}}>Available</TableCell>
                              </TableRow>
                            </TableHead>

                            <TableBody>
                              <TableRow role='button' onClick={()=>setOpen(!open)}>
                                <TableCell padding="checkbox">
                                  <IconButton disabled sx={{color: '#0000008a !important'}}>
                                    {
                                      open ? <ArrowDropDownRounded /> : <ArrowRightRounded />
                                    }
                                  </IconButton>
                                </TableCell>
                                <TableCell padding="none">Bills</TableCell>
                                <TableCell align="right">$3333</TableCell>
                                <TableCell align="right">$1342</TableCell>
                                <TableCell align="right">$1991</TableCell>
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
                                            <TableCell align="right">$1000</TableCell>
                                            <TableCell align="right">$1000</TableCell>
                                            <TableCell align="right">$0</TableCell>
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

                      <Fab variant="extended" size="medium" color="primary"
                       sx={{padding: '1.5rem', borderRadius: '2rem'}} disabled={!ready}>
                        <Box className='d-flex align-items-center' sx={{
                          fontSize: '18px', textTransform: 'none', lineHeight: 1,
                          color: 'white'
                         }}>
                          {
                            ready ? <>
                                      <AddCardRounded style={{marginRight: '0.5rem'}} />
                                      Create new budget
                                    </>
                                  : <>
                                      <CircularProgress color="inherit" size={25}
                                       sx={{marginRight: '1rem'}} thickness={5} />
                                      Loading...
                                    </>
                          }
                        </Box>
                      </Fab>

                    </div>
                  </Zoom>
      }
    </>
  )
}
