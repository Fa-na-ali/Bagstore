import { useState } from 'react'
import { ToastContainer } from 'react-toastify';
import { Outlet } from "react-router";
import { Route, RouterProvider, createRoutesFromElements, createBrowserRouter } from "react-router";
import './App.css'
import Header from './components/Header'
import './pages/auth/register.css'
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ErrorBoundary from './ErrorBoundary';
import OTPVerify from './pages/auth/OTPVerify';
import AdminSidebar from './components/AdminSidebar';
import UserManagement from './pages/admin/UserManagement';
import AddProduct from './pages/admin/products/AddProduct';

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="verify-otp" element={<OTPVerify />} />
      <Route path="admin" element={<UserManagement/>} />
      <Route path="admin/product" element={<AddProduct/>} />
    </Route >
  )
)

function App() {
  return (
    <>
    <ErrorBoundary>
      <Header />
      <ToastContainer position="bottom-right" autoClose={5000} />
      <main>
        <Outlet /> {/* This will render the current route's component */}
      </main>
      <Footer />
      </ErrorBoundary>
    </>
  )
}

export default App
