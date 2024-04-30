import React, { useEffect, useState, Navigate, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Page from "./Page";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "../assets/AuthContext";
import { ToastContainer, toast } from 'react-toastify';

import { Button, CssBaseline, TextField, Box, Container, createTheme, ThemeProvider } from '@mui/material/';
import GlobalContext from "../assets/GlobalContext";

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { isLoggedIn, setIsLoggedIn } = useAuth();
    const { handleAlerts } = useContext(GlobalContext);
    console.log({isLoggedIn, setIsLoggedIn});

    const defaultTheme = createTheme();

    async function handleSubmit(e) {
        e.preventDefault();
        console.log(username);
        console.log(password);

        try {
            const response = await axios.post('http://localhost:8000/login', {
                userId: username,
                password: password
            });
            if (response.data.success) {
              console.log('Testing login page response: ', response.data.user)
              Cookies.set('token', response.data.token, { expires: 7 });
              //Cookies.set('user', JSON.stringify(response.data.user), { expires: 7 });
              axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

              console.log('Logged in user roles:', response.data.user.groupname); // Log user roles
              handleAlerts('Log in successfully', true)
              setIsLoggedIn(true); // Update login state
              navigate('/home'); // Redirect to home
            } 
        } catch (error) {
            if (error.response.data.errMessage === "Invalid credentials") {
            //   alert('Invalid credentials')
                handleAlerts('Invalid credentials', false)
            } else if (error.response.data.errMessage == "Please enter username/password") {
              handleAlerts('Invalid credentials', false)
            } else if (error.response.data.errMessage === "Account is disabled") {
              handleAlerts("Account is disabled", false)
            }
            //else if (error.response.data.errMessage == "Please enter username/password") {
                //toast.error('Please enter username/password', {
                    //position: toast.POSITION.TOP_RIGHT
                    console.log('Login error:', error);
          }
          
    }

    return (
    <Page title="Login">
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField 
              margin="normal" 
              required 
              fullWidth 
              id="username" 
              label="Username"
              name="username" 
              autoComplete="username" 
              autoFocus 
              onChange={(e) => setUsername(e.target.value)}/>
            <TextField 
              margin="normal"
              required 
              fullWidth 
              name="password" 
              label="Password" 
              type="password" 
              id="password" 
              autoComplete="off" 
              onChange={(e) => setPassword(e.target.value)}/>
            <Button type="submit" fullWidth variant="contained" 
                    sx={{ mt: 3, mb: 2 }} > Sign In </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
    </Page>
    )
}
export default Login