import { AddRounded, ArrowDropDownRounded, ArrowRightRounded } from "@mui/icons-material";
import { Button, Collapse, IconButton, Paper, Skeleton, Table, TableBody, TableCell,
         TableContainer, TableHead, TableRow, Tooltip} from "@mui/material";

export default function TablePlaceholder() {
  return (
    <TableContainer component={Paper} sx={{
      minWidth: '80%', margin: '2rem 0rem 0rem', borderRadius: '8px',
      backgroundColor: '#ffe6c6', padding: '1rem'
    }}>
      <Table>
        <Skeleton variant='rounded' sx={{marginBottom: '0.5rem', borderRadius: '0.75rem'}} width='100%'>
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
        </Skeleton>

        <TableBody>
          <Skeleton variant='rounded' sx={{marginBottom: '0.25rem', borderRadius: '1rem'}} width='100%'>
            <TableRow>
              <TableCell padding="checkbox">
                <IconButton disabled sx={{ color: '#0000008a !important' }}>
                  <ArrowDropDownRounded />
                </IconButton>
              </TableCell>
              <TableCell padding="none">Bills</TableCell>
              <TableCell align="right">$3333</TableCell>
              <TableCell align="right">$1342</TableCell>
              <TableCell align="right">$1991</TableCell>
            </TableRow>
          </Skeleton>

          <TableRow>
            <TableCell padding="none" colSpan={5}>
              <Collapse in timeout='auto'>
                <Skeleton variant='rounded' sx={{marginBottom: '0.5rem', borderRadius: '1rem'}} width='100%'>
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
                </Skeleton>
              </Collapse>
            </TableCell>
          </TableRow>

          <Skeleton variant="rounded" sx={{marginBottom: '0.25rem', borderRadius: '1rem'}} width='100%'>
            <TableRow>
              <TableCell padding="checkbox">
                <IconButton disabled sx={{ color: '#0000008a !important' }}>
                  <ArrowDropDownRounded />
                </IconButton>
              </TableCell>
              <TableCell padding="none">Bills</TableCell>
              <TableCell align="right">$3333</TableCell>
              <TableCell align="right">$1342</TableCell>
              <TableCell align="right">$1991</TableCell>
            </TableRow>
          </Skeleton>

          <TableRow>
            <TableCell padding="none" colSpan={5}>
              <Collapse in timeout='auto'>
                <Skeleton variant="rounded" sx={{marginBottom: '0.5rem', borderRadius: '1rem'}} width='100%'>
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
                </Skeleton>
              </Collapse>
            </TableCell>
          </TableRow>

          <Skeleton variant="rounded" sx={{marginBottom: '0.25rem', borderRadius: '1rem'}} width='100%'>
            <TableRow>
              <TableCell padding="checkbox">
                <IconButton disabled sx={{ color: '#0000008a !important' }}>
                  <ArrowDropDownRounded />
                </IconButton>
              </TableCell>
              <TableCell padding="none">Bills</TableCell>
              <TableCell align="right">$3333</TableCell>
              <TableCell align="right">$1342</TableCell>
              <TableCell align="right">$1991</TableCell>
            </TableRow>
          </Skeleton>

          <TableRow>
            <TableCell padding="none" colSpan={5}>
              <Collapse in timeout='auto'>
                <Skeleton variant="rounded" sx={{marginBottom: '0.5rem', borderRadius: '1rem'}} width='100%'>
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
                </Skeleton>
              </Collapse>
            </TableCell>
          </TableRow>

          <div className="d-flex justify-content-center w-100">
            <Skeleton variant="rounded">
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Button startIcon={<AddRounded />}>Add category group</Button>
                </TableCell>
              </TableRow>
            </Skeleton>
          </div>
        </TableBody>

      </Table>
    </TableContainer>
  )
}
