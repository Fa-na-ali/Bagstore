import { useState } from 'react'
import { Route, RouterProvider, createRoutesFromElements,createBrowserRouter } from "react-router";
import './App.css'
import Header from './components/Header'

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}/>
  )
)

function App() {
  return (
    <>
      <Header/>
    </>
  )
}

export default App
