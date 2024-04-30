import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Page from "./Page";
import {
  Button,
  MenuItem,
  Paper,
  Select,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import Container from "./Container";
import GlobalContext from "../assets/GlobalContext";

function ViewApplication(props) {
  // const { appId } = useParams();
  const [appData, setAppData] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [groupData, setGroupData] = useState([]);
  const [isPL, setIsPL] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();
  const { handleAlerts } = useContext(GlobalContext);
  const [initAppData, setInitAppData] = useState([]);
  const appId = props.appId;

  console.log(
    "This is appId taken from HomePage to be used on ViewApplication: ",
    props.appId
  );

  // This useEffect is running on view applciation page to verify if the user is PL to see edit button
  useEffect(() => {
    console.log("useEffect on View Application running to verify user");
    const validateUser = async () => {
      try {
        const response = await axios.post("http://localhost:8000/checkGroup", {
          groupname: "pl",
        });
        console.log(
          "This is the response from group checking for homepage: ",
          response
        );
        if (response) {
          console.log("User is authorised for add application button");
          setIsPL(true);
        }
      } catch (error) {
        if (error.response.data.errMessage === "Checking group failed") {
          console.log("User is not authorized for add application button");
        }
      }
    };
    validateUser();
  }, []);

  useEffect(() => {
    console.log(
      "Running useEffect on View Application page to get specific app info"
    );
    const fetchAppData = async () => {
      try {
        // const response = await axios.get("http://localhost:8000/app/showApp", {
        //   // app_acronym: appId,
        //   params: { app_acronym: appId }, //use params id here
        // });
        const response = await axios.post("http://localhost:8000/app/showApp", {
          // app_acronym: appId,
          app_acronym: appId, //use params id here
        });
        console.log(
          "App info taken from fetchAppData in ViewApplication: ",
          response.data
        );
        console.log(
          "App info taken from fetchAppData in ViewApplication: ",
          response.data.data.app_startdate
        );
        const formatStartDate = dayjs(
          response.data.data.app_startdate,
          "DD-MM-YYYY"
        );
        const formatEndDate = dayjs(
          response.data.data.app_enddate,
          "DD-MM-YYYY"
        );
        setStartDate(formatStartDate);
        setEndDate(formatEndDate);
        setAppData(response.data.data);
        setInitAppData(response.data.data);
      } catch (error) {
        if (
          error.response.data.errMessage ===
          `There are no applications called ${appId}`
        ) {
          handleAlerts(`There are no applications called ${appId}`, false);
          navigate("/");
        }
      }
    };
    fetchAppData();
  }, [appId]);

  //useEffect to fetch all roles to populate the permissions field
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
        // Handle errors as appropriate
      }
    };
    fetchGroups();
  }, [appId]);

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelClick = () => {
    setAppData(initAppData);
    setIsEditMode(false);
  };

  const handleChange = (e) => {
    setAppData({ ...appData, [e.target.name]: e.target.value });
  };

  // this useEffect is just to see what is contained in appData
  useEffect(() => {
    console.log("appData has been updated:", appData);
    console.log("groupData has been updated:", groupData);
  }, [appData, groupData]);

  const handleStartDateChange = (newValue) => {
    setStartDate(newValue);
    setAppData((prevData) => ({
      ...prevData,
      app_startdate: newValue ? newValue.format("DD-MM-YYYY") : "",
    }));
    // console.log(newValue.format("DD-MM-YYYY")); // Format date
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
    // console.log(newValue.format("DD-MM-YYYY"));
    console.log(
      "This is trying to see what is app data for end date: ",
      appData.app_enddate
    );
  };

  const handleSaveClick = async () => {
    // Implement API call to update the data
    // axios.post('API_ENDPOINT', updatedData);
    try {
      const response = await axios.post(
        "http://localhost:8000/app/editApp",
        appData
      );
      console.log("Response for submit button: ", response);
      handleAlerts("Application information has been updated", true);
      setIsEditMode(false);
    } catch (error) {
      console.log("Catching error for app creation: ", error);
      const errMessage = error.response.data.errMessage;
      handleAlerts(errMessage, false);
      setIsEditMode(true);
    }
  };

  return (
    <Page title="Application Page">
      <Container>
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
          <TableContainer style={{ marginTop: 40 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="h5">
                    <b>View Application</b>
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableHead>
              <TableRow>
                <TableCell colSpan={2}>
                  <Typography variant="h7">
                    <b>App Details</b>
                  </Typography>
                </TableCell>
                <TableCell colSpan={2}>
                  <Typography variant="h7">
                    <b>Permissions</b>
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableRow>
              <TableCell>Acronym:</TableCell>
              <TableCell>
                <TextField
                  name="app_acronym"
                  value={appData && appData ? appData.app_acronym : ""}
                  size="small"
                  disabled={true}
                />
              </TableCell>
              <TableCell>Create Tasks:</TableCell>
              <TableCell>
                <Select
                  name="app_permit_create"
                  size="small"
                  value={(appData && appData.app_permit_create) || ""}
                  disabled={!isEditMode}
                  onChange={handleChange}
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
                  name="app_rnumber"
                  value={appData && appData ? appData.app_rnumber : ""}
                  size="small"
                  disabled={true}
                />
              </TableCell>
              <TableCell>Edit Open Tasks:</TableCell>
              <TableCell>
                <Select
                  name="app_permit_open"
                  value={(appData && appData.app_permit_open) || ""}
                  size="small"
                  disabled={!isEditMode}
                  onChange={handleChange}
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
                  value={appData ? appData.app_description : ""}
                  multiline
                  rows={5}
                  disabled={!isEditMode}
                  onChange={handleChange}
                />
              </TableCell>
              <TableCell>Edit To-Do Tasks:</TableCell>
              <TableCell>
                <Select
                  name="app_permit_todolist"
                  value={appData.app_permit_todolist || ""}
                  size="small"
                  disabled={!isEditMode}
                  onChange={handleChange}
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
                    disabled={!isEditMode}
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
                  value={appData.app_permit_doing || ""}
                  size="small"
                  disabled={!isEditMode}
                  onChange={handleChange}
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
                    disabled={!isEditMode}
                    name="app_enddate"
                    label="End Date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    // renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </TableCell>
              <TableCell>Edit Done Tasks:</TableCell>
              <TableCell>
                <Select
                  name="app_permit_done"
                  size="small"
                  disabled={!isEditMode}
                  value={appData.app_permit_done || ""}
                  onChange={handleChange}
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
              <TableCell colSpan={4} align="center">
                {isPL && (
                  <>
                    {isEditMode ? (
                      <>
                        <Button
                          onClick={handleCancelClick}
                          variant="outlined"
                          color="error"
                          style={{ marginLeft: "10px" }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveClick}
                          variant="contained"
                          color="success"
                          style={{ marginLeft: 20 }}
                        >
                          Save
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={handleEditClick}
                        variant="contained"
                        color="primary"
                      >
                        Edit
                      </Button>
                    )}
                  </>
                )}
              </TableCell>
            </TableRow>
          </TableContainer>
        </Paper>
      </Container>
    </Page>
  );
}

export default ViewApplication;
