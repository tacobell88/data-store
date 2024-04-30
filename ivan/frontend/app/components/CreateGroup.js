import axios from "axios";
import React, { useState } from "react";
import { TextField, Button, Grid } from '@mui/material/';
import { useContext } from "react";
import { UserManagementContext } from "../assets/UserMgntContext";
import GlobalContext from "../assets/GlobalContext";
import Cookies from "js-cookie";
import { useAuth } from "../assets/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CreateGroup() {
    const [groupName, setGroupName] = useState("");
    // const [error, setError ] = useState("");
    const { handleAlerts } = useContext(GlobalContext);
    const { setIsLoggedIn } = useAuth();
    const navigate = useNavigate();

    const { refreshUserData } = useContext(UserManagementContext);

    async function handleSubmit(e) {
        e.preventDefault();
        
        // user group validation
        const validPattern = /^(?![0-9]*$)[a-zA-Z0-9]+$/ //regex expression for group checking
        if (!validPattern.test(groupName)) {
            // setError("Group name must be a single word either alpha/alphanumberic")
            handleAlerts('Group name must be a single word either alpha/alphanumberic', false);
            setGroupName('');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/users/createRole', {
                groupname: groupName
            });
            handleAlerts('Group successfully added into database', true);
            refreshUserData()
        } catch (error) {
            console.log(error.response.data.errMessage)
            if (error.response.data.errMessage == "User not allowed to view this resource") {
                Cookies.remove('token');
                delete axios.defaults.headers.common['Authorization'];
                setIsLoggedIn(false);
                handleAlerts("User is not an admin", false);
                navigate('/');
            } else if ( error.response.data.errMessage == `Duplicate entry '${groupName}' for key 'grouplist.PRIMARY'`) {
                handleAlerts(`${groupName} already exists`, false);
            } else if (error.response.data.errMessage === "User is disabled") {
                Cookies.remove("token");
                delete axios.defaults.headers.common["Authorization"];
                setIsLoggedIn(false);
                handleAlerts("User is disabled", false);
                navigate("/");
            }
        } finally {
            setGroupName('');
        }
    }

    return (
        <div style={{ textAlign: 'right', padding: '20px', marginTop:20}}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2} justifyContent="flex-end">
                    <Grid item>
                        <TextField
                            label="Group Name"
                            variant="outlined"
                            type="text"
                            placeholder="Enter a group"
                            autoComplete="off"
                            size = "small"
                            value = {groupName}
                            style={{ width: 150 }}
                            onChange={e => setGroupName(e.target.value)}
                        />
                    </Grid>
                    <Grid item>
                        <Button 
                            type="submit"
                            variant="contained" 
                            color="primary"  
                            style={{ width: 100 }}
                        >
                            Create 
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </div>
    );
}
