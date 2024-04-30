import React, { useState, useEffect, useRef } from "react";
import { TextField, Button, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Chip, Stack, Grid, setRef } from '@mui/material/';
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { useContext } from "react";
import { UserManagementContext } from "../assets/UserMgntContext";
import { useAuth } from "../assets/AuthContext";
import GlobalContext from "../assets/GlobalContext";

function CreateUser() {
    const [userData, setUserData] = useState({ username: '', password: '', email: '', userGroups: [], userStatus: 'active' });
    const [groups, setGroups] = useState([]);
    const { IsLoggedIn, setIsLoggedIn } = useAuth();
    const ref = useRef(null);
    const { handleAlerts } = useContext(GlobalContext);

    const { refreshUserData } = useContext(UserManagementContext);

    useEffect(() => {
        // API call to fetch user group data
        const fetchGroups = async () => {
            try {
                const response = await axios.get('http://localhost:8000/users/getAllRoles');
                const groupData = response.data.message.map(group => group.groupname);
                setGroups(groupData);
                
            } catch (error) {
                console.error('Error fetching group data:', error);
                // Handle errors as appropriate
            }
        };
        fetchGroups();

    }, [refreshUserData]);

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleDelete = (valueToDelete) => {
        // This function will be called when a chip's delete icon is clicked
        setUserData(prevState => ({
            ...prevState,
            userGroups: prevState.userGroups.filter(group => group !== valueToDelete)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Aligning the data structure with backend expectations
        const validPattern = /^(?![0-9]*$)[a-zA-Z0-9]+$/ //regex expression for group checking
        if (!validPattern.test(userData.username)) {
            // setError("Group name must be a single word either alpha/alphanumberic")
            handleAlerts('Username can only contain alpha/alphanumeric characters with no spaces', false);
            return;
        }

        const submitData = {
            userId: userData.username,  // Assuming 'username' in frontend corresponds to 'userId' in backend
            password: userData.password,
            email: userData.email,
            groupname: userData.userGroups.join(','), // Join userGroups with a comma
            isactive : userData.userStatus // status of the user can be set to active or disabled
        };
        console.log(submitData);
        try {
            const response = await axios.post('http://localhost:8000/users/createUser', submitData);
            console.log('User creation response:', response.data);
            handleAlerts('User has been created', true);
            refreshUserData();
            setUserData({ username: '', password: '', email: '', userGroups: [], userStatus: 'active' }); // Reset form fields
        } catch (error) {
            console.log('Error creating user:', error);
            if (error.response.data.errMessage == "Password needs to be 8-10char and contains alphanumeric and special character") {
                handleAlerts("Password needs to be 8-10char and contains alphanumeric and special character", false)
            } else if (error.response.data.error.message == `Duplicate entry '${userData.username}' for key 'accounts.PRIMARY'`) {
                handleAlerts(`${userData.username} already exists`, false)
            }else if (error.response.data.errMessage == "Username or password is required") {
                handleAlerts("Username or password is required", false)
                console.log(error.response.data.message)
            } else if (error.response.data.errMessage == "User status is required") {
                handleAlerts("User status is required", false)
            } else if ( error.response.data.errMessage == "Username/password required") {
                handleAlerts("Username/password required", false);
            }
            // setUserData({ username: '', password: '', email: '', userGroups: [], userStatus: ''}); // Reset form fields
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2} alignItems="center" justifyContent="flex-end">
                    <Grid item>
                        <TextField
                            name="username"
                            label="Username"
                            variant="outlined"
                            size="small"
                            value={userData.username}
                            onChange={handleChange}
                            style={{ width: 150 }} // Set specific width
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            name="password"
                            label="Password"
                            variant="outlined"
                            type="password"
                            size="small"
                            value={userData.password}
                            onChange={handleChange}
                            style={{ width: 150 }} // Set specific width
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            name="email"
                            label="Email"
                            variant="outlined"
                            type="email"
                            size="small"
                            value={userData.email}
                            onChange={handleChange}
                            style={{ width: 150 }} // Set specific width
                        />
                    </Grid>
                    <Grid item>
                        <FormControl variant="outlined" size="small" fullWidth>
                            <InputLabel>User Group</InputLabel>
                            <Select
                                multiple
                                name="userGroups"
                                value={userData.userGroups}
                                onChange={handleChange}
                                input={<OutlinedInput label="User Group" />}
                                renderValue={(selected) => (
                                    <Stack direction="row" spacing={1}>
                                        {selected.map((value) => (
                                            <Chip
                                                key={value}
                                                label={value}
                                                deleteIcon={<CancelIcon />}
                                                onDelete={() => handleDelete(value)}
                                                onMouseDown={(event) => event.stopPropagation()} // Prevents Select dropdown from closing
                                            />
                                        ))}
                                    </Stack>
                                )}
                            >
                                {groups.map((group) => (
                                    <MenuItem key={group} value={group}>
                                        {group}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>    
                    </Grid>
                    <Grid item>
                    <FormControl size="small" fullWidth>
                        <Select
                        name="userStatus"

                        value={userData.userStatus}
                        onChange={handleChange}
                        >
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="disabled">Disabled</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                    <Grid item>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            style={{ width: 100 }}> {/* Set specific width */}
                            Create 
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </div>
    );
}

export default CreateUser