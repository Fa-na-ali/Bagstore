import { ToastContainer } from 'react-toastify';
import { lazy, Suspense } from 'react';
import { Spinner } from 'react-bootstrap';
import { Outlet } from "react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Route, createRoutesFromElements, createBrowserRouter } from "react-router";
import './App.css'
import Header from './components/Header'
import './pages/auth/register.css'
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ErrorBoundary from './ErrorBoundary';
import OTPVerify from './pages/auth/OTPVerify';
import AddProduct from './pages/admin/products/AddProduct';
import EditProduct from './pages/admin/products/EditProduct';
import EditCategory from './pages/admin/Category/EditCategory';
import AddCategory from './pages/admin/Category/AddCategory';
import RequireAuth from './pages/auth/RequireAuth';
import GoolgeLogin from './pages/auth/GoogleLogin';
import ForgotPass from './pages/auth/ForgotPass';
import Password from './pages/auth/Password';
import Account from './pages/user/Account';
import AddAddress from './pages/user/AddAddress';
import EditAddress from './pages/user/EditAddress';
import Cart from './pages/order/Cart';
import OrderSuccess from './pages/order/OrderSuccess';
import VerifyOTPPass from './pages/auth/VerifyOTPPass';
import OrderDetails from './pages/admin/Orders/OrderDetails';
import EmailVerify from './pages/user/EmailVerify';
import ChangePassword from './pages/user/ChangePassword';
import Wishlist from './pages/user/Wishlist';
import AddCoupon from './pages/admin/Coupons/AddCoupon';
import CreateOffer from './pages/admin/Offers/CreateOffer';
import EditCoupon from './pages/admin/Coupons/EditCoupon';
import EditOffer from './pages/admin/Offers/EditOffer';
import PendingOrders from './pages/order/PendingOrders';
import PaymentFailure from './pages/order/PaymentFailure';
import Wallet from './pages/user/Wallet';
import TransactionDetail from './pages/admin/Wallets/TransactionDetail';
import Referrals from './pages/user/Referrals';
import About from './pages/user/About';

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard/AdminDashboard'))
const SalesReport = lazy(() => import('./pages/admin/Dashboard/SalesReport'));
const CategoryManagement = lazy(() => import('./pages/admin/Category/CategoryManagement'))
const ProductManagement = lazy(() => import('./pages/admin/products/ProductManagement'))
const UserManagement = lazy(() => import('./pages/admin/User/UserManagement'))
const OrderManagement = lazy(() => import('./pages/admin/Orders/OrderManagement'))
const CouponManagement = lazy(() => import('./pages/admin/Coupons/CouponManagement'))
const OfferManagement = lazy(() => import('./pages/admin/Offers/OfferManagement'))
const WalletManagement = lazy(() => import('./pages/admin/Wallets/WalletManagement'))
const Checkout = lazy(() => import('./pages/order/Checkout'));
const MyOrder = lazy(() => import('./pages/order/MyOrder'));
const OrderDetail = lazy(() => import('./pages/order/OrderDetail'));
const EditProfile = lazy(() => import('./pages/user/EditProfile'));
const ProductsList = lazy(() => import('./pages/user/ProductsList'));
const ProductDetails = lazy(() => import('./pages/user/ProductDetails'));

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
      <Route path="/shop-products" element={
        <Suspense fallback={<div>Loading products...</div>}>
          <ProductsList />
        </Suspense>
      } />
      <Route path="/details/:id" element={
        <Suspense fallback={<div>Loading product...</div>}>
          <ProductDetails />
        </Suspense>
      } />

      {/* protected routes */}
      <Route element={<RequireAuth />}>
        <Route path="/about" element={<About />} />
        <Route path="/account" element={<Account />} />
        <Route path="/account/edit" element={<EditProfile />} />
        <Route path="/account/add-address" element={<AddAddress />} />
        <Route path="/account/edit-address/:id" element={<EditAddress />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/verify-email" element={<EmailVerify />} />
        <Route path="/account/referrals/:id" element={<Referrals />} />


        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/wallet" element={<Wallet />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={
          <Suspense fallback={<div>Loading Checkout...</div>}>
            <Checkout />
          </Suspense>
        } />
        <Route path="/mine" element={
          <Suspense fallback={<div>Loading My Orders...</div>}>
            <MyOrder />
          </Suspense>
        } />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/order-failure" element={<PaymentFailure />} />
        <Route path="/pending/order-details/:id" element={<PendingOrders />} />
        <Route path='/order-details/:id' element={
          <Suspense fallback={<div>Loading Order Details...</div>}>
            <OrderDetail />
          </Suspense>
        } />

        <Route path="/admin/user" element={
          <Suspense fallback={<Spinner animation="border" variant="primary" />}>
            <UserManagement />
          </Suspense>
        } />
        <Route path="/admin/category" element={
          <Suspense fallback={<Spinner animation="border" variant="primary" />}>
            <CategoryManagement />
          </Suspense>
        } />
        <Route path="/admin/category/add" element={<AddCategory />} />
        <Route path="/admin/category/edit/:id" element={<EditCategory />} />

        <Route path="/admin/products" element={
          <Suspense fallback={<Spinner animation="border" variant="primary" />}>
            <ProductManagement />
          </Suspense>
        }
        />
        <Route path="/admin/products/add" element={<AddProduct />} />
        <Route path="/admin/products/edit/:id" element={<EditProduct />} />

        <Route path="/admin/orders" element={
          <Suspense fallback={<Spinner animation="border" variant="primary" />}>
            <OrderManagement />
          </Suspense>
        } />
        <Route path='/admin/orders/edit/:id' element={<OrderDetails />} />

        <Route path="/admin/coupons" element={
          <Suspense fallback={<Spinner animation="border" variant="primary" />}>
            <CouponManagement />
          </Suspense>
        } />
        <Route path="/admin/coupons/add" element={<AddCoupon />} />
        <Route path="/admin/coupons/edit/:id" element={<EditCoupon />} />

        <Route path="/admin/offers" element={
          <Suspense fallback={<Spinner animation="border" variant="primary" />}>
            <OfferManagement />
          </Suspense>
        } />
        <Route path="/admin/offers/add" element={<CreateOffer />} />
        <Route path="/admin/offers/edit/:id" element={<EditOffer />} />

        <Route path="/admin/wallets" element={
          <Suspense fallback={<Spinner animation="border" variant="primary" />}>
            <WalletManagement />
          </Suspense>
        } />
        <Route path="/admin/wallets/edit/:transactionId" element={<TransactionDetail />} />

        <Route path="/admin/dashboard" element={
          <Suspense fallback={<Spinner animation="border" variant="primary" />}>
            <AdminDashboard />
          </Suspense>
        } />
        <Route path="/admin/sales-report" element={
          <Suspense fallback={<Spinner animation="border" variant="primary" />}>
            <SalesReport />
          </Suspense>
        } />


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
