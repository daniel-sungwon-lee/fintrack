import { AssessmentRounded, HomeRounded, PowerSettingsNewRounded } from "@mui/icons-material";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import { useState } from "react";

export default function Nav() {
  const [value, setValue] = useState('home')

  return (
    <BottomNavigation sx={{justifyContent: "space-around", height: '75px'}} value={value} onChange={(e,value) => setValue(value)}>
      <BottomNavigationAction label='Home' value='home' icon={<HomeRounded />} />
      <BottomNavigationAction label='Track' value='track' icon={<AssessmentRounded />} />
      <BottomNavigationAction label='Logout' value='logout' icon={<PowerSettingsNewRounded />} />
    </BottomNavigation>
  )
}
