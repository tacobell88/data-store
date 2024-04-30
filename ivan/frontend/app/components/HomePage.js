import React, { useState, useEffect, useContext } from "react";
import { Link, Route, useNavigate, useParams } from "react-router-dom";
import Page from "./Page";
import {
  Box,
  Button,
  Grid,
  Modal,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import MuiLink from "@mui/material/Link";
import CreateApp from "./CreateApplication";
import GlobalContext from "../assets/GlobalContext";
import ViewApplication from "./Application";

function HomePage() {
  const [appData, setAppData] = useState();
  const [isPL, setIsPL] = useState("");
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { handleAlerts } = useContext(GlobalContext);

  // for view application details modal
  const [selectedAppId, setSelectedAppId] = useState(null); // New state to track the selected appId
  const [viewModalOpen, setViewModalOpen] = useState(false); // State to control the visibility of the ViewApplication modal

  // useEffect in place to check user group to see if it's PM
  // only PM is allowed to have 'Add Application' button
  useEffect(() => {
    console.log("useEffect on Home Page running to verify user");
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

  const fetchAppData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/app/showAllApps");
      console.log("This is the fetched application data: ", response);
      setAppData(
        response.data.data.map((application) => ({
          ...application,
          app_description: application.app_description || "",
        }))
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAppData();
  }, []);

  const handleAdd = () => {
    //routing to create application page
    //navigate('/app/create-app')
    setOpen(true);
  };

  // const handleView = (appId) => {
  //   navigate(`/app/${appId}`);
  // };

  const handleView = (appId) => {
    setSelectedAppId(appId); // Set the selected appId
    setViewModalOpen(true); // Open the modal
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    fetchAppData();
  };

  const handleKanban = (appId) => {
    navigate(`/app/${appId}/kanban`);
  };

  const handleClose = () => {
    fetchAppData();
    setOpen(false);
  };

  useEffect(() => {
    console.log(
      "This is appId to be passed onto viewApplication: ",
      selectedAppId
    );
  }, [selectedAppId]);

  return (
    <Page title="Home Page">
      <div>
        <Grid>
          <Grid
            container
            spacing={2}
            alignItems="center"
            justifyContent="flex-end"
            style={{ marginTop: 30 }}
          >
            {isPL ? (
              <Button
                onClick={handleAdd}
                color="primary"
                variant="contained"
                startIcon={<AddIcon />}
              >
                Add Application
              </Button>
            ) : (
              ""
            )}
            <Modal open={open} onClose={handleClose}>
              <CreateApp />
            </Modal>
          </Grid>
          <Grid item>
            <Paper style={{ marginTop: 20 }}>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
              >
                <TableContainer>
                  <TableHead sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableRow>
                      <TableCell> Acronym </TableCell>
                      <TableCell> Start Date </TableCell>
                      <TableCell> End Date </TableCell>
                      <TableCell> Create Permit Role </TableCell>
                      <TableCell> Open Permit Role </TableCell>
                      <TableCell> Todo Permit Role </TableCell>
                      <TableCell> Doing Permit Role </TableCell>
                      <TableCell> Done Permit Role </TableCell>
                      <TableCell> </TableCell>
                      <TableCell> </TableCell>
                      <TableCell> </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {appData &&
                      appData.map((row) => (
                        <TableRow key={row.app_acronym}>
                          <TableCell>{row.app_acronym}</TableCell>
                          <TableCell>{row.app_startdate}</TableCell>
                          <TableCell>{row.app_enddate}</TableCell>
                          <TableCell>{row.app_permit_create}</TableCell>
                          <TableCell>{row.app_permit_open}</TableCell>
                          <TableCell>{row.app_permit_todolist}</TableCell>
                          <TableCell>{row.app_permit_doing}</TableCell>
                          <TableCell>{row.app_permit_done}</TableCell>
                          <TableCell>
                            <Button
                              onClick={() => handleView(row.app_acronym)}
                              variant="outlined"
                            >
                              View
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => handleKanban(row.app_acronym)}
                              variant="contained"
                            >
                              Kanban
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </TableContainer>
                {/* <Modal open={viewModalOpen} onClose={handleCloseViewModal}>
                              {selectedAppId && <ViewApplication appId={selectedAppId} />}
                            </Modal> */}
                <Modal open={viewModalOpen} onClose={handleCloseViewModal}>
                  <ViewApplication appId={selectedAppId} />
                  {/* <div style={{ backgroundColor: 'white', padding: '20px' }}>
                    Test Modal Content
                  </div> */}
                </Modal>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </Page>
  );
}

export default HomePage;
