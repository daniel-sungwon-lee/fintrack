import { forwardRef, useEffect, useMemo, useState } from "react"
import Placeholder from "./placeholder"
import { Box, Button, CircularProgress, Collapse, Fab, FormControl, FormControlLabel,
         FormHelperText, FormLabel, IconButton, Pagination, Paper, Radio, RadioGroup, Skeleton,
         SpeedDial, SpeedDialAction, SpeedDialIcon, styled, Table, TableBody, TableCell,
         TableContainer, TableHead, TablePagination, TableRow, TextField, Tooltip,
         Zoom } from "@mui/material"
import { AddCardRounded, AddRounded, ArrowDropDownRounded, ArrowDropUpRounded,
         ArrowRightRounded, CheckRounded, CloseRounded, CreditCardOffRounded, DeleteRounded,
         EditRounded, MoreVertRounded, PostAddRounded } from "@mui/icons-material"
import { LoadingButton } from "@mui/lab"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { DateRangePicker, SingleInputDateRangeField } from "@mui/x-date-pickers-pro"
import dayjs from "dayjs"
import TablePlaceholder from "./tablePlaceholder"
import { NumericFormat } from "react-number-format"
import { closeSnackbar, enqueueSnackbar, MaterialDesignContent, SnackbarProvider } from "notistack"

const converter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const StyledSnackbar = styled(MaterialDesignContent)(() => ({
  '&.notistack-MuiContent-success': {backgroundColor: '#00c169'},
  '&.notistack-MuiContent-error': {backgroundColor: '#d32f2f'}
}))

export default function Budget({userId}) {
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [budgets, setBudgets] = useState(null)
  const [open, setOpen] = useState(false)
  const [addBudgetLoading, setAddBudgetLoading] = useState(false)
  const [page, setPage] = useState(1)

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

                      <SnackbarProvider autoHideDuration={3000} variant='success'
                       Components={{success: StyledSnackbar, error: StyledSnackbar}}
                       action={snackbarId => (
                        <IconButton onClick={() => closeSnackbar(snackbarId)}>
                          <CloseRounded sx={{color: 'white'}} />
                        </IconButton>
                       )} />

                      <>
                        {
                          budgets && budgets.length > 0
                            ? <>
                                {
                                  budgets.map((budget, index) => {
                                    const {budgetId, userId, name, frequency,
                                      fromDate, toDate, rows
                                     } = budget

                                    return (
                                      <BudgetTable key={budgetId} budgetId={budgetId}
                                        userId={userId} name={name} frequency={frequency}
                                        fromDate={fromDate} toDate={toDate} rows={rows}
                                        budgets={budgets} setBudgets={setBudgets}
                                        page={page} setPage={setPage} display={index+1} />
                                    )
                                  })
                                }
                                <div className="w-100 d-flex justify-content-center">
                                  <Pagination count={budgets.length} page={page}
                                   onChange={(e,newPage) => setPage(newPage)}
                                   sx={{marginBottom: '3rem'}} size="large" />
                                </div>
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
                           budgets={budgets} open={open} setOpen={setOpen}
                           setAddBudgetLoading={setAddBudgetLoading} setPage={setPage} />
                        </Collapse>
                      </div>

                      <Fab variant="extended" size="medium" color={open ? 'error' : 'primary'}
                       sx={{padding: '1.5rem', borderRadius: '2rem'}} disabled={!ready || addBudgetLoading}
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

function NewBudget({userId, budgets, setBudgets, open, setOpen, setAddBudgetLoading, setPage}) {
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
    setAddBudgetLoading(true)

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
              setAddBudgetLoading(false)
              enqueueSnackbar('Created budget!')

              if (!budgets) {
                setBudgets([data[0]])
              } else {
                setPage(1)
                setBudgets([data[0], ...budgets])
              }
            })
            .catch(error => {
              setAddError(true)
              setAddLoading(false)
              setAddBudgetLoading(false)
              window.alert(error)
              console.error(error)
            })

        } else {
          setAddError(true)
          setAddLoading(false)
          setAddBudgetLoading(false)
        }
      })
      .catch(error => {
        setAddError(true)
        setAddLoading(false)
        setAddBudgetLoading(false)
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
              helperText: addError ? 'Please try again' : 'Read-only'}
            }} />
        </LocalizationProvider>

        <div className="d-flex justify-content-center" style={{marginTop: '4rem', marginBottom: '2rem'}}>
          <LoadingButton loading={addLoading} type="submit" sx={{textTransform: 'none', color: 'white'}}
           loadingPosition="start" variant='contained' startIcon={<AddRounded />}>
            Create
          </LoadingButton>
        </div>
      </form>
    </>
  )
}

