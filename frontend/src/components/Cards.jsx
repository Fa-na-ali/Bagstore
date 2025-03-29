import React, { useState } from 'react';
import { Container, Row, Col, Modal, Card, Badge, Button } from 'react-bootstrap';
import { FaHeart } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { addToCart } from '../redux/features/cart/cartSlice';
import { useUpdateWishlistMutation } from '../redux/api/productApiSlice';

const Cards = ({ products }) => {
  const imageBaseUrl = 'http://localhost:5004/uploads/';
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items =products || products?.all
  const [likedProducts, setLikedProducts] = useState({});
  const [update] = useUpdateWishlistMutation()
  
  const cartHandler = (product) => {
    dispatch(addToCart({ ...product, qty: 1 })); 
    toast.success('Item added to cart');
  
  };

  const toggleLike = async (productId,color) => {
    const isLiked = !likedProducts[productId]; 
    setLikedProducts((prev) => ({ ...prev, [productId]: isLiked })); 

    try {
      if (isLiked) {
        
        const res = await update({productId,color}).unwrap();
        console.log("res",res)
       if(res.status==='success')
        toast.success("Added to Wishlist")
      }else{
         
        const res = await update({productId,color}).unwrap();
        console.log("res",res)
        toast.success("Removed from Wishlist")

      }

    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
      setLikedProducts((prev) => ({ ...prev, [productId]: !isLiked }));
    }
  };

  return (
    <>
      <Row>
        {products?.map((product) => {
          const productImages = product.pdImage?.length
            ? product.pdImage.map((img) => `${imageBaseUrl}${img}`)
            : ['https://via.placeholder.com/300'];
          return (
            <Col key={product._id} lg={4} md={6} className='mb-4'>
              <Card className='shadow-lg hover-shadow h-100 d-flex flex-column'>
                <div
                  className='bg-image hover-zoom ripple ripple-surface ripple-surface-light'
                  style={{ height: '400px', overflow: 'hidden', position: 'relative' }} 
                >
                  {/* Stock Status Badge */}
                  <div
                    style={{
                      position: 'absolute', 
                      top: '10px', 
                      right: '10px', 
                      zIndex: 1, 
                    }}
                  >
                    {product.quantity > 0 ? (
                      <Badge bg='success'>In Stock</Badge>
                    ) : (
                      <Badge bg='danger'>Out of Stock</Badge>
                    )}
                  </div>

                  <Link to={`/details/${product._id}`}>
                    <Card.Img
                      variant='top'
                      src={productImages[0]}
                      className='w-100 h-100'
                      alt={product.name}
                      style={{ objectFit: 'cover' }}
                    />
                  </Link>
                  <div className='hover-overlay'>
                    <div
                      className='mask'
                      style={{ backgroundColor: 'rgba(251, 251, 251, 0.15)' }}
                    ></div>
                  </div>
                </div>
                <Card.Body>
                  <div className='text-reset text-decoration-none'>
                    <Card.Title className='mb-3 caption text-decoration-none text-center'>
                      {product.name}
                    </Card.Title>
                  </div>
                  <div className='text-reset text-decoration-none text-center'>
                    <p className='caption'>{product.color}</p>
                  </div>
                  <div className='text-center mb-3'>
                    {product.salesPrice ? (
                      product.salesPrice !== product.price ? (
                        <>
                          <span className='text-decoration-line-through text-muted me-2'>
                            ₹{product.price}
                          </span>
                          <span className='text-success fw-bold'>
                            ₹{product.salesPrice}
                          </span>
                        </>
                      ) : (
                        <span className='caption'>₹{product.price}</span>
                      )
                    ) : (
                      <span className='caption'>₹{product.price}</span>
                    )}
                  </div>

                  <div className='d-flex justify-content-center gap-3 mt-auto'>
                    {/* Add to Cart Button */}
                    <Button
                      className='button-custom'
                      onClick={()=>cartHandler(product)}
                      disabled={product.quantity <= 0 || !product.category?.isExist }
                    >
                      Add to cart
                    </Button>
                    <Button
                      variant='light'
                      className='border icon-hover'
                      onClick={() => toggleLike(product._id,product.color)} 
                    >
                      <FaHeart
                        className={likedProducts[product._id] ? 'text-danger' : 'text-muted'} 
                      />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </>
  );
};

export default Cards;