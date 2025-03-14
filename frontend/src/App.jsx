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
import ProductDetails from './pages/user/ProductDetails';
import ProductsList from './pages/user/ProductsList';
import ForgotPass from './pages/auth/ForgotPass';
import Password from './pages/auth/Password';
import Account from './pages/user/Account';
import EditProfile from './pages/user/EditProfile';
import AddAddress from './pages/user/AddAddress';
import EditAddress from './pages/user/EditAddress';
import Cart from './pages/order/Cart';
import Checkout from './pages/order/Checkout';
import OrderSuccess from './pages/order/OrderSuccess';
import MyOrder from './pages/order/MyOrder';
import VerifyOTPPass from './pages/auth/VerifyOTPPass';
import OrderDetails from './pages/admin/Orders/OrderDetails';
import OrderDetail from './pages/order/OrderDetail';



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
      <Route path="/forgot-password" element={<ForgotPass />} />
      <Route path="/verify-otp-password" element={<VerifyOTPPass />} />

      <Route path="/reset-password" element={<Password />} />
      <Route path="/shop-products" element={<ProductsList />} />
      <Route path="/details/:id" element={<ProductDetails />} />

      {/* protected routes */}
      <Route element={<RequireAuth />}>

        <Route path="/account" element={<Account />} />
        <Route path="/account/edit" element={<EditProfile />} />
        <Route path="/account/add-address" element={<AddAddress />} />
        <Route path="/account/edit-address/:id" element={<EditAddress />} />
 
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout/>} />
        <Route path="/mine" element={<MyOrder/>} />
        <Route path="/order-success" element={<OrderSuccess/>} />
        <Route path='/order-details/:id' element={<OrderDetail/>}/>

        

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/user" element={<UserManagement />} />
        <Route path="/admin/category" element={<CategoryManagement />} />
        <Route path="/admin/category/add" element={<AddCategory />} />
        <Route path="/admin/category/edit/:id" element={<EditCategory />} />

        <Route path="/admin/products" element={<ProductManagement />} />
        <Route path="/admin/products/add" element={<AddProduct />} />
        <Route path="/admin/products/edit/:id" element={<EditProduct />} />

        <Route path="/admin/orders" element={<OrderManagement/>} />
        <Route path='/admin/orders/edit/:id' element={<OrderDetails/>}/>

        


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