function BudgetTable({budgetId, userId, name, frequency, fromDate, toDate, rows, budgets, setBudgets, page, setPage, display}) {
  const [loading, setLoading] = useState(true)
  const [tableRows, setTableRows] = useState(rows.rows)
  const [newRows, setNewRows] = useState(rows.new)
  const [addGroupOpen, setAddGroupOpen] = useState(false)
  const [groupCategory, setGroupCategory] = useState('')
  const [groupProjected, setGroupProjected] = useState('')
  const [addGroupLoading, setAddGroupLoading] = useState(false)
  const [addGroupError, setAddGroupError] = useState(false)
  const [groupRowEdit, setGroupRowEdit] = useState(false)

  const [speedDialLoading, setSpeedDialLoading] = useState(false)
  const [editModeId, setEditModeId] = useState(null)

  const [editName, setEditName] = useState('')
  const [editFrequency, setEditFrequency] = useState('monthly')
  const [editDateRange, setEditDateRange] = useState([dayjs(), dayjs().add(1, 'month')])
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState(false)

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
        actual: 2745,
        remaining: 255,
        type: 'group',
        groupId: null
      },
      {
        budgetId,
        rowId: "row6567643dc469af2a5c73935524e087be",
        category: 'Fun',
        projected: 500,
        actual: 156,
        remaining: 344,
        type: 'group',
        groupId: null
      },
      {
        budgetId,
        rowId: "row64adc7c62c3b49892e1f71000d7fb185",
        category: 'Food',
        projected: 300,
        actual: 145,
        remaining: 155,
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
        projected: 200,
        actual: 0,
        remaining: 200,
        type: 'category',
        groupId: "row6567643dc469af2a5c73935524e087be"
      },
      {
        budgetId,
        rowId: customIdGenerator(),
        category: 'Rent',
        projected: 2500,
        actual: 2500,
        remaining: 0,
        type: 'category',
        groupId: "row564000212156bae63c0a82b1a1ebf855"
      },
      {
        budgetId,
        rowId: customIdGenerator(),
        category: 'Utilities',
        projected: 300,
        actual: 45,
        remaining: 255,
        type: 'category',
        groupId: "row564000212156bae63c0a82b1a1ebf855"
      },
      {
        budgetId,
        rowId: customIdGenerator(),
        category: 'Shopping',
        projected: 300,
        actual: 156,
        remaining: 144,
        type: 'category',
        groupId: "row6567643dc469af2a5c73935524e087be"
      },
      {
        budgetId,
        rowId: customIdGenerator(),
        category: 'Insurance',
        projected: 200,
        actual: 200,
        remaining: 0,
        type: 'category',
        groupId: "row564000212156bae63c0a82b1a1ebf855"
      }
    ]

    if(newRows && tableRows.length === 0) {
      //setting default table rows (if no rows/freshly created)
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

    if(!addGroupOpen) {
      setGroupCategory('')
      setGroupProjected('')
      setAddGroupLoading(false)
      setAddGroupError(false)
    }

    if(!editModeId) {
      setEditName('')
      setEditFrequency('monthly')
      setEditDateRange([dayjs(), dayjs().add(1, 'month')])
      setEditLoading(false)
      setEditError(false)
    }

  },[addGroupOpen, budgetId, editModeId, newRows, tableRows, userId])

  const handleAddGroup = async (e) => {
    e.preventDefault()
    setAddGroupLoading(true)

    const newRow = {
      budgetId,
      rowId: customIdGenerator(),
      category: groupCategory,
      projected: groupProjected,
      actual: 0,
      remaining: groupProjected - 0,
      type: 'group',
      groupId: null
    }

    await fetch(`/api/server/budgets/${userId}/${budgetId}?rowType=group`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({updatedRows: {rows: [...tableRows, newRow], new: false}})
    })
      .then(async res => {
        if(res.status === 200) {
          setTableRows([...tableRows, newRow])
          setAddGroupOpen(false)
          enqueueSnackbar('Added category group!')

        } else {
          setAddGroupError(true)
          setAddGroupLoading(false)
        }
      })
      .catch(error => {
        setAddGroupError(true)
        setAddGroupLoading(false)
        window.alert(error)
        console.error(error)
      })
  }

  const handleSpeedDial = async (action) => {
    if(action === 'delete') {
      setSpeedDialLoading(true)

      await fetch(`/api/server/budgets/${userId}/${budgetId}`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" }
      })
        .then(res => {
          const newBudgets = budgets.filter(budget => budget.budgetId !== budgetId)

          setPage(display === 1 ? 1 : display-1)
          setBudgets(newBudgets)
          setSpeedDialLoading(false)
          enqueueSnackbar('Deleted budget', {variant: 'error'})
        })
        .catch(error => {
          setSpeedDialLoading(false)
          window.alert(error)
          console.error(error)
        })

    } else {
      setEditName(name)
      setEditFrequency(frequency)
      if(frequency === 'monthly') {
        setEditDateRange([dayjs(), dayjs().add(1, 'month')])
      } else if(frequency === 'weekly') {
        setEditDateRange([dayjs(), dayjs().add(1, 'week')])
      } else if(frequency === 'daily') {
        setEditDateRange([dayjs(), dayjs().add(1, 'day')])
      } else if(frequency === 'yearly') {
        setEditDateRange([dayjs(), dayjs().add(1, 'year')])
      }
      setEditModeId(budgetId)
    }
  }

  const handleEditBudget = async (e) => {
    e.preventDefault()
    setEditLoading(true)

    const reqBody = {
      budgetId,
      userId,
      name: editName,
      frequency: editFrequency,
      fromDate: dayjs(editDateRange[0].$d).format('MM/DD/YYYY'),
      toDate: dayjs(editDateRange[1].$d).format('MM/DD/YYYY'),
      rows: {rows: tableRows, new: false}
    }

    const budgetIds = budgets.map(budget => budget.budgetId)
    const currentBudgetIndex = budgetIds.indexOf(budgetId)
    const updatedBudgets = budgets.toSpliced(currentBudgetIndex, 1, reqBody)

    await fetch(`/api/server/budgets/${userId}/${budgetId}?tableEdit=true`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody)
    })
      .then(res => {
        if (res.status === 200) {
          setBudgets(updatedBudgets)
          setEditModeId(null)
          enqueueSnackbar('Updated budget!')

        } else {
          setEditError(true)
          setEditLoading(false)
        }
      })
      .catch(error => {
        setEditError(true)
        setEditLoading(false)
        window.alert(error)
        console.error(error)
      })
  }

  const handleEditChange = (e) => {
    if(e.target.type === 'radio') {
      setEditFrequency(e.target.value)

      if(e.target.value === 'monthly') {
        setEditDateRange([dayjs(), dayjs().add(1, 'month')])

      } else if(e.target.value === 'weekly') {
        setEditDateRange([dayjs(), dayjs().add(1, 'week')])

      } else if(e.target.value === 'daily') {
        setEditDateRange([dayjs(), dayjs().add(1, 'day')])

      } else if(e.target.value === 'yearly') {
        setEditDateRange([dayjs(), dayjs().add(1, 'year')])
      }
    }
  }

  return (
    <>
      <div className={`w-100 ${display === page ? '' : 'd-none'}`}
       style={{ marginBottom: '5rem', position: 'relative' }}>
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
                  {
                    editModeId === budgetId
                      ? <form onSubmit={handleEditBudget} style={{marginTop: '2.5rem'}}>
                          <div className="d-flex flex-column justify-content-center w-75">
                            <TextField value={editName} type="name" id="name" required disabled={editLoading}
                             variant="standard" label="Budget name" onChange={(e) => setEditName(e.target.value)}
                             InputLabelProps={{ required: false }} error={editError} sx={{ marginBottom: '1rem' }}
                             helperText={editError ? 'Please try again' : 'Ex: Marrakesh Travel Budget'}
                             className="mb-3" />

                            <FormControl disabled={editLoading} color={editError ? 'error' : 'primary'}
                            className="mb-2">
                              <FormLabel focused>Frequency</FormLabel>
                              <RadioGroup value={editFrequency} onChange={handleEditChange} row>
                                <FormControlLabel value='monthly' control={<Radio />} label='Monthly' />
                                <FormControlLabel value='weekly' control={<Radio />} label='Weekly' />
                                <FormControlLabel value='daily' control={<Radio />} label='Daily' />
                                <FormControlLabel value='yearly' control={<Radio />} label='Yearly' />
                              </RadioGroup>
                            </FormControl>

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DateRangePicker label='Date range' slots={{ field: SingleInputDateRangeField }}
                                calendars={1} value={editDateRange} disablePast minDate={editDateRange[0]} maxDate={editDateRange[1]}
                                onChange={(newValue) => setEditDateRange(newValue)} disabled
                                slotProps={{
                                  textField: {
                                    variant: 'standard', error: editError, inputProps: { style: { cursor: 'inherit' } },
                                    helperText: editError ? 'Please try again' : 'Read-only'
                                  }
                                }} />
                            </LocalizationProvider>
                          </div>

                          <div className="d-flex justify-content-center mb-3">
                            <div className="d-flex flex-column">
                              <LoadingButton loading={editLoading} type="submit" sx={{ textTransform: 'none', color: 'white' }}
                                loadingPosition="start" variant='contained' startIcon={<CheckRounded />}>
                                Submit
                              </LoadingButton>

                              <Button onClick={() => setEditModeId(null)} className="mt-2"
                               startIcon={<CloseRounded color={editLoading ? 'disabled' : 'error'} />}
                               color='error' disabled={editLoading}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </form>
                      : <>
                          <div className="h2 w-100" style={{ fontWeight: 'bold', marginTop: '2.25rem' }}>
                            {name}
                          </div>
                          <div className="h4 w-100 text-capitalize">{frequency}</div>
                          <div className="h4 w-100 mb-0">{`${fromDate} to ${toDate}`}</div>
                        </>
                  }
                </div>

                {
                  editModeId === budgetId
                    ? <></>
                    : <>
                        <SpeedDial ariaLabel="Budget Table SpeedDial"
                          icon={<SpeedDialIcon icon={<MoreVertRounded sx={{ color: '#0000008a' }} fontSize='large' />}
                            openIcon={<CloseRounded color="error" fontSize="large" />} />}
                          sx={{ position: 'absolute', top: '16px', right: '0px' }}
                          FabProps={{
                            sx: {
                              boxShadow: 'none !important',
                              background: 'transparent !important'
                            }, disableRipple: true
                          }}
                          direction="down" >
                          <SpeedDialAction tooltipTitle='Edit' icon={<EditRounded />}
                            onClick={() => handleSpeedDial('edit')}
                            disabled={editModeId !== null && editModeId !== budgetId} />
                          <SpeedDialAction tooltipTitle='Delete'
                            icon={speedDialLoading
                              ? <CircularProgress color="inherit" size={20} thickness={5} />
                              : <DeleteRounded color="error" />}
                            onClick={() => handleSpeedDial('delete')}
                            FabProps={{ disabled: speedDialLoading }} />
                        </SpeedDial>
                      </>
                }

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
                        <TableCell align="right" sx={{ borderRadius: '0 0.75rem 0.75rem 0', color: 'white', paddingRight: '40px' }}>
                          Remaining
                        </TableCell>
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
                             type={type} groupId={groupId} rows={tableRows}
                             setRows={setTableRows} userId={userId} setNewRows={setNewRows}
                             setGroupRowEdit={setGroupRowEdit} setAddGroupOpen={setAddGroupOpen} />
                          )
                        })
                      }

                      <TableRow>
                        <TableCell colSpan={5} padding="none">
                          <Collapse in={addGroupOpen} timeout='auto'>
                            <form onSubmit={handleAddGroup} className="mt-3">
                              <div className="d-flex w-100">
                                <div style={{ width: '48px' }}>
                                  <IconButton disabled>
                                    <ArrowDropDownRounded sx={{ visibility: 'hidden' }} />
                                  </IconButton>
                                </div>
                                <div className="d-flex w-100">
                                  <div className="w-100">
                                    <TextField value={groupCategory} id="category" required disabled={addGroupLoading}
                                      variant="standard" label="Category" onChange={(e) => setGroupCategory(e.target.value)}
                                      InputLabelProps={{ required: false }} error={addGroupError} sx={{ marginBottom: '0.5rem' }}
                                      helperText={addGroupError ? 'Please try again' : 'Ex: Child'} fullWidth />
                                  </div>
                                  <div className="w-100" style={{ marginRight: '16px' }}>
                                    <NumericFormat value={groupProjected} id='projected' type='tel' required disabled={addGroupLoading} prefix="$"
                                      variant="standard" label='Projected' onValueChange={(values) => setGroupProjected(values.floatValue)}
                                      InputLabelProps={{ required: false }} customInput={TextField} thousandSeparator fullWidth
                                      error={addGroupError} helperText={addGroupError ? 'Please try again' : ''} placeholder="$0.00" />
                                  </div>
                                </div>
                              </div>

                              <div className="w-100 d-flex justify-content-center mb-3 mt-1">
                                <LoadingButton loading={addGroupLoading} type="submit"
                                 sx={{ textTransform: 'none', color: 'white', marginTop: '0.5rem' }}
                                 loadingPosition="start" startIcon={<AddRounded />} variant='contained'>
                                  Add category group
                                </LoadingButton>
                              </div>
                            </form>
                          </Collapse>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Button onClick={() => setAddGroupOpen(!addGroupOpen)}
                           startIcon={addGroupOpen ? <CloseRounded color={addGroupLoading ? 'disabled' : 'error'} /> : <AddRounded />}
                           color={addGroupOpen ? 'error' : 'primary'} disabled={addGroupLoading || groupRowEdit}>
                            {
                              addGroupOpen ? <>Cancel</>
                                           : <>Add category group</>
                            }
                          </Button>
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

