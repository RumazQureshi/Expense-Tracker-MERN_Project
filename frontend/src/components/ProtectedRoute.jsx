import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import Loader from './Loader';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(UserContext);
    const hasToken = !!localStorage.getItem("token");

    if (loading) {
        return <Loader />;
    }

    // If no token at all, or loading finished and no user (and we expected one), redirect
    if (!hasToken || (!user && !loading)) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;
