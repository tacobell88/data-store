import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Container from "./Container";
import {
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

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export default function TaskHomePage() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [isPermitted, setIsPermitted] = useState();
  const [openModal, setOpenModal] = useState(false);

  // for task related data
  const [taskData, setTaskData] = useState([]);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

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
  const fetchAllTask = async() => {
    try {
      const response = await axios.post("http://localhost:8000/app/tasks/all", {
        task_app_acronym : appId
      })
      console.log('Fetching all task relating to app: ', response.data.data)
      setTaskData(response.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const handlePlan = (appId) => {
    navigate(`/app/${appId}/plans`);
  };

  const handleAddTask = () => {
    navigate(`/app/${appId}/task/create`);
  };

  useEffect(() => {
    checkPermissions();
    fetchAllTask();
  }, []);

  // console logging create plan name for debugging purposes
  useEffect(() => {
    console.log(`App acronym: ${appId}`);
    console.log(`Is the user permitted: ${isPermitted}`);
    console.log('TaskData state consist of: ',taskData)
  }, [appId, isPermitted, taskData]);

  return (
    <div>
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
              onClick={() => handlePlan(appId)}
            >
              Edit Plans
            </Button>
            {isPermitted ? (
              <Button variant="contained" onClick={() => handleAddTask(appId)}>
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
            <Stack direction="column">
              <Chip label="OPEN" />

              <Card sx={{ width: 200, marginTop: 2 }} onClick={handleOpenModal}>
                <CardActionArea>
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      TaskID
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      style={{ marginBottom: 15 }}
                    >
                      Task Name
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      style={{ marginBottom: 15 }}
                    >
                      Task Owner
                    </Typography>
                    <Box display="flex" justifyContent="flex-end">
                      <Chip label="Plan Name" />
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>

              <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <ViewTask />
              </Modal>
              <Card sx={{ width: 200, marginTop: 2 }} onClick={handleOpenModal}>
                <CardActionArea>
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      TaskID
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      style={{ marginBottom: 15 }}
                    >
                      Task Name
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      style={{ marginBottom: 15 }}
                    >
                      Task Owner
                    </Typography>
                    <Box display="flex" justifyContent="flex-end">
                      <Chip label="Plan Name" />
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
              <Card sx={{ width: 200, marginTop: 2 }} onClick={handleOpenModal}>
                <CardActionArea>
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      TaskID
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      style={{ marginBottom: 15 }}
                    >
                      Task Name
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      style={{ marginBottom: 15 }}
                    >
                      Task Owner
                    </Typography>
                    <Box display="flex" justifyContent="flex-end">
                      <Chip label="Plan Name" />
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Stack>

            {/* TODO STATE Column */}
            <Stack direction="column">
              <Chip label="TO DO" />
              <Card sx={{ width: 200, marginTop: 2 }} onClick={handleOpenModal}>
                <CardActionArea>
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      TaskID
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      style={{ marginBottom: 15 }}
                    >
                      Task Name
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      style={{ marginBottom: 15 }}
                    >
                      Task Owner
                    </Typography>
                    <Box display="flex" justifyContent="flex-end">
                      <Chip label="Plan Name" />
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Stack>

            {/* DOING STATE Column */}
            <Stack direction="column">
              <Chip label="DOING" />

              <Card sx={{ width: 200, marginTop: 2 }} onClick={handleOpenModal}>
                <CardActionArea>
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      TaskID
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      style={{ marginBottom: 15 }}
                    >
                      Task Name
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      style={{ marginBottom: 15 }}
                    >
                      Task Owner
                    </Typography>
                    <Box display="flex" justifyContent="flex-end">
                      <Chip label="Plan Name" />
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Stack>

            {/* DONE STATE Column */}
            <Stack direction="column">
              <Chip label="DONE" />
              <Card sx={{ width: 200, marginTop: 2 }} onClick={handleOpenModal}>
                <CardActionArea>
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      TaskID
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      style={{ marginBottom: 15 }}
                    >
                      Task Name
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      style={{ marginBottom: 15 }}
                    >
                      Task Owner
                    </Typography>
                    <Box display="flex" justifyContent="flex-end">
                      <Chip label="Plan Name" />
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Stack>

            {/* CLOSED STATE Column */}
            <Stack direction="column">
              <Chip label="CLOSED" />
              <Card sx={{ width: 200, marginTop: 2 }} onClick={handleOpenModal}>
                <CardActionArea>
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      TaskID
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      style={{ marginBottom: 15 }}
                    >
                      Task Name
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      style={{ marginBottom: 15 }}
                    >
                      Task Owner
                    </Typography>
                    <Box display="flex" justifyContent="flex-end">
                      <Chip label="Plan Name" variant="outlined" />
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Stack>
          </Stack>
          {/* <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem />}
              spacing={2}
              style={{ marginTop: 40 }}
            >
              <Card sx={{ maxWidth: 345 }}>
                <CardActionArea>
                  <CardMedia
                    component="img"
                    height="140"
                    image="/static/images/cards/contemplative-reptile.jpg"
                    alt="green iguana"
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      Lizard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lizards are a widespread group of squamate reptiles, with
                      over 6,000 species, ranging across all continents except
                      Antarctica
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Stack>
            <Stack
              direction="column"
              divider={<Divider orientation="vertical" flexItem />}
              spacing={2}
              style={{ marginTop: 40 }}
            >
              <Card sx={{ maxWidth: 345 }}>
                <CardActionArea>
                  <CardMedia
                    component="img"
                    height="140"
                    image="/static/images/cards/contemplative-reptile.jpg"
                    alt="green iguana"
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      Lizard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lizards are a widespread group of squamate reptiles, with
                      over 6,000 species, ranging across all continents except
                      Antarctica
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
              <Card sx={{ maxWidth: 345 }}>
                <CardActionArea>
                  <CardMedia
                    component="img"
                    height="140"
                    image="/static/images/cards/contemplative-reptile.jpg"
                    alt="green iguana"
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      Lizard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lizards are a widespread group of squamate reptiles, with
                      over 6,000 species, ranging across all continents except
                      Antarctica
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
              <Card sx={{ maxWidth: 345 }}>
                <CardActionArea>
                  <CardMedia
                    component="img"
                    height="140"
                    image="/static/images/cards/contemplative-reptile.jpg"
                    alt="green iguana"
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      Lizard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lizards are a widespread group of squamate reptiles, with
                      over 6,000 species, ranging across all continents except
                      Antarctica
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
              <Card sx={{ maxWidth: 345 }}>
                <CardActionArea>
                  <CardMedia
                    component="img"
                    height="140"
                    image="/static/images/cards/contemplative-reptile.jpg"
                    alt="green iguana"
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      Lizard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lizards are a widespread group of squamate reptiles, with
                      over 6,000 species, ranging across all continents except
                      Antarctica
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Stack> */}
        </Grid>
      </Container>
    </div>
  );
}
