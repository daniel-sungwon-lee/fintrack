import { BarChartRounded, HomeRounded, PowerSettingsNewRounded } from "@mui/icons-material";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import { useEffect, useState } from "react";

export default function Nav({ page, setPage }) {
  const [value, setValue] = useState(page || 'overview')

  useEffect(() => setValue(page))

  return (
    <BottomNavigation sx={{ justifyContent: "space-around", height: '75px',
     boxShadow: "0 0.2rem 0.4rem 0 rgb(17 17 17 / 8%)", marginBottom: '1rem'}} value={value}
     onChange={(e,value) => {
      setValue(value)
      setPage(value)
     }}>
      <BottomNavigationAction label='Overview' value='overview' icon={<HomeRounded />} title='Overview' />
      <BottomNavigationAction label='Track' value='track' icon={<BarChartRounded />} title='Track' />
      <BottomNavigationAction color="error" sx={{color:'red !important'}} label='Logout'
       value='logout' icon={<PowerSettingsNewRounded />} title="Logout" />
    </BottomNavigation>
  )
}
