import React, { useState, useEffect, useContext } from "react";
import ReactDOM from "react-dom/client";
import { Routes, Route, BrowserRouter, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { AuthContext, AuthProvider, useAuth } from "./assets/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

import { ToastContainer, toast } from "react-toastify";

// import StateContext from './assets/StateContext';

//importing built components to use
import Header from "./components/Header";
import Login from "./components/Login";
import HeaderLoggedIn from "./components/HeaderLoggedIn";
import UserManagement from "./components/UserManagement";
import HomePage from "./components/HomePage";
import ExampleTable from "./components/ExampleTable";
import UserProfile from "./components/UserProfile";
import { UserManagementProvider } from "./assets/UserMgntContext";
import GlobalContext from "./assets/GlobalContext";
import ViewApplication from "./components/Application";
import CreateApp from "./components/CreateApplication";
import TaskHomePage from "./components/TaskHomePage";
import PlansTest from "./testingcomponents/PlansTest";
import CreateTask from "./components/CreateTask";

function Component() {
  const [isAdmin, setIsAdmin] = useState(false);
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  // const navigate = useNavigate();
  const handleAlerts = (msg, success) => {
    if (success) {
      toast.success(msg);
    } else {
      toast.error(msg);
    }
  };

  useEffect(() => {
    console.log("Executing useEffect to verify token");
    const tokenValue = Cookies.get("token");

    async function verifyToken() {
      if (tokenValue) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${tokenValue}`;
        try {
          const response = await axios.post(
            "http://localhost:8000/verifyToken",
            {}
          );
          console.log("Verify Token response: ", response.data.message);
          if (response.data.success) {
            console.log("Token verification success: ", response.data.success);
            setIsLoggedIn(true);
          } else {
            // implement a function to throw the the user out if token is invalid
            Cookies.remove("token");
            axios.defaults.headers.common["Authorization"] = "";
            handleAlerts("Invalid Token", false);
            setIsLoggedIn(false);
            navigate("/");
          }
        } catch (error) {
          console.log("Verify Token Error: ", error);
          if (error.response.data.errMessage === "User is disabled") {
            Cookies.remove("token");
            axios.defaults.headers.common["Authorization"] = "";
            handleAlerts("User is disabled", false);
          }

          setIsLoggedIn(false);
          window.location.href = "/";
        }
      }
    }
    verifyToken();
  }, []);

  return (
    <GlobalContext.Provider value={{ handleAlerts }}>
      <BrowserRouter>
        {isLoggedIn ? <Header /> : <div> </div>}
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/home"
            element={
              isLoggedIn && (
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              )
            }
          />
          {/* TO WORK ON DOING A 404 PAGE */}
          <Route
            path="/user-management"
            element={isLoggedIn && <UserManagement />}
          />
          {/* <Route path = '/user-management' element={<UserManagement /> } /> */}
          <Route
            path="/user-profile"
            element={
              isLoggedIn && (
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              )
            }
          />
          <Route
            path="/app/:appId"
            element={
              isLoggedIn && (
                <ProtectedRoute>
                  <ViewApplication />
                </ProtectedRoute>
              )
            }
          />
          {/* <Route path="/app/:appId/plan" element={ isLoggedIn && <ProtectedRoute> <ViewPlan /> </ProtectedRoute>}/> */}
          {/* <Route path="/app/create-app" element={ isLoggedIn && <ProtectedRoute> <CreateApp /> </ProtectedRoute>}/> */}
          {/* 
            <Route
            path="/app/:appId/plans"
            element={
              isLoggedIn && (
                <ProtectedRoute>
                  <Plans />
                </ProtectedRoute>
              )
            }
          />
          */}
          <Route
            path="/app/:appId/plans"
            element={
              isLoggedIn && (
                <ProtectedRoute>
                  <PlansTest />
                </ProtectedRoute>
              )
            }
          />
          <Route
            path="/app/:appId/kanban"
            element={
              isLoggedIn && (
                <ProtectedRoute>
                  <TaskHomePage />
                </ProtectedRoute>
              )
            }
          />
          <Route
            path="/app/:appId/task/create"
            element={
              isLoggedIn && (
                <ProtectedRoute>
                  <CreateTask />
                </ProtectedRoute>
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </GlobalContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.querySelector("#app"));
root.render(
  <AuthProvider>
    <UserManagementProvider>
      <Component />
    </UserManagementProvider>
    <ToastContainer autoClose={1000} pauseOnHover={false} />
  </AuthProvider>
);
if (module.hot) {
  module.hot.accept();
}
