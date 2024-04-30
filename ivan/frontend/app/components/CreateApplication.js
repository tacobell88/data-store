import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Page from "./Page";
import {
  Button,
  Paper,
  Select,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Typography,
} from "@mui/material";
import GlobalContext from "../assets/GlobalContext";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

function CreateApp() {
  const { handleAlerts } = useContext(GlobalContext);
  const [groupData, setGroupData] = useState([]);
  const [appData, setAppData] = useState({
    app_acronym: "",
    app_description: "",
    app_rnumber: "0",
    app_startdate: "",
    app_enddate: "",
    app_permit_create: "",
    app_permit_open: "",
    app_permit_todolist: "",
    app_permit_doing: "",
    app_permit_done: "",
  });
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const navigate = useNavigate();

  //fetch user groups to populate for drop down list for app permissions
  useEffect(() => {
    // API call to fetch user group data
    const fetchGroups = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/users/getAllRoles"
        );
        console.log(response.data.message);
        const userGroups = response.data.message.map(
          (group) => group.groupname
        );
        setGroupData(userGroups);
      } catch (error) {
        console.error("Error fetching group data:", error);
      }
    };
    fetchGroups();
  }, []);

  //trying out different ways to save date
  const handleStartDateChange = (newValue) => {
    setStartDate(newValue);
    setAppData((prevData) => ({
      ...prevData,
      app_startdate: newValue ? newValue.format("DD-MM-YYYY") : "",
    }));
    //console.log(newValue.format("DD-MM-YYYY")); // Format date
    console.log(
      "This is trying to see what is app data for start date: ",
      appData.app_startdate
    );
  };

  const handleEndDateChange = (newValue) => {
    setEndDate(newValue);
    setAppData((prevData) => ({
      ...prevData,
      app_enddate: newValue ? newValue.format("DD-MM-YYYY") : "",
    }));
    //console.log(newValue.format("DD-MM-YYYY"));
    console.log(
      "This is trying to see what is app data for end date: ",
      appData.app_enddate
    );
  };

  const handleChange = (e) => {
    setAppData({ ...appData, [e.target.name]: e.target.value });
    console.log(
      "This is trying to see what is in app data start date: ",
      appData.app_startdate
    );
    console.log(
      "This is trying to see what is in app data end date: ",
      appData.app_enddate
    );
    console.log("This is trying to see what is in app data: ", appData);
  };

  // handle cancellation of form to bring user back to applications main page
  const handleCancel = async () => {
    navigate("/");
  };

  // handle creating of new application
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newData = {
      app_acronym: appData.app_acronym,
      app_description: appData.app_description,
      app_rnumber: appData.app_rnumber,
      app_startdate: appData.app_startdate,
      app_enddate: appData.app_enddate,
      app_permit_create: appData.app_permit_create,
      app_permit_open: appData.app_permit_open,
      app_permit_todolist: appData.app_permit_todolist,
      app_permit_doing: appData.app_permit_doing,
      app_permit_done: appData.app_permit_done,
    };
    console.log("This is the data to be sent to createApp API: ", newData);
    try {
      const response = await axios.post(
        "http://localhost:8000/app/createApp",
        newData
      );
      console.log(response.data);
      if (response) {
        handleAlerts("Application created", true);
        setStartDate(null);
        setEndDate(null);
        setAppData({
          app_acronym: "",
          app_description: "",
          app_rnumber: "",
          app_startdate: null,
          app_enddate: null,
          app_permit_create: "",
          app_permit_open: "",
          app_permit_todolist: "",
          app_permit_doing: "",
          app_permit_done: "",
        });
      }
    } catch (error) {
      console.log("Catching error for app creation: ", error);
      const errMessage = error.response.data.errMessage;
      if (
        errMessage ===
        `Duplicate entry '${newData.app_acronym}' for key 'applications.PRIMARY'`
      ) {
        handleAlerts(`${newData.app_acronym} already exists`);
      } else {
        handleAlerts(errMessage, false);
      }

      // switch (error.response.data.errMessage) {
      //   case "App rnumber is required":
      //     handleAlerts("App rnumber is required", false);
      //     break;
      //   default:
      //     console.log(error.response.data);
      // if (error.response.data.errMessage === "App acronym is required") {
      //   handleAlerts("App acronym is required", false);
    }
  };
  const preventMinus = (e) => {
    if (e.code === "Minus") {
      e.preventDefault();
    }
  };

  return (
    <Page title="Application Page">
      <Paper
        style={{
          padding: "20px",
          marginTop: 75,
          maxWidth: "1000px",
          marginLeft: "auto",
          marginRight: "auto",
          maxHeight: "80vh", // Adjust the height as needed
          overflowY: "auto",
        }}
      >
        <form onSubmit={handleSubmit}>
          <TableContainer
            container
            direction="column"
            alignItems="center"
            justifyContent="center"
            style={{ marginTop: 40 }}
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="h5" style={{ marginBottom: "20px" }}>
                    <b>Create Application</b>
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableHead>
              <TableRow>
                <TableCell colSpan={2}>
                  <Typography variant="h7">App Details</Typography>
                </TableCell>
                <TableCell colSpan={2}>
                  <Typography variant="h7">Permissions</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableRow>
              <TableCell style={{ paddingRight: 10, width: 100 }}>
                Acronym:
              </TableCell>
              <TableCell>
                <TextField
                  name="app_acronym"
                  label="Enter app acronym"
                  value={appData.app_acronym}
                  onChange={handleChange}
                  size="small"
                />
              </TableCell>
              <TableCell>Create Tasks:</TableCell>
              <TableCell style={{ width: 150 }}>
                <Select
                  name="app_permit_create"
                  value={appData.app_permit_create}
                  onChange={handleChange}
                  size="small"
                >
                  {groupData.map((group, index) => (
                    <MenuItem key={index} value={group}>
                      {group}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>App R number:</TableCell>
              <TableCell>
                <TextField
                  type="number"
                  value={appData.app_rnumber}
                  inputProps={{ min: 0, max: 100000 }}
                  onKeyDown={preventMinus}
                  name="app_rnumber"
                  label="Enter a number"
                  onChange={handleChange}
                  size="small"
                />
              </TableCell>
              <TableCell>Edit Open Tasks:</TableCell>
              <TableCell>
                <Select
                  name="app_permit_open"
                  label="app_permit_open"
                  value={appData.app_permit_open}
                  onChange={handleChange}
                  size="small"
                >
                  {groupData.map((group, index) => (
                    <MenuItem key={index} value={group}>
                      {group}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Description:</TableCell>
              <TableCell>
                <TextField
                  name="app_description"
                  label="Enter a description"
                  multiline
                  rows={10}
                  value={appData.app_description}
                  onChange={handleChange}
                  style={{ width: 500 }}
                  size="small"
                />
              </TableCell>
              <TableCell>Edit To-Do Tasks:</TableCell>
              <TableCell>
                <Select
                  name="app_permit_todolist"
                  label="app_permit_todolist"
                  value={appData.app_permit_todolist}
                  onChange={handleChange}
                  size="small"
                >
                  {groupData.map((group, index) => (
                    <MenuItem key={index} value={group}>
                      {group}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Start Date:</TableCell>
              <TableCell>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    name="app_startdate"
                    label="Start Date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    // renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </TableCell>
              <TableCell>Edit Doing Tasks:</TableCell>
              <TableCell>
                <Select
                  name="app_permit_doing"
                  label="app_permit_doing"
                  value={appData.app_permit_doing}
                  onChange={handleChange}
                  size="small"
                >
                  {groupData.map((group, index) => (
                    <MenuItem key={index} value={group}>
                      {group}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>End Date:</TableCell>
              <TableCell>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    name="app_enddate"
                    label="End Date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </TableCell>
              <TableCell>Edit Done Tasks:</TableCell>
              <TableCell>
                <Select
                  name="app_permit_done"
                  label="app_permit_done"
                  value={appData.app_permit_done}
                  onChange={handleChange}
                  size="small"
                >
                  {groupData.map((group, index) => (
                    <MenuItem key={index} value={group}>
                      {group}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="center" colSpan={2}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleCancel()}
                  style={{ marginLeft: 300 }}
                >
                  Cancel
                </Button>
              </TableCell>
              <TableCell colSpan={2} align="left">
                <Button type="submit" variant="contained" color="success">
                  Save
                </Button>
              </TableCell>
            </TableRow>
          </TableContainer>
        </form>
      </Paper>
    </Page>
  );
}

export default CreateApp;
