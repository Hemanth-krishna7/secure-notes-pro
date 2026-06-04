import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

/**
 * Main application routes routing structure.
 * Organizes routes using React Router layout wrapper patterns.
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Landing Route */}
      <Route path="/" element={<Home />} />

      {/* Authentication Pages (nested inside AuthLayout) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Application Protected Pages (nested inside DashboardLayout) */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
};

export default AppRoutes;
