import {
  Autocomplete,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Select,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import GlobalContext from "../assets/GlobalContext";

const ViewTask = React.forwardRef((props, ref) => {
  const taskId = props.taskId;
  const appAcronym = props.app_acronym;
  const { handleAlerts } = useContext(GlobalContext);
  const [taskData, setTaskData] = useState([]);

  const [inittaskData, setInitTaskData] = useState([]);

  const [allPlans, setAllPlans] = useState([]);
  const [isPermitted, setIsPermitted] = useState();

  const [demotable, setDemotable] = useState(false);
  const [promotable, setPromotable] = useState(false);
  const [disablePlan, setDisablePlan] = useState(false);

  const [editMode, setEditMode] = useState();

  const fetchTaskData = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/app/task/getTask",
        {
          task_id: taskId,
        }
      );
      console.log(response.data.data);
      setTaskData(response.data.data);
      setInitTaskData(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAllPlans = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/app/task/getPlans",
        {
          app_acronym: appAcronym,
        }
      );
      const planData = response.data.data.map((plan) => plan.plan_mvp_name);
      setAllPlans(planData);
      setEditMode(true); // new changes
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        if (inittaskData.length === 0) return;

        const response = await axios.post(
          "http://localhost:8000/checkPerms",
          {
            app_state: taskData[0].task_status,
          },
          {
            params: { app_acronym: appAcronym },
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
    checkPermissions();
  }, [inittaskData]);

  // handle change for input fields
  const handleChange = (event, newValue, name) => {
    if (name === "task_plan") {
      // Handle change for Autocomplete
      setTaskData((prev) =>
        prev.map((task, index) => {
          if (index === 0) {
            return { ...task, [name]: newValue };
          }
          return task;
        })
      );
    } else {
      // Handle change for other inputs
      const { target } = event;
      setTaskData((prev) =>
        prev.map((task, index) => {
          if (index === 0) {
            return { ...task, [target.name]: target.value };
          }
          return task;
        })
      );
      console.log([target.name], ":", target.value);
    }
    console.log(name, ":", newValue);
  };

  // Separate handler for additional notes
  const handleAdditionalNotesChange = (e) => {
    const { value } = e.target;
    setTaskData((currentTaskData) => {
      return currentTaskData.map((task, index) => {
        if (index === 0) {
          return { ...task, task_newNotes: value };
        }
        return task;
      });
    });
  };

  const handleEditClick = () => {
    console.log("clicked");
    setEditMode(true);
  };

  const handleCancelClick = () => {
    setTaskData(inittaskData);
    setEditMode(false);
  };

  const handleSaveClick = async () => {
    // inverting the confirm as a shortcut so that you don't have to wrap it in if else?
    if (!confirm("Are you sure you want to proceed?")) return;
    try {
      //api to send to backend for edittask
      const response = await axios.post(
        "http://localhost:8000/app/task/editTask",
        {
          task_id: taskData[0].task_id,
          task_description: taskData[0].task_description,
          task_status: taskData[0].task_status,
          task_notes: taskData[0].task_newNotes,
          task_plan: taskData[0].task_plan,
          app_acronym: appAcronym,
        }
      );

      handleAlerts("App edited succesffuly", true);
      setEditMode(true);
      fetchTaskData();
    } catch (error) {
      const errMessage = error.response.data.errMessage;
      handleAlerts(errMessage, false);
    }
    fetchTaskData();
  };

  const handlePromoteSaveClick = async () => {
    if (!confirm("Are you sure you want to promote the task?")) return;
    try {
      //api to send to backend for promote task
      const response = await axios.post(
        "http://localhost:8000/app/task/promoteTask",
        {
          task_id: taskData[0].task_id,
          task_description: taskData[0].task_description,
          task_status: taskData[0].task_status,
          task_notes: taskData[0].task_newNotes,
          task_plan: taskData[0].task_plan,
          app_acronym: appAcronym,
        }
      );

      handleAlerts("Task saved & promoted successfully", true);
      setEditMode(true);
      fetchTaskData();
    } catch (error) {
      const errMessage = error.response.data.errMessage;
      handleAlerts(errMessage, false);
    }
  };

  const handleDemoteSaveClick = async () => {
    if (!confirm("Are you sure you want to demote the task?")) return;
    try {
      //api to send to backend for demote task
      const response = await axios.post(
        "http://localhost:8000/app/task/demoteTask",
        {
          task_id: taskData[0].task_id,
          task_description: taskData[0].task_description,
          task_status: taskData[0].task_status,
          task_notes: taskData[0].task_newNotes,
          task_plan: taskData[0].task_plan,
          app_acronym: appAcronym,
        }
      );
      handleAlerts("Task saved & demoted successfully", true);
      setEditMode(true);
      fetchTaskData();
    } catch (error) {
      const errMessage = error.response.data.errMessage;
      handleAlerts(errMessage, false);
    }
  };

  useEffect(() => {
    fetchTaskData();
    fetchAllPlans();
  }, []);

  useEffect(() => {
    // if (taskData.length > 0) {
    console.log("Information in task data: ", taskData);
    if (
      taskData[0]?.task_status === "open" ||
      taskData[0]?.task_status === "todo"
    ) {
      setDemotable(false);
    } else {
      setDemotable(true);
    }
    if (taskData[0]?.task_status === "done") {
      if (inittaskData[0]?.task_plan === taskData[0]?.task_plan) {
        setPromotable(true);
      } else {
        setPromotable(false);
      }
    } else {
      setPromotable(true);
    }
    if (
      taskData[0]?.task_status === "open" ||
      taskData[0]?.task_status === "done"
    ) {
      setDisablePlan(true);
    } else {
      setDisablePlan(false);
    }
  }, [taskData]);

  // OPEN STATE, DOING STATE NO DEMOTING

  return (
    <Paper
      style={{
        padding: "20px",
        marginTop: 75,
        width: "80%", // Adjust the width as needed
        marginLeft: "auto",
        marginRight: "auto",
        maxHeight: "80vh", // Adjust the height as needed
        overflowY: "auto", // Makes content scrollable if it exceeds the height
      }}
    >
      <Typography variant="h5" style={{ marginBottom: 40 }}>
        <b>View Task for {taskId}</b>
      </Typography>
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={3}>
          {taskData.map((row, index) => (
            <>
              <Typography>
                <b> Task Name : </b> {row.task_name}
              </Typography>
              <Typography>
                <b> Task Creator : </b> {row.task_creator}
              </Typography>
              <Typography>
                <b> Task Owner : </b> {row.task_owner}
              </Typography>
              <Typography>
                <b> Task Created Date : </b> {row.task_createdate}
              </Typography>
              <Typography>
                <b> Task Status : </b> {row.task_status}
              </Typography>
              {/* <TextField
                name="task_name"
                disabled={true}
                size="small"
                value={row.task_name || ""}
                fullWidth
                style={{ marginBottom: 15 }}
              /> */}
              <Typography>
                <b>Task Plan</b>
              </Typography>
              <Autocomplete
                name="task_plan"
                disabled={!(editMode && disablePlan && isPermitted)}
                options={allPlans}
                getOptionLabel={(option) => option}
                renderInput={(params) => <TextField {...params} />}
                value={taskData[0]?.task_plan || ""}
                onChange={(event, newValue) =>
                  handleChange(event, newValue, "task_plan")
                }
                fullWidth
                size="small"
                style={{ marginBottom: 15 }}
              />
              <Typography>
                <b>Task Description </b>
              </Typography>
              <TextField
                name="task_description"
                disabled={true}
                // disabled={!(editMode && isPermitted)}
                size="small"
                multiline
                rows={8}
                onChange={handleChange}
                fullWidth
                style={{ marginBottom: 15 }}
                value={row.task_description || ""}
              />
              {/* <Typography>
                <b>Task Owner</b>
              </Typography>
              <TextField
                name="task_owner"
                disabled={true}
                size="small"
                fullWidth
                value={row.task_owner || ""}
                style={{ marginBottom: 15 }}
              /> */}
              {/* <Typography>
                <b>Task Status </b>
              </Typography>
              <TextField
                name="task_status"
                disabled={true}
                size="small"
                fullWidth
                style={{ marginBottom: 15 }}
                value={row.task_status || ""}
              /> */}
              {/* <Typography>
                <b>Task Create Date</b>
              </Typography>
              <TextField
                name="task_createdate"
                disabled={true}
                size="small"
                fullWidth
                style={{ marginBottom: 15 }}
                value={row.task_createdate || ""}
              /> */}

              {/* <Typography>
                <b>Task Creator</b>
              </Typography>
              <TextField
                name="task_creator"
                disabled={true}
                size="small"
                fullWidth
                value={row.task_creator || ""}
                style={{ marginBottom: 15 }}
              /> */}
            </>
          ))}
        </Grid>
        {/* Right Column */}
        <Grid item xs={7}>
          {taskData.map((row) => (
            <>
              <Typography>
                <b>Task Notes </b>
              </Typography>
              <TextField
                name="task_notes"
                multiline
                rows={18}
                fullWidth
                value={row.task_notes}
                disabled={true}
                style={{ maxWidth: 700 }}
              />
            </>
          ))}
        </Grid>
      </Grid>
      {editMode && (
        <Box>
          <Typography>
            <b>Additional Notes</b>
          </Typography>
          <TextField
            name="task_newNotes"
            multiline
            rows={13}
            fullWidth
            disabled={!(editMode && isPermitted)}
            onChange={handleAdditionalNotesChange}
            style={{ maxWidth: 700 }}
          />
        </Box>
      )}
      <Box textAlign="center" sx={{ mt: 3 }}>
        {isPermitted &&
          (editMode ? (
            <>
              {/* 
              <Button
                variant="outlined"
                color="error"
                style={{ marginRight: 10 }}
                onClick={() => handleCancelClick()}
              >
                Cancel
              </Button>
              */}
              <Button
                variant="outlined"
                color="success"
                style={{ marginRight: 10 }}
                onClick={() => handleSaveClick()}
                disabled={!promotable}
              >
                Save
              </Button>
              <Button
                variant="contained"
                color="success"
                style={{ marginRight: 10 }}
                onClick={() => handlePromoteSaveClick()}
                disabled={!promotable}
              >
                Save & Promote
              </Button>
              <Button
                variant="contained"
                color="error"
                style={{ marginRight: 10 }}
                onClick={() => handleDemoteSaveClick()}
                disabled={!demotable}
              >
                Save & demote
              </Button>
            </>
          ) : (
            <Button variant="contained" onClick={() => handleEditClick()}>
              Edit
            </Button>
          ))}
      </Box>
    </Paper>
  );
});

export default ViewTask;
