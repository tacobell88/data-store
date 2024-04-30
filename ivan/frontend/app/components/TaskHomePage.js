import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Container from "./Container";
import {
  Backdrop,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Grid,
  Modal,
  Paper,
  Stack,
  Typography,
  styled,
} from "@mui/material";
import axios from "axios";
import ViewTask from "./ViewTask";
import CreateTask from "./CreateTask";
import PlansTest from "../testingcomponents/PlansTest";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default function TaskHomePage() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [isPermitted, setIsPermitted] = useState();
  const [openModal, setOpenModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openPlanModal, setOpenPlanModal] = useState(false);

  // for task related data
  const [taskData, setTaskData] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState();
  const [selectedAppAcronym, setSelectedAppAcronym] = useState();
  const [addTaskAcronym, setAddTaskAcronym] = useState();
  const [planAcronym, setPlanAcronym] = useState();

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
        setIsPermitted(false);
      }
      console.log("Error checking permissions: ", error);
    }
  };

  // fetching all task for this application
  const fetchAllTask = async () => {
    try {
      const response = await axios.post("http://localhost:8000/app/tasks/all", {
        task_app_acronym: appId,
      });
      console.log("Fetching all task relating to app: ", response.data.data);
      setTaskData(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePlan = (appId) => {
    navigate(`/app/${appId}/plans`);
  };

  // const handleAddTask = () => {
  //   navigate(`/app/${appId}/task/create`);
  // };

  const handleOpenModal = (task) => {
    console.log("testing handleopenmodal taskid: ", task.task_id);
    console.log("testing handleopenmodal acronym: ", task.task_app_acronym);
    setSelectedTaskId(task.task_id);
    setSelectedAppAcronym(task.task_app_acronym);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    console.log("I am closing");
    setOpenModal(false);
    fetchAllTask();
  };

  const handleAddOpenModal = (app) => {
    console.log("testing handleopenmodal information: ", app);
    setAddTaskAcronym(app);
    setOpenAddModal(true);
  };

  const handleAddCloseModal = () => {
    console.log("I am closing");
    setOpenAddModal(false);
    fetchAllTask();
  };

  const handleOpenPlanModal = (app) => {
    console.log("testing handleopenmodal information: ", app);
    setPlanAcronym(app);
    setOpenPlanModal(true);
  };

  const handleClosePlanModal = () => {
    console.log("I am closing");
    setOpenPlanModal(false);
    fetchAllTask();
  };

  // organize tasks by status
  const openTasks = taskData.filter((task) => task.task_status === "open");
  const todoTasks = taskData.filter((task) => task.task_status === "todo");
  const doingTasks = taskData.filter((task) => task.task_status === "doing");
  const doneTasks = taskData.filter((task) => task.task_status === "done");
  const closedTasks = taskData.filter((task) => task.task_status === "closed");

  useEffect(() => {
    checkPermissions();
    fetchAllTask();
  }, []);

  // function to render task cards
  const renderTaskCard = (task) => (
    <Card
      sx={{ width: 200, marginTop: 2 }}
      key={task.task_id}
      onClick={() => handleOpenModal(task)}
    >
      <CardActionArea>
        <CardContent>
          <Typography gutterBottom variant="h6" component="div">
            {task.task_name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            style={{ marginBottom: 15 }}
          >
            {task.task_id}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            style={{ marginBottom: 15 }}
          >
            {task.task_owner}
          </Typography>
          <Box display="flex" justifyContent="flex-end">
            <Chip label={task.task_plan} />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );

  // console logging create plan name for debugging purposes
  useEffect(() => {
    console.log(`App acronym: ${appId}`);
    console.log(`Is the user permitted: ${isPermitted}`);
    console.log("TaskData state consist of: ", taskData);
    console.log("This is the task_id to be passed to viewTask", selectedTaskId);
    console.log(
      "This is the task_app_acronym to be passed to viewTask",
      selectedAppAcronym
    );
  }, [appId, isPermitted, taskData, selectedTaskId, selectedAppAcronym]);

  return (
    <div>
      <Modal
        open={openAddModal}
        onClose={handleAddCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <CreateTask
          app_acronym={addTaskAcronym}
          handleClose={handleAddCloseModal}
        />
      </Modal>
      <Modal
        open={openPlanModal}
        onClose={handleClosePlanModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <PlansTest
          app_acronym={planAcronym}
          handleClose={handleAddCloseModal}
        />
      </Modal>
      <Container>
        <Grid>
          <Grid item style={{ marginTop: 20 }}>
            <Typography variant="h5">
              <b>{appId} </b>Task Page
            </Typography>
          </Grid>
          <Grid
            item
            container
            spacing={2}
            alignItems="center"
            justifyContent="flex-end"
            style={{ marginTop: 30 }}
          >
            <Button
              variant="contained"
              style={{ marginRight: 20 }}
              // onClick={() => handlePlan(appId)}
              onClick={() => handleOpenPlanModal(appId)}
            >
              Edit Plans
            </Button>
            {/* {isPermitted ? (
              <Button variant="contained" onClick={() => handleAddTask(appId)}>
                Add Task
              </Button>
            ) : (
              ""
            )} */}
            {isPermitted ? (
              <Button
                variant="contained"
                onClick={() => handleAddOpenModal(appId)}
              >
                Add Task
              </Button>
            ) : (
              ""
            )}
          </Grid>
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem />}
            spacing={2}
            style={{ marginTop: 40 }}
          >
            {/* OPEN STATE Column */}
            <Stack direction="column" style={{ width: 210 }}>
              <Chip label="OPEN" />
              {openTasks.map((task) => renderTaskCard(task))}
            </Stack>

            {/* TODO STATE Column */}
            <Stack direction="column" style={{ width: 210 }}>
              <Chip label="TO DO" />
              {todoTasks.map((task) => renderTaskCard(task))}
            </Stack>

            {/* DOING STATE Column */}
            <Stack direction="column" style={{ width: 210 }}>
              <Chip label="DOING" />
              {doingTasks.map((task) => renderTaskCard(task))}
            </Stack>

            {/* DONE STATE Column */}
            <Stack direction="column" style={{ width: 210 }}>
              <Chip label="DONE" />
              {doneTasks.map((task) => renderTaskCard(task))}
            </Stack>

            {/* CLOSED STATE Column */}
            <Stack direction="column" style={{ width: 210 }}>
              <Chip label="CLOSED" />
              {closedTasks.map((task) => renderTaskCard(task))}
            </Stack>

            <Modal
              open={openModal}
              onClose={handleCloseModal}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <ViewTask
                taskId={selectedTaskId}
                app_acronym={selectedAppAcronym}
              />
            </Modal>
          </Stack>
        </Grid>
      </Container>
    </div>
  );
}
