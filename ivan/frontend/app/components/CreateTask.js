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
  makeStyles,
  Grid,
  Box,
  Autocomplete,
} from "@mui/material";
import GlobalContext from "../assets/GlobalContext";
import { useNavigate, useParams } from "react-router-dom";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";

// const useStyles = makeStyles((theme) => ({
//   root: {
//     "& .MuiTextField-root": {
//       margin: theme.spacing(1),
//     },
//   },
//   textarea: {
//     resize: "both",
//   },
// }));

export default function CreateTask(props) {
  //const classes = useStyles();

  // const { appId } = useParams();
  const appId = props.app_acronym;
  const handleClose = props.handleClose;
  const navigate = useNavigate();
  // used for showing errors in UI
  const { handleAlerts } = useContext(GlobalContext);
  const [isPermitted, setIsPermitted] = useState();
  const [allPlans, setAllPlans] = useState([]);

  const [taskData, setTaskData] = useState({
    task_name: "",
    task_description: null,
    task_notes: "",
    task_plan: null,
    task_app_acronym: appId,
  });

  const checkPermissions = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/checkPerms",
        {
          app_state: "create",
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
        const errMessage = error.response.data.errMessage;
        setIsPermitted(false);
        handleAlerts(errMessage, false);
        navigate("/");
      }
      console.log("Error checking permissions: ", error);
    }
  };

  const fetchAllPlans = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/app/task/getPlans",
        {
          app_acronym: appId,
        }
      );
      const planData = response.data.data.map((plan) => plan.plan_mvp_name);
      setAllPlans(planData);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
    console.log(taskData);
  };
  // const handleChange = (event, newValue, name) => {
  //   if (name === "task_plan") {
  //     // Handle change for Autocomplete
  //     setTaskData((prev) =>
  //       prev.map((task, index) => {
  //         if (index === 0) {
  //           return { ...task, [name]: newValue };
  //         }
  //         return task;
  //       })
  //     );
  //   } else {
  //     const { target } = event;
  //     setTaskData((prev) =>
  //       prev.map((task, index) => {
  //         if (index === 0) {
  //           return { ...task, [target.name]: target.value };
  //         }
  //         return task;
  //       })
  //     );
  //     console.log([target.name], ":", target.value);
  //   }
  //   console.log(name, ":", newValue);
  // };

  const handlePlanChange = (newValue, name) => {
    setTaskData({ ...taskData, [name]: newValue });
    console.log(taskData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log({
      task_name: taskData.task_name,
      task_description: taskData.task_description,
      task_plan: taskData.task_plan,
      task_notes: taskData.task_notes,
      task_app_acronym: appId,
    });
    try {
      const response = await axios.post(
        "http://localhost:8000/app/task/create",
        {
          task_name: taskData.task_name,
          task_description: taskData.task_description,
          task_plan: taskData.task_plan,
          task_notes: taskData.task_notes,
          task_app_acronym: appId,
        }
      );
      handleAlerts("Task created successfully", true);
      setTaskData(null);
      handleClose();
    } catch (error) {
      const errMessage = error.response.data.errMessage;
      handleAlerts(errMessage, false);
    }
  };

  useEffect(() => {
    checkPermissions();
    fetchAllPlans();
  }, []);

  return (
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
        <Typography variant="h5" style={{ marginBottom: 40 }}>
          <b>Create Task for {appId}</b>
        </Typography>
        <Grid container spacing={2}>
          <Grid container item xs={6} direction="column">
            <Typography>Task Name</Typography>
            <TextField
              size="small"
              name="task_name"
              onChange={handleChange}
            ></TextField>
            <Typography style={{ marginTop: 20 }}>Task Description</Typography>
            <TextField
              size="small"
              name="task_description"
              onChange={handleChange}
              multiline
              rows={12}
            ></TextField>
            <Typography style={{ marginTop: 20 }}>Task Plan</Typography>
            <Autocomplete
              name="task_plan"
              options={allPlans}
              getOptionLabel={(option) => option}
              renderInput={(params) => <TextField {...params} />}
              size="small"
              onChange={(event, newValue) =>
                handlePlanChange(newValue, "task_plan")
              }
              fullWidth
              style={{ marginBottom: 15 }}
            />
          </Grid>
          <Grid container item xs={6} direction="column">
            <Typography>Task Notes</Typography>
            <TextField
              multiline
              rows={20}
              name="task_notes"
              onChange={handleChange}
            ></TextField>
          </Grid>
        </Grid>
        <Box textAlign="center">
          <Button type="submit" variant="contained" style={{ marginTop: 25 }}>
            Create
          </Button>
        </Box>
      </form>
    </Paper>
  );
}
