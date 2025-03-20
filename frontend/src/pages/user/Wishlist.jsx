import React from 'react'
import { useGetWishlistQuery } from '../../redux/api/productApiSlice'

const Wishlist = () => {

    const {data}=useGetWishlistQuery()
    console.log("wishlist",data)
  return (
    <>
    
    
    <h2>Wishlist</h2>
    
    
    </>
  )
}

export default Wishlist