import React, { useState } from "react";
import HeaderLoggedIn from "./HeaderLoggedIn";
import { Link as RouterLink } from 'react-router-dom';
import { AuthProvider, useAuth } from "../assets/AuthContext";

import {AppBar, Toolbar, Button, createTheme, ThemeProvider} from '@mui/material/';
import Cookies from "js-cookie";


function Header(props) {
    const { isLoggedIn, } = useAuth();
    // const isAuthenticated = Cookies.get('token');

    const defaultTheme = createTheme();

    return (
      <ThemeProvider theme={defaultTheme}>
       <AppBar
        position="static"
        sx={{
            backgroundColor: '#038cfc', // Custom background color
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`
        }}
        >
        <Toolbar sx={{ flexWrap: 'wrap' }}>
          <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit', marginRight: 'auto' }}>
            <Button color="inherit">
              TMS
            </Button>
          </RouterLink>
          {/* Spacer to push HeaderLoggedIn to the right */}
          <div style={{ flexGrow: 1 }}></div> 
          {isLoggedIn && <HeaderLoggedIn/> }
        </Toolbar>
      </AppBar>
      </ThemeProvider>
    )
}

export default Header;