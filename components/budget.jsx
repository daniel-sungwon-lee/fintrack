import { useEffect, useState } from "react"
import Placeholder from "./placeholder"
import { Box, Button, CircularProgress, Collapse, Fab, FormControl, FormControlLabel,
         FormHelperText, FormLabel, IconButton, Paper, Radio, RadioGroup, Table,
         TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
         Tooltip, Zoom } from "@mui/material"
import { AddCardRounded, AddRounded, ArrowDropDownRounded, ArrowDropUpRounded,
         ArrowRightRounded, CloseRounded, CreditCardOffRounded,
         PostAddRounded } from "@mui/icons-material"
import { LoadingButton } from "@mui/lab"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { DateRangePicker, SingleInputDateRangeField } from "@mui/x-date-pickers-pro"
import dayjs from "dayjs"

export default function Budget({userId}) {
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [budgets, setBudgets] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if(loading) {
      fetch(`/api/server/budgets/${userId}`)
        .then(res => res.json())
        .then(data => {
          if(data.length > 0) {
            setBudgets(data)
            setLoading(false)
            setReady(true)

          } else {
            setBudgets(null)
            setLoading(false)
            setReady(true)
          }
        })
    }
  },[userId, loading])

  return (
    <>
      {
        loading ? <Placeholder />
                : <Zoom in timeout={300}>
                    <div className="d-flex flex-column justify-content-center align-items-center"
                     style={{minHeight: '50vh', marginBottom: '7rem'}}>

                      <BudgetTable />

                      <div className="w-100">
                        <Collapse in={open} timeout='auto'>
                          <NewBudget userId={userId} setBudgets={setBudgets}
                           budgets={budgets} open={open} setOpen={setOpen} />
                        </Collapse>
                      </div>

                      <Fab variant="extended" size="medium" color="primary"
                       sx={{padding: '1.5rem', borderRadius: '2rem'}} disabled={!ready}
                       onClick={() => setOpen(!open)}>
                        <Box className='d-flex align-items-center' sx={{
                          fontSize: '18px', textTransform: 'none', lineHeight: 1,
                          color: 'white'
                         }}>
                          {
                            ready ? <>
                                      {
                                        open ? <>
                                                 <CreditCardOffRounded style={{marginRight: '0.5rem'}} />
                                                 Cancel
                                               </>
                                             : <>
                                                 <AddCardRounded style={{marginRight: '0.5rem'}} />
                                                 Create new budget
                                               </>
                                      }
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

function NewBudget({userId, budgets, setBudgets, open, setOpen}) {
  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState('monthly')
  const [dateRange, setDateRange] = useState([dayjs(), dayjs().add(1, 'month')])
  const [addError, setAddError] = useState(false)
  const [addLoading, setAddLoading] = useState(false)

  useEffect(() => {
    if(!open) {
      setName('')
      setFrequency('monthly')
      setDateRange([dayjs(), dayjs().add(1, 'month')])
      setAddError(false)
      setAddLoading(false)
    }
  },[open])

  const handleAddNewBudget = async (e) => {
    e.preventDefault()
    setAddLoading(true)

    const reqBody = {
      userId,
      name,
      frequency,
      fromDate: dayjs(dateRange[0].$d).format('MM/DD/YYYY'),
      toDate: dayjs(dateRange[1].$d).format('MM/DD/YYYY'),
      rows: JSON.stringify({rows: []})
    }

    await fetch('/api/server/budgets', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody)
    })
      .then(res => {
        if(res.status === 201) {
          setOpen(false)

          if (!budgets) {
            setBudgets([reqBody])
          } else {
            setBudgets([...budgets, reqBody])
          }
        } else {
          setAddError(true)
          setAddLoading(false)
        }
      })
      .catch(error => {
        setAddError(true)
        setAddLoading(false)
        window.alert(error)
        console.error(error)
      })
  }

  const handleChange = (e) => {
    if(e.target.type === 'radio') {
      setFrequency(e.target.value)

      if(e.target.value === 'monthly') {
        setDateRange([dayjs(), dayjs().add(1, 'month')])

      } else if(e.target.value === 'weekly') {
        setDateRange([dayjs(), dayjs().add(1, 'week')])

      } else if(e.target.value === 'daily') {
        setDateRange([dayjs(), dayjs().add(1, 'day')])

      } else if(e.target.value === 'yearly') {
        setDateRange([dayjs(), dayjs().add(1, 'year')])
      }
    }
  }

  return (
    <>
      <form className="d-flex flex-column justify-content-center"
       onSubmit={handleAddNewBudget} style={{marginBottom: '2rem'}}>
        <TextField value={name} type="name" id="name" required disabled={addLoading}
          variant="standard" label="Budget name" onChange={(e) => setName(e.target.value)}
          InputLabelProps={{ required: false }} error={addError} sx={{ marginBottom: '1rem' }}
          helperText={addError ? 'Please try again' : 'Ex: Monthly Life Budget'} />

        <FormControl disabled={addLoading} color={addError ? 'error' : 'primary'}>
          <FormLabel focused>Frequency</FormLabel>
          <RadioGroup value={frequency} onChange={handleChange} row>
            <FormControlLabel value='monthly' control={<Radio />} label='Monthly' />
            <FormControlLabel value='weekly' control={<Radio />} label='Weekly' />
            <FormControlLabel value='daily' control={<Radio />} label='Daily' />
            <FormControlLabel value='yearly' control={<Radio />} label='Yearly' />
          </RadioGroup>
          <FormHelperText error={addError} sx={{marginLeft: '0', marginBottom: '1rem'}}>
            {
              addError ? <>Please try again</>
                       : <span className="invisible">This month</span>
            }
          </FormHelperText>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateRangePicker label='Date range' slots={{ field: SingleInputDateRangeField }}
            calendars={1} value={dateRange} disablePast minDate={dateRange[0]} maxDate={dateRange[1]}
            onChange={(newValue) => setDateRange(newValue)} disabled
            slotProps={{
              textField: {variant: 'standard', error: addError, inputProps: {style: {cursor: 'inherit'}},
              helperText: addError ? 'Please try again' : 'Read-only (fixed, depending on frequency)'}
            }} />
        </LocalizationProvider>

        <div className="d-flex justify-content-center mb-5" style={{marginTop: '4rem'}}>
          <LoadingButton loading={addLoading} type="submit" sx={{textTransform: 'none', color: 'white'}}
           loadingPosition="start" variant='contained' startIcon={<AddRounded />}>
            Add
          </LoadingButton>
        </div>
      </form>
    </>
  )
}

function BudgetTable({budgetId}) {
  const [expand, setExpand] = useState(true)
  const [category, setCategory] = useState('')
  const [projected, setProjected] = useState(0)
  const [actual, setActual] = useState(0)
  const [addLoading, setAddLoading] = useState(false)

  useEffect(() => {

  })

  const handleAddRow = (e) => {
    e.preventDefault()

    function customIdGenerator() {
      var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      };
      return ('row' + S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
    }

    const newRow = {
      budgetId,
      rowId: customIdGenerator(),
      category,
      projected,
      actual,
      remaining: projected - actual,
      type: undefined,
    }

  }

  return (
    <>
      <div className="w-100" style={{ marginBottom: '5rem' }}>
        <div className="h2 w-100 mb-0" style={{ fontWeight: 'bold', marginTop: '2.25rem' }}>
          Frequency
        </div>

        <TableContainer component={Paper} sx={{
          minWidth: '80%', margin: '2rem 0rem 0rem', borderRadius: '8px',
          backgroundColor: '#ffe6c6', padding: '1rem'
         }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#00c169' }}>
              <TableRow sx={{ backgroundColor: '#00c169' }}>
                <TableCell padding="checkbox" sx={{ borderRadius: '0.75rem 0 0 0.75rem' }}>
                  <IconButton disabled>
                    <ArrowDropDownRounded sx={{ visibility: 'hidden' }} />
                  </IconButton>
                </TableCell>
                <TableCell padding="none" sx={{ color: 'white' }}>Category</TableCell>
                <TableCell align="right" sx={{ color: 'white' }}>Projected</TableCell>
                <TableCell align="right" sx={{ color: 'white' }}>Actual</TableCell>
                <TableCell align="right" sx={{ borderRadius: '0 0.75rem 0.75rem 0', color: 'white' }}>Remaining</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>

              <TableRow role='button' onClick={() => setExpand(!expand)}>
                <TableCell padding="checkbox">
                  <IconButton disabled sx={{ color: '#0000008a !important' }}>
                    {
                      expand ? <ArrowDropDownRounded /> : <ArrowRightRounded />
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
                  <Collapse in={expand} timeout='auto'>
                    <div>
                      <Table sx={{ borderRadius: '1rem', backgroundColor: 'white' }}>
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
                            <TableCell colSpan={5} sx={{ padding: '8px' }} align="center">
                              <Tooltip title='Add category' slotProps={{
                                popper: { modifiers: [{ name: 'offset', options: { offset: [0, -7] } }] }
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
                  <Button startIcon={<AddRounded />}>Add category group</Button>
                </TableCell>
              </TableRow>
            </TableBody>

          </Table>
        </TableContainer>
      </div>
    </>
  )
}
