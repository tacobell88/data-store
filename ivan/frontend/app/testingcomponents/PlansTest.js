import {
  Button,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import GlobalContext from "../assets/GlobalContext";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CreateIcon from "@mui/icons-material/Create";

function PlansTest(props) {
  // const { appId } = useParams();
  const appId = props.app_acronym;

  //used to set plan data to display in the table
  const [planData, setPlanData] = useState([]);
  // used for top of table craete plan form
  const [planCreateStartDate, setPlanCreateStartDate] = useState(null);
  const [planCreateEndDate, setPlanCreateEndDate] = useState(null);
  const [planCreateName, setPlanCreateName] = useState("");

  const [planStartDateChange, setPlanStartDateChange] = useState(null);
  const [planEndDateChange, setPlanEndDateChange] = useState(null);

  // used for showing errors in UI
  const { handleAlerts } = useContext(GlobalContext);

  // used to manipulate row edits
  // const [isEditMode, setIsEditMode] = useState();
  const [isEditID, setIsEditID] = useState(-1);

  const [isPermitted, setIsPermitted] = useState();

  // implement a useEffect to check if user is permitted to view buttons
  const checkPermissions = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/checkPerms",
        {
          app_state: "open",
        },
        {
          params: { app_acronym: appId },
        }
      );
      console.log(response);
      if (response.data.success === true) {
        setIsPermitted(true);
      }
    } catch (error) {
      if (error.response.data.success === false) {
        setIsPermitted(false);
      }
      console.log("Error checking permissions: ", error);
    }
  };

  const fetchAllPlans = async () => {
    setPlanData([]);
    try {
      const response = await axios.get(
        "http://localhost:8000/app/plan/getAllPlans",
        {
          params: { plan_app_acronym: appId },
        }
      );
      console.log(response.data.data);
      if (response) {
        console.log(response.data.data);
        setPlanData(response.data.data);
      }
    } catch (error) {
      console.log("Catching error for app creation: ", error);
      const errMessage = error.response.data.errMessage;
      handleAlerts(errMessage, false);
    }
  };

  useEffect(() => {
    checkPermissions();
    fetchAllPlans();
  }, []);

  // function to handle when start date changes
  const handleCreateStartDateChange = (startDateValue) => {
    // handling the way date is parsed
    if (startDateValue) {
      setPlanCreateStartDate(startDateValue.format("DD-MM-YYYY"));
    } else {
      setPlanCreateStartDate(null);
    }
  };

  // function to handle when end date changes
  const handleCreateEndDateChange = (endDateValue) => {
    if (endDateValue) {
      setPlanCreateEndDate(endDateValue.format("DD-MM-YYYY"));
    } else {
      setPlanCreateEndDate(null);
    }
  };

  const handlePlanCreateSubmit = async (e) => {
    //implement API call to create plan
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8000/app/plan/createPlan",
        {
          plan_mvp_name: planCreateName,
          plan_startdate: planCreateStartDate,
          plan_enddate: planCreateEndDate,
        },
        {
          params: { plan_app_acronym: appId },
        }
      );
      console.log(response);
      setPlanCreateName("");
      setPlanCreateStartDate(null);
      setPlanCreateEndDate(null);
      handleAlerts("Plan created successfully", true);
      fetchAllPlans();
    } catch (error) {
      console.log("Error in create plan submit : ", error);
      const errMessage = error.response.data.errMessage;
      handleAlerts(errMessage, false);
    }
  };

  const handlePlanStartDateChange = (planStartDateValue) => {
    //console.log("Start Date Value: ", planStartDateValue.format("DD-MM-YYYY"));
    if (planStartDateValue) {
      setPlanStartDateChange(planStartDateValue.format("DD-MM-YYYY"));
    } else {
      setPlanStartDateChange(null);
    }
  };

  const handlePlanEndDateChange = (planEndDateValue) => {
    //console.log("End Date Value: ", planEndDateValue.format("DD-MM-YYYY"));
    if (planEndDateValue) {
      setPlanEndDateChange(planEndDateValue.format("DD-MM-YYYY"));
    } else {
      setPlanEndDateChange(null);
    }
  };

  const handleEditClick = (rowId) => {
    console.log(`This is the row id: ${rowId}`);
    setIsEditID(rowId);

    setPlanStartDateChange(planData[rowId].plan_startdate);
    setPlanEndDateChange(planData[rowId].plan_enddate);
  };

  const handleSaveClick = async (rowName) => {
    console.log(rowName);
    // console.log(planData);
    const editedPlanName = planData.find(
      (plan) => plan.plan_mvp_name === rowName
    );
    console.log(editedPlanName);
    if (editedPlanName) {
      try {
        const newPlanData = {
          plan_mvp_name: editedPlanName.plan_mvp_name,
          plan_startdate: planStartDateChange,
          plan_enddate: planEndDateChange,
          plan_app_acronym: editedPlanName.plan_app_acronym,
        };
        console.log(newPlanData);

        const response = await axios.post(
          "http://localhost:8000/app/plan/editPlan",
          newPlanData
        );
        handleAlerts("Plan updated successfully", true);
        setIsEditID(-1);
        fetchAllPlans();
      } catch (error) {
        console.log(error);
        const errMessage = error.response.data.errMessage;
        handleAlerts(errMessage, false);
      }
    }
  };

  const handleCancelClick = async (e) => {
    e.preventDefault();

    fetchAllPlans();
    setIsEditID(-1);
  };

  // console logging create plan name for debugging purposes
  useEffect(() => {
    console.log(
      `Plan app acronym: ${appId} Updated plan name: ${planCreateName} Updated start date: ${planCreateStartDate} Updated end date: ${planCreateEndDate}`
    );
    console.log(`Is the user permitted: ${isPermitted}`);
  }, [planCreateName, planCreateEndDate, planCreateStartDate, isPermitted]);

  return (
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
        <Grid
          container
          spacing={20}
          justifyContent="flex-end"
          style={{ marginTop: 20, marginBottom: 20 }}
        >
          {isPermitted ? (
            <form onSubmit={handlePlanCreateSubmit}>
              <TextField
                name="plan_mvp_name"
                value={planCreateName}
                label="Plan Name"
                size="small"
                style={{ marginRight: 20 }}
                onChange={(e) => setPlanCreateName(e.target.value)}
              ></TextField>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={
                    planCreateStartDate
                      ? dayjs(planCreateStartDate, "DD-MM-YYYY")
                      : null
                  }
                  label="Start Date"
                  sx={{ width: 180, marginRight: 2 }}
                  slotProps={{ textField: { size: "small" } }}
                  onChange={handleCreateStartDateChange}
                ></DatePicker>
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={
                    planCreateEndDate
                      ? dayjs(planCreateEndDate, "DD-MM-YYYY")
                      : null
                  }
                  label="End Date"
                  sx={{ width: 180, marginRight: 2 }}
                  slotProps={{ textField: { size: "small" } }}
                  onChange={handleCreateEndDateChange}
                ></DatePicker>
              </LocalizationProvider>
              <Button
                type="submit"
                variant="contained"
                style={{ marginRight: 100 }}
              >
                Add Plan
              </Button>
            </form>
          ) : (
            <></>
          )}
        </Grid>
        <Grid>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Plan Name</TableCell>
                <TableCell>Plan Start Date</TableCell>
                <TableCell>Plan End Date</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {planData &&
                planData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={row.plan_mvp_name}
                        disabled
                      ></TextField>
                    </TableCell>
                    <TableCell>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          sx={{ width: 180 }}
                          slotProps={{ textField: { size: "small" } }}
                          value={dayjs(row.plan_startdate, "DD-MM-YYYY")}
                          onChange={handlePlanStartDateChange}
                          disabled={!(isEditID === index)}
                        ></DatePicker>
                      </LocalizationProvider>
                    </TableCell>
                    <TableCell>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          sx={{ width: 180 }}
                          slotProps={{ textField: { size: "small" } }}
                          value={dayjs(row.plan_enddate, "DD-MM-YYYY")}
                          onChange={handlePlanEndDateChange}
                          disabled={!(isEditID === index)}
                        ></DatePicker>
                      </LocalizationProvider>
                    </TableCell>
                    <TableCell style={{ width: "250px", textAlign: "center" }}>
                      {isEditID === index ? (
                        <>
                          <Button
                            variant="outlined"
                            color="error"
                            style={{ marginRight: 10 }}
                            onClick={(e) => handleCancelClick(e)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() => handleSaveClick(row.plan_mvp_name)}
                          >
                            Save
                          </Button>
                        </>
                      ) : (
                        isPermitted && (
                          <Button
                            onClick={() => handleEditClick(index)}
                            style={{ alignItems: "center" }}
                            startIcon={<CreateIcon />}
                          >
                            Edit
                          </Button>
                        )
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Grid>
      </Paper>
    </Container>
  );
}

export default PlansTest;
