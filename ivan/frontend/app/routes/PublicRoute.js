import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const PublicRoute = ({ children }) => {
    const isAuthenticated = Cookies.get('token');

    return isAuthenticated ? <Navigate to="/home" /> : children;
};

export default PublicRoute;