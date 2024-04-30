// UserManagementContext.js
import React, { createContext, useState } from "react";

export const UserManagementContext = createContext();

export const UserManagementProvider = ({ children }) => {
    const [refreshData, setRefreshData] = useState(false);

    const refreshUserData = () => {
        setRefreshData(prev => !prev); // Toggle to trigger useEffect in child components
    };

    return (
        <UserManagementContext.Provider value={{ refreshUserData, refreshData }}>
            {children}
        </UserManagementContext.Provider>
    );
};
