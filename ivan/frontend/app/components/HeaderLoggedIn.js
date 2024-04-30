import React, { useContext, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom"; // Import RouterLink
import Cookies from "js-cookie";
import { useAuth } from "../assets/AuthContext";
import axios from "axios";
import GlobalContext from "../assets/GlobalContext";

import MuiLink from "@mui/material/Link"; // Rename to avoid naming conflict
import { Button, createTheme, ThemeProvider } from "@mui/material/";

function HeaderLoggedIn() {
  const { IsLoggedIn, setIsLoggedIn } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { handleAlerts } = useContext(GlobalContext);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await axios.post("http://localhost:8000/checkGroup", {
          groupname: "admin",
        });
        console.log("response from checkAdmin in headerLoggedIn", response);
        if (response) {
          setIsAdmin(true);
        }
      } catch (error) {
        if (error.response.data.message == "Checking group failed") {
          console.log(
            "Error from headerLoggedIn: User is not authorized for user management tab"
          );
          handleAlerts("User is not an admin", false);
          navigate("/");
        }
      }
    };
    checkAdmin();
  }, [setIsLoggedIn]);

  const defaultTheme = createTheme();

  const handleLogout = async () => {
    // Perform logout API call if necessary
    Cookies.remove("token");
    delete axios.defaults.headers.common["Authorization"];
    setIsLoggedIn(false);
    handleAlerts("Log out successfully", true);
    navigate("/"); // Redirect to login page
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <nav>
        {isAdmin && (
          <MuiLink
            component={RouterLink}
            to="/user-management"
            variant="button"
            color="inherit"
            sx={{ my: 1, mx: 1.5 }}
          >
            User Management
          </MuiLink>
        )}
        <MuiLink
          component={RouterLink}
          to="/user-profile"
          variant="button"
          color="inherit"
          sx={{ my: 1, mx: 1.5 }}
        >
          My Profile
        </MuiLink>
      </nav>
      <Button
        variant="outlined"
        sx={{
          my: 1,
          mx: 1.5,
          color: "black", // Text color
          backgroundColor: "white", // Background color
          "&:hover": {
            backgroundColor: "#f5f5f5", // Light grey background on hover
            color: "black",
          },
        }}
        onClick={handleLogout}
      >
        Log Out
      </Button>
    </ThemeProvider>
  );
}

export default HeaderLoggedIn;