function BudgetRowGroup({budgetId, rowId, category, projected, actual, remaining, type, groupId, rows, setRows, userId, setNewRows, setGroupRowEdit, setAddGroupOpen}) {
  const [expand, setExpand] = useState(true)
  const [addExpand, setAddExpand] = useState(false)

  const [speedDialLoading, setSpeedDialLoading] = useState(false)
  const [editModeId, setEditModeId] = useState(null)

  const [groupCategory, setGroupCategory] = useState('')
  const [groupProjected, setGroupProjected] = useState('')
  const [addGroupLoading, setAddGroupLoading] = useState(false)
  const [addGroupError, setAddGroupError] = useState(false)

  const [actualTotal, setActualTotal] = useState(parseFloat(actual))

  useEffect(() => {
    if(!expand) {
      setAddExpand(false)
      setEditModeId(null)
    }
  },[expand])

  const customIdGenerator = () => {
    var S4 = function () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return ('row' + S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
  }

  const handleEditGroup = async (e) => {
    e.preventDefault()
    setAddGroupLoading(true)

    const groupCatRows = rows.filter(row => row.groupId === rowId)
    const groupCatRowsActual = groupCatRows.map(row => parseFloat(row.actual))
    let groupActual = 0
    if(groupCatRowsActual.length > 0) {
      groupActual = groupCatRowsActual.reduce((a,b) => a+b, groupActual)
    }

    const editedRow = {
      budgetId,
      rowId: rowId,
      category: groupCategory,
      projected: groupProjected,
      actual: groupActual,
      remaining: groupProjected - groupActual,
      type: 'group',
      groupId: null
    }

    const rowIds = rows.map(row => row.rowId)
    const currentRowIndex = rowIds.indexOf(rowId)
    const editedRows = rows.toSpliced(currentRowIndex, 1, editedRow)

    await fetch(`/api/server/budgets/${userId}/${budgetId}?rowType=group`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updatedRows: { rows: editedRows, new: false } })
    })
      .then(async res => {
        if (res.status === 200) {
          setRows(editedRows)
          setGroupCategory('')
          setGroupProjected('')
          setAddGroupLoading(false)
          setAddGroupError(false)
          setEditModeId(null)
          setGroupRowEdit(false)
          enqueueSnackbar('Updated category group!')

        } else {
          setAddGroupError(true)
          setAddGroupLoading(false)
        }
      })
      .catch(error => {
        setAddGroupError(true)
        setAddGroupLoading(false)
        window.alert(error)
        console.error(error)
      })
  }

  const handleSpeedDial = async (action, rowId, values) => {
    if(action === 'delete') {
      setSpeedDialLoading(true)

      const newRows = rows.filter(row => row.groupId !== rowId).filter(row => row.rowId !== rowId)

      await fetch(`/api/server/budgets/${userId}/${budgetId}?rowType=group`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({updatedRows: {rows : newRows, new: false}})
      })
        .then(res => {
          setNewRows(false)
          setRows(newRows)
          setSpeedDialLoading(false)
          enqueueSnackbar('Deleted category group', {variant: 'error'})
        })
        .catch(error => {
          setSpeedDialLoading(false)
          window.alert(error)
          console.error(error)
        })

    } else if(action === 'edit') {
      setAddExpand(false)
      setAddGroupOpen(false)
      setGroupCategory(values[0])
      setGroupProjected(values[1])
      setGroupRowEdit(true)
      setEditModeId(rowId)
    }
  }

  return (
    <>
      {
        type === 'group'
          ? <>
              {
                editModeId === rowId
                  ? <TableRow>
                      <TableCell padding="none" colSpan={5}>
                        <form onSubmit={handleEditGroup} className="mt-3">
                          <div className="d-flex w-100">
                            <div style={{ width: '48px' }}>
                              <IconButton disabled>
                                <ArrowDropDownRounded sx={{ visibility: 'hidden' }} />
                              </IconButton>
                            </div>
                            <div className="d-flex w-100">
                              <div className="w-100">
                                <TextField value={groupCategory} id="category" required disabled={addGroupLoading}
                                  variant="standard" label="Category" onChange={(e) => setGroupCategory(e.target.value)}
                                  InputLabelProps={{ required: false }} error={addGroupError} sx={{ marginBottom: '0.5rem' }}
                                  helperText={addGroupError ? 'Please try again' : 'Ex: Child'} fullWidth />
                              </div>
                              <div className="w-100" style={{ marginRight: '16px' }}>
                                <NumericFormat value={groupProjected} id='projected' type="tel" required disabled={addGroupLoading} prefix="$"
                                  variant="standard" label='Projected' onValueChange={(values) => setGroupProjected(values.floatValue)}
                                  InputLabelProps={{ required: false }} customInput={TextField} thousandSeparator fullWidth
                                  error={addGroupError} helperText={addGroupError ? 'Please try again' : ''} placeholder="$0.00" />
                              </div>
                            </div>
                          </div>

                          <div className="w-100 d-flex justify-content-center align-items-center mb-4 mt-1">
                            <LoadingButton loading={addGroupLoading} type="submit"
                              sx={{ textTransform: 'none', color: 'white', marginBottom: '0.5rem' }}
                              loadingPosition="start" startIcon={<CheckRounded />} variant='contained'>
                              Submit
                            </LoadingButton>
                            <IconButton color="error" sx={{marginLeft: '0.5rem'}} onClick={() => {
                              setEditModeId(null)
                              setGroupRowEdit(false)
                              setGroupCategory('')
                              setGroupProjected('')
                              setAddGroupLoading(false)
                              setAddGroupError(false)
                             }} disabled={addGroupLoading} className="mb-2">
                              <CloseRounded color={addGroupLoading ? 'disabled' : 'error'} />
                            </IconButton>
                          </div>
                        </form>
                      </TableCell>
                    </TableRow>
                  : <TableRow role='button' hover onClick={() => setExpand(!expand)}>
                      <TableCell padding="checkbox" sx={{ borderRadius: '1rem 0 0 1rem' }}>
                        <IconButton disabled sx={{ color: '#0000008a !important' }}>
                          {
                            expand ? <ArrowDropDownRounded /> : <ArrowRightRounded />
                          }
                        </IconButton>
                      </TableCell>
                      <TableCell padding="none">{category}</TableCell>
                      <TableCell sx={{color: Math.sign(projected) === -1 ? 'red' : ''}}
                       align="right">{converter.format(projected)}</TableCell>
                      <TableCell sx={{color: Math.sign(actualTotal) === -1 ? 'red' : ''}}
                       align="right">{converter.format(actualTotal)}</TableCell>
                      <TableCell align="right" sx={{ borderRadius: '0 1rem 1rem 0', paddingRight: '40px',
                        color: Math.sign(projected - actualTotal) === -1 ? 'red' : ''
                       }}>
                        {converter.format(projected - actualTotal)}
                      </TableCell>
                    </TableRow>
              }

              {
                editModeId === rowId
                  ? <></>
                  : <TableRow sx={{position: 'relative'}}>
                      <TableCell padding="none" sx={{ position: 'absolute', right: '20px', top: '-27px',
                      width: '0px' }} colSpan={5}>
                        <SpeedDial ariaLabel="Row Group SpeedDial"
                          icon={<SpeedDialIcon icon={<MoreVertRounded sx={{ color: '#0000008a' }} fontSize="small" />}
                            openIcon={<CloseRounded color="error" />} />}
                          FabProps={{
                            sx: {
                              boxShadow: 'none !important',
                              background: 'transparent !important'
                            }, disableRipple: true
                          }}
                          direction="left" sx={{height: '0px'}}>
                          <SpeedDialAction tooltipTitle='Edit' icon={<EditRounded fontSize="small" />}
                            onClick={() => handleSpeedDial('edit', rowId, [category, projected, actual])}
                            disabled={editModeId !== null && editModeId !== rowId} />
                          <SpeedDialAction tooltipTitle='Delete'
                            icon={speedDialLoading
                              ? <CircularProgress color="inherit" size={18} thickness={5} />
                              : <DeleteRounded color="error" fontSize="small" />}
                            onClick={() => handleSpeedDial('delete', rowId, [category, projected, actual])}
                            FabProps={{ disabled: speedDialLoading }} />
                        </SpeedDial>
                      </TableCell>
                    </TableRow>
              }

              <TableRow>
                <TableCell padding="none" colSpan={5}>
                  <Collapse in={expand} timeout='auto'>
                    <BudgetRowCategory rows={rows} budgetId={budgetId} groupRowId={rowId}
                     userId={userId} setRows={setRows} addExpand={addExpand}
                     setAddExpand={setAddExpand} editModeId={editModeId}
                     setEditModeId={setEditModeId} setNewRows={setNewRows}
                     setActualTotal={setActualTotal} />
                  </Collapse>
                </TableCell>
              </TableRow>
            </>
          : <></>
      }
    </>
  )
}

