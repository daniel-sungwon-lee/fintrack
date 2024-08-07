import { AccountBalanceWalletRounded, BarChartRounded, HomeRounded, PowerSettingsNewRounded } from "@mui/icons-material";
import { BottomNavigation, BottomNavigationAction, useScrollTrigger } from "@mui/material";
import { useEffect, useState } from "react";

export default function Nav({ page, setPage }) {
  const [value, setValue] = useState(page || 'overview')

  useEffect(() => setValue(page),[page])

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  })

  return (
    <BottomNavigation sx={{ justifyContent: "space-around", height: '75px',
     boxShadow: trigger ? "0 0.2rem 0.4rem 0 rgb(17 17 17 / 32%)" : "0 0.2rem 0.4rem 0 rgb(17 17 17 / 8%)",
     marginBottom: '1rem', position: 'sticky', top: '0', zIndex: '1200', transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)' }}
     value={value} onChange={(e,value) => {
      setValue(value)
      setPage(value)
     }}>
      <BottomNavigationAction label='Overview' value='overview' icon={<HomeRounded />} title='Overview' />
      <BottomNavigationAction label='Track' value='track' icon={<BarChartRounded />} title='Track' />
      <BottomNavigationAction label='Budget' value='budget' icon={<AccountBalanceWalletRounded />} title="Budget" />
      <BottomNavigationAction color="error" sx={{color:'red !important'}} label='Logout'
       value='logout' icon={<PowerSettingsNewRounded />} title="Logout" />
    </BottomNavigation>
  )
}
