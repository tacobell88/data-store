import React, { useEffect } from "react";
import Page from "./Page.js";
import ExampleTable from "./ExampleTable.js";
import CreateGroup from "./CreateGroup.js";
import CreateUser from "./CreateUser.js";

import { UserManagementProvider } from "../assets/UserMgntContext.js";

function UserManagement () {
    // const [refresh, setRefresh] = useState()
    
    return (
        <UserManagementProvider>
            <Page title="User Management">
                <CreateGroup/>
                <CreateUser/>
                <ExampleTable />
            </Page>
        </UserManagementProvider>
    )
}

export default UserManagement