function BudgetRowCategory({rows, budgetId, groupRowId, userId, setRows, addExpand, setAddExpand, editModeId, setEditModeId, setNewRows, setActualTotal}) {
  const [catCategory, setCatCategory] = useState('')
  const [catProjected, setCatProjected] = useState('')
  const [catActual, setCatActual] = useState('')
  const [addCatLoading, setAddCatLoading] = useState(false)
  const [addCatError, setAddCatError] = useState(false)

  const [speedDialLoading, setSpeedDialLoading] = useState(false)

  useEffect(() => {
    const actuals = rows.filter(row => row.groupId === groupRowId).map(row => parseFloat(row.actual))
    if(actuals.length > 0) {
      setActualTotal(actuals.reduce((a,b) => a+b),0)
    } else {
      setActualTotal(0)
    }

    //patch data with updated group row amounts?
  },[rows, groupRowId, setActualTotal])

  const customIdGenerator = () => {
    var S4 = function () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return ('row' + S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
  }

  const handleAddCat = async (action, catRowId, e) => {
    if(action ==='edit') {
      e.preventDefault()
      setAddCatLoading(true)

      const editedRow = {
        budgetId,
        rowId: catRowId,
        category: catCategory,
        projected: catProjected,
        actual: catActual,
        remaining: catProjected - catActual,
        type: 'category',
        groupId: groupRowId
      }

      const rowIds = rows.map(row => row.rowId)
      const currentRowIndex = rowIds.indexOf(catRowId)
      const editedRows = rows.toSpliced(currentRowIndex, 1, editedRow)

      await fetch(`/api/server/budgets/${userId}/${budgetId}?rowType=category`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({updatedRows: {rows: editedRows, new: false}})
      })
        .then(async res => {
          if(res.status === 200) {
            setRows(editedRows)
            setCatCategory('')
            setCatProjected('')
            setCatActual('')
            setAddCatLoading(false)
            setAddCatError(false)
            setEditModeId(null)
            enqueueSnackbar('Updated category!')

          } else {
            setAddCatError(true)
            setAddCatLoading(false)
          }
        })
        .catch(error => {
          setAddCatError(true)
          setAddCatLoading(false)
          window.alert(error)
          console.error(error)
        })

    } else {
      e.preventDefault()
      setAddCatLoading(true)

      const newRow = {
        budgetId,
        rowId: customIdGenerator(),
        category: catCategory,
        projected: catProjected,
        actual: catActual,
        remaining: catProjected - catActual,
        type: 'category',
        groupId: groupRowId
      }

      await fetch(`/api/server/budgets/${userId}/${budgetId}?rowType=category`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({updatedRows: {rows: [...rows, newRow], new: false}})
      })
        .then(async res => {
          if(res.status === 200) {
            setRows([...rows, newRow])
            setAddExpand(false)
            setCatCategory('')
            setCatProjected('')
            setCatActual('')
            setAddCatLoading(false)
            setAddCatError(false)
            enqueueSnackbar('Added category!')

          } else {
            setAddCatError(true)
            setAddCatLoading(false)
          }
        })
        .catch(error => {
          setAddCatError(true)
          setAddCatLoading(false)
          window.alert(error)
          console.error(error)
        })
    }
  }

  const handleSpeedDial = async (action, rowId, values) => {
    if(action === 'delete') {
      setSpeedDialLoading(true)

      const newRows = rows.filter(row => row.rowId !== rowId)

      await fetch(`/api/server/budgets/${userId}/${budgetId}?rowType=category`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({updatedRows: {rows : newRows, new: false}})
      })
        .then(res => {
          setNewRows(false)
          setRows(newRows)
          setSpeedDialLoading(false)
          enqueueSnackbar('Deleted category', {variant: 'error'})
        })
        .catch(error => {
          setSpeedDialLoading(false)
          window.alert(error)
          console.error(error)
        })

    } else if(action === 'edit') {
      setAddExpand(false)
      setCatCategory(values[0])
      setCatProjected(values[1])
      setCatActual(values[2])
      setEditModeId(rowId)
    }
  }

  return (
    <div>
      <Table sx={{ borderRadius: '1rem', backgroundColor: 'white' }}>
        <TableBody>
          {
            rows.filter(row => row.groupId === groupRowId).map(catRow => {
              const {
                rowId, category, projected, actual, remaining
              } = catRow

              return (
                <TableRow key={rowId}>
                  {
                    editModeId === rowId
                      ? <TableCell colSpan={5} padding="none">
                          <form onSubmit={(e) => handleAddCat('edit', rowId, e)} className="mt-3">
                            <div className="d-flex w-100">
                              <div style={{ width: '48px' }}>
                                <IconButton disabled>
                                  <ArrowDropDownRounded sx={{ visibility: 'hidden' }} />
                                </IconButton>
                              </div>
                              <div className="d-flex justify-content-between w-100">
                                <div className="w-100">
                                  <TextField value={catCategory} id="category" required disabled={addCatLoading}
                                    variant="standard" label="Category" onChange={(e) => setCatCategory(e.target.value)}
                                    InputLabelProps={{ required: false }} error={addCatError} sx={{ marginBottom: '0.5rem' }}
                                    helperText={addCatError ? 'Please try again' : 'Ex: Mortgage'} fullWidth />
                                </div>
                                <div className="d-flex w-100" style={{ marginRight: '16px' }}>
                                  <NumericFormat value={catProjected} id='projected' type="tel" required disabled={addCatLoading} prefix="$"
                                   variant="standard" label='Projected' onValueChange={(values) => setCatProjected(values.floatValue)}
                                   InputLabelProps={{ required: false }} customInput={TextField} thousandSeparator fullWidth
                                   error={addCatError} helperText={addCatError ? 'Please try again' : ''} placeholder="$0.00" />
                                  <NumericFormat value={catActual} id='actual' type="tel" required disabled={addCatLoading} prefix="$"
                                   variant="standard" label='Actual' onValueChange={(values) => setCatActual(values.floatValue)}
                                   InputLabelProps={{required: false}} customInput={TextField} thousandSeparator fullWidth
                                   error={addCatError} helperText={addCatError ? 'Please try again' : ''} placeholder="$0.00" />
                                </div>
                              </div>
                            </div>

                            <div className="w-100 d-flex justify-content-center mb-2">
                              <div>
                                <LoadingButton loading={addCatLoading} type="submit" sx={{ textTransform: 'none' }}
                                  loadingPosition="start" startIcon={<CheckRounded />}>
                                  Submit
                                </LoadingButton>
                                <IconButton color="error" onClick={() => {
                                  setEditModeId(null)
                                  setCatCategory('')
                                  setCatProjected('')
                                  setCatActual('')
                                  setAddCatLoading(false)
                                  setAddCatError(false)
                                }} disabled={addCatLoading}>
                                  <CloseRounded color={addCatLoading ? 'disabled' : 'error'} />
                                </IconButton>
                              </div>
                            </div>
                          </form>
                        </TableCell>
                      : <>
                          <TableCell padding="checkbox" sx={{ position: 'relative' }}>
                            <SpeedDial ariaLabel="Row Category SpeedDial"
                              icon={<SpeedDialIcon icon={<MoreVertRounded sx={{ color: '#0000008a' }} fontSize="small" />}
                                openIcon={<CloseRounded color="error" />} />}
                              sx={{ position: 'absolute', top: '-15px', left: '24px', width: '0px' }}
                              FabProps={{
                                sx: {
                                  boxShadow: 'none !important',
                                  background: 'transparent !important'
                                }, disableRipple: true
                              }}
                              direction="right">
                              <SpeedDialAction tooltipTitle='Edit' icon={<EditRounded fontSize="small" />}
                                onClick={() => handleSpeedDial('edit', rowId, [category, projected, actual])}
                                disabled={editModeId !== null && editModeId !== rowId} />
                              <SpeedDialAction tooltipTitle='Delete'
                                icon={speedDialLoading
                                  ? <CircularProgress color="inherit" size={18} thickness={5} />
                                  : <DeleteRounded color="error" fontSize="small" />}
                                onClick={() => handleSpeedDial('delete', rowId, [category, projected, actual])}
                                FabProps={{ disabled: speedDialLoading }} />
                            </SpeedDial>
                          </TableCell>
                          <TableCell padding="none">{category}</TableCell>
                          <TableCell sx={{color: Math.sign(projected) === -1 ? 'red' : ''}}
                           align="right">{converter.format(projected)}</TableCell>
                          <TableCell sx={{color: Math.sign(actual) === -1 ? 'red' : ''}}
                           align="right">{converter.format(actual)}</TableCell>
                          <TableCell sx={{color: Math.sign(remaining) === -1 ? 'red' : ''}}
                           align="right">{converter.format(remaining)}</TableCell>
                        </>
                  }
                </TableRow>
              )
            })
          }

          <TableRow>
            <TableCell colSpan={5} padding="none">
              <Collapse in={addExpand} timeout='auto'>
                <form onSubmit={(e) => handleAddCat('add', null, e)} className="mt-3">
                  <div className="d-flex w-100">
                    <div style={{ width: '48px' }}>
                      <IconButton disabled>
                        <ArrowDropDownRounded sx={{ visibility: 'hidden' }} />
                      </IconButton>
                    </div>
                    <div className="d-flex justify-content-between w-100">
                      <div className="w-100">
                        <TextField value={catCategory} id="category" required disabled={addCatLoading}
                          variant="standard" label="Category" onChange={(e) => setCatCategory(e.target.value)}
                          InputLabelProps={{ required: false }} error={addCatError} sx={{ marginBottom: '0.5rem' }}
                          helperText={addCatError ? 'Please try again' : 'Ex: Mortgage'} fullWidth />
                      </div>
                      <div className="d-flex w-100" style={{ marginRight: '16px' }}>
                        <NumericFormat value={catProjected} id='projected' type="tel" required disabled={addCatLoading} prefix="$"
                          variant="standard" label='Projected' onValueChange={(values) => setCatProjected(values.floatValue)}
                          InputLabelProps={{ required: false }} customInput={TextField} thousandSeparator fullWidth
                          error={addCatError} helperText={addCatError ? 'Please try again' : ''} placeholder="$0.00" />
                        <NumericFormat value={catActual} id='actual' type="tel" required disabled={addCatLoading} prefix="$"
                          variant="standard" label='Actual' onValueChange={(values) => setCatActual(values.floatValue)}
                          InputLabelProps={{ required: false }} customInput={TextField} thousandSeparator fullWidth
                          error={addCatError} helperText={addCatError ? 'Please try again' : ''} placeholder="$0.00" />
                      </div>
                    </div>
                  </div>

                  <div className="w-100 d-flex justify-content-center mb-2">
                    <LoadingButton loading={addCatLoading} type="submit" sx={{ textTransform: 'none' }}
                      loadingPosition="start" startIcon={<AddRounded />}>
                      Add category
                    </LoadingButton>
                  </div>
                </form>
              </Collapse>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell colSpan={5} sx={{ padding: '8px' }} align="center">
              <Tooltip title={addExpand ? '' : 'Add category'} slotProps={{
                popper: { modifiers: [{ name: 'offset', options: { offset: [0, -7] } }] }
              }}>
                <IconButton onClick={() => {
                  setAddExpand(!addExpand)
                  setCatCategory('')
                  setCatProjected('')
                  setCatActual('')
                  setAddCatLoading(false)
                  setAddCatError(false)
                 }}
                  color={addExpand ? 'error' : 'default'} disabled={editModeId !== null || addCatLoading}>
                  {
                    addExpand ? <CloseRounded color={addCatLoading ? 'disabled' : 'error'} />
                              : <AddRounded />
                  }
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
