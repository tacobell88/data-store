import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = Cookies.get('token'); // Change based on how you store authentication status

    return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute
