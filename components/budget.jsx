import { useEffect, useMemo, useState } from "react"
import Placeholder from "./placeholder"
import { Box, Button, CircularProgress, Collapse, Fab, FormControl, FormControlLabel,
         FormHelperText, FormLabel, IconButton, Paper, Radio, RadioGroup, Skeleton, Table,
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
import TablePlaceholder from "./tablePlaceholder"

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

                      <>
                        {
                          budgets ? <>
                                      {
                                        budgets.map(budget => {
                                          const {budgetId, userId, name, frequency,
                                            fromDate, toDate, rows
                                          } = budget

                                          return (
                                            <BudgetTable key={budgetId} budgetId={budgetId}
                                             userId={userId} name={name} frequency={frequency}
                                             fromDate={fromDate} toDate={toDate} rows={rows} />
                                          )
                                        })
                                      }
                                    </>
                                  : <div className="w-100 text-center">
                                      {
                                        open ? <></>
                                             : <h2 className="mb-3" style={{opacity: '0.7'}}>
                                                 Much empty...
                                               </h2>
                                      }
                                    </div>
                        }
                      </>

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
      rows: JSON.stringify({rows: [], new: true})
    }

    await fetch('/api/server/budgets', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody)
    })
      .then(async res => {
        if(res.status === 201) {
          await fetch(`/api/server/budgets/${userId}`)
            .then(res => res.json())
            .then(data => {
              setOpen(false)

              if (!budgets) {
                setBudgets([data[0]])
              } else {
                setBudgets([...budgets, data[0]])
              }
            })
            .catch(error => {
              setAddError(true)
              setAddLoading(false)
              window.alert(error)
              console.error(error)
            })

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

function BudgetTable({budgetId, userId, name, frequency, fromDate, toDate, rows}) {
  const [loading, setLoading] = useState(true)
  const [tableRows, setTableRows] = useState(rows.rows)
  const [category, setCategory] = useState('')
  const [projected, setProjected] = useState(0)
  const [actual, setActual] = useState(0)
  const [addLoading, setAddLoading] = useState(false)

  const customIdGenerator = () => {
    var S4 = function () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return ('row' + S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
  }

  useEffect(() => {
    const defaultTableRows = [
      {
        budgetId,
        rowId: "row564000212156bae63c0a82b1a1ebf855",
        category: 'Bills',
        projected: 3000,
        actual: 1860,
        remaining: 1140,
        type: 'group',
        groupId: null
      },
      {
        budgetId,
        rowId: "row6567643dc469af2a5c73935524e087be",
        category: 'Fun',
        projected: 500,
        actual: 180,
        remaining: 320,
        type: 'group',
        groupId: null
      },
      {
        budgetId,
        rowId: "row64adc7c62c3b49892e1f71000d7fb185",
        category: 'Food',
        projected: 1000,
        actual: 345,
        remaining: 655,
        type: 'group',
        groupId: null
      },
      {
        budgetId,
        rowId: customIdGenerator(),
        category: 'Groceries',
        projected: 300,
        actual: 145,
        remaining: 155,
        type: 'category',
        groupId: "row64adc7c62c3b49892e1f71000d7fb185"
      },
      {
        budgetId,
        rowId: customIdGenerator(),
        category: 'Thrifting',
        projected: 100,
        actual: 0,
        remaining: 100,
        type: 'category',
        groupId: "row6567643dc469af2a5c73935524e087be"
      },
      {
        budgetId,
        rowId: customIdGenerator(),
        category: 'Rent',
        projected: 2000,
        actual: 2000,
        remaining: 0,
        type: 'category',
        groupId: "row564000212156bae63c0a82b1a1ebf855"
      },
      {
        budgetId,
        rowId: customIdGenerator(),
        category: 'Utilities',
        projected: 200,
        actual: 45,
        remaining: 155,
        type: 'category',
        groupId: "row564000212156bae63c0a82b1a1ebf855"
      },
      {
        budgetId,
        rowId: customIdGenerator(),
        category: 'Shopping',
        projected: 200,
        actual: 156,
        remaining: 44,
        type: 'category',
        groupId: "row6567643dc469af2a5c73935524e087be"
      },
      {
        budgetId,
        rowId: customIdGenerator(),
        category: 'Subscriptions',
        projected: 6,
        actual: 6,
        remaining: 0,
        type: 'category',
        groupId: "row564000212156bae63c0a82b1a1ebf855"
      }
    ]

    if(rows.new && tableRows.length === 0) {
      //setting default table rows (if no rows)
      fetch(`/api/server/budgets/${userId}/${budgetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultRows: { rows: defaultTableRows, new: false } })
      })
        .then(res => {
          setTableRows(defaultTableRows)
          setLoading(false)
        })
        .catch(error => {
          window.alert(error)
          console.error(error)
        })

    } else {
      setLoading(false)
    }

  },[budgetId, rows, tableRows, userId])

  const handleAddRowGroup = (e) => {
    e.preventDefault()
    setAddLoading(true)

    const newRow = {
      budgetId,
      rowId: customIdGenerator(),
      category,
      projected,
      actual,
      remaining: projected - actual,
      type: 'group',
      groupId: null
    }

  }

  const handleAddRowCat = (e) => {
    e.preventDefault()
    setAddLoading(true)

    const newRow = {
      budgetId,
      rowId: customIdGenerator(),
      category,
      projected,
      actual,
      remaining: projected - actual,
      type: 'category',
      groupId: e.target.key
    }

  }

  return (
    <>
      <div className="w-100" style={{ marginBottom: '5rem' }}>
        {
          loading
            ? <>
                <div>
                  <Skeleton variant='rounded'>
                    <div className="h1 w-100" style={{ fontWeight: 'bold', marginTop: '2.25rem' }}>
                      Unemployed life monthly budget
                    </div>
                  </Skeleton>
                  <Skeleton variant='rounded'>
                    <div className="h4 w-100">
                      Monthly
                    </div>
                  </Skeleton>
                  <Skeleton variant='rounded'>
                    <div className="h4 w-100 mb-0">
                      8/1/2024 to 9/1/2024
                    </div>
                  </Skeleton>
                </div>

                <TablePlaceholder />
              </>
            : <>
                <div>
                  <div className="h2 w-100" style={{ fontWeight: 'bold', marginTop: '2.25rem' }}>
                    {name}
                  </div>
                  <div className="h4 w-100 text-capitalize">{frequency}</div>
                  <div className="h4 w-100 mb-0">{`${fromDate} to ${toDate}`}</div>
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
                      {
                        tableRows.map(row => {
                          const {budgetId, rowId, category, projected,
                            actual, remaining, type, groupId
                          } = row

                          return (
                            <BudgetRowGroup key={rowId} budgetId={budgetId}
                             rowId={rowId} category={category} projected={projected}
                             actual={actual} remaining={remaining}
                             type={type} groupId={groupId} rows={tableRows} />
                          )
                        })
                      }
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Button startIcon={<AddRounded />}>Add category group</Button>
                        </TableCell>
                      </TableRow>

                    </TableBody>
                  </Table>
                </TableContainer>
              </>
        }
      </div>
    </>
  )
}

function BudgetRowGroup({budgetId, rowId, category, projected, actual, remaining, type, groupId, rows}) {
  const [expand, setExpand] = useState(true)

  return (
    <>
      {
        type === 'group'
          ? <>
              <TableRow role='button' onClick={() => setExpand(!expand)}>
                <TableCell padding="checkbox">
                  <IconButton disabled sx={{ color: '#0000008a !important' }}>
                    {
                      expand ? <ArrowDropDownRounded /> : <ArrowRightRounded />
                    }
                  </IconButton>
                </TableCell>
                <TableCell padding="none">{category}</TableCell>
                <TableCell align="right">{projected}</TableCell>
                <TableCell align="right">{actual}</TableCell>
                <TableCell align="right">{remaining}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none" colSpan={5}>
                  <Collapse in={expand} timeout='auto'>
                    <div>
                      <Table sx={{ borderRadius: '1rem', backgroundColor: 'white' }}>
                        <TableBody>
                          {
                            rows.filter(row => row.groupId === rowId).map(catRow => {
                              const {
                                rowId, category, projected, actual, remaining
                              } = catRow

                              return (
                                <TableRow key={rowId}>
                                  <TableCell padding="checkbox">
                                    <IconButton disabled>
                                      <ArrowDropDownRounded sx={{ visibility: 'hidden' }} />
                                    </IconButton>
                                  </TableCell>
                                  <TableCell padding="none">{category}</TableCell>
                                  <TableCell align="right">{projected}</TableCell>
                                  <TableCell align="right">{actual}</TableCell>
                                  <TableCell align="right">{remaining}</TableCell>
                                </TableRow>
                              )
                            })
                          }
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
            </>
          : <></>
      }
    </>
  )
}
