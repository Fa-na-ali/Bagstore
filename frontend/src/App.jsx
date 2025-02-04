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

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
    </Route >
  )
)

function App() {
  return (
    <>
      <Header />
      <ToastContainer position="bottom-right" autoClose={5000} />
      <main>
        <Outlet /> {/* This will render the current route's component */}
      </main>
      <Footer />
    </>
  )
}

export default App
