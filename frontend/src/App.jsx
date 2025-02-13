import { useState } from 'react'
import { ToastContainer } from 'react-toastify';
import { Outlet } from "react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";
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
import UserManagement from './pages/admin/User/UserManagement';
import AddProduct from './pages/admin/products/AddProduct';
import AdminDashboard from './pages/admin/AdminDashboard';
import CategoryManagement from './pages/admin/Category/CategoryManagement';
import ProductManagement from './pages/admin/products/ProductManagement';
import EditProduct from './pages/admin/products/EditProduct';
import OrderManagement from './pages/admin/Orders/OrderManagement';
import EditCategory from './pages/admin/Category/EditCategory';
import AddCategory from './pages/admin/Category/AddCategory';
import RequireAuth from './pages/auth/RequireAuth';
import GoolgeLogin from './pages/auth/GoogleLogin';



export const GoogleWrapper = () => (
  <GoogleOAuthProvider clientId="691232647580-japcu4npu0jvofkmk8traegt37io5j7e.apps.googleusercontent.com">
    <GoolgeLogin />
  </GoogleOAuthProvider>
)
export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="verify-otp" element={<OTPVerify />} />
      <Route path="google" element={<GoogleWrapper />} />


      <Route path="admin" element={<RequireAuth />}>
        <Route path="users" element={<UserManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="categories/add-category" element={<AddCategory />} />
        <Route path="categories/edit-category/:_id" element={<EditCategory />} />

        <Route path="products" element={<ProductManagement />} />
        <Route path="add-products" element={<AddProduct />} />
        <Route path="products/edit/:_id" element={<EditProduct />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>

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
