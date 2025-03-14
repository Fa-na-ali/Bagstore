import React from 'react';
import { Container, Row, Col, Modal, Card, Badge, Button } from 'react-bootstrap';
import { FaHeart } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router';
import { toast } from 'react-toastify';

const Cards = ({ products }) => {
  const imageBaseUrl = 'http://localhost:5004/uploads/';
  const navigate = useNavigate();

  const cartHandler = () => {
    toast.success('Item added to cart');
    navigate('/cart');
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
                  style={{ height: '400px', overflow: 'hidden', position: 'relative' }} // Added position: relative
                >
                  {/* Stock Status Badge */}
                  <div
                    style={{
                      position: 'absolute', // Position the badge absolutely
                      top: '10px', // Distance from the top
                      right: '10px', // Distance from the right
                      zIndex: 1, // Ensure the badge is above the image
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
                  <h6 className='mb-3 caption text-center'>INR {product.price}</h6>

                  <div className='d-flex justify-content-center gap-3 mt-auto'>
                    {/* Add to Cart Button */}
                    <Button
                      className='button-custom'
                      onClick={cartHandler}
                      disabled={product.quantity <= 0 || !product.category?.isExist }
                    >
                      Add to cart
                    </Button>
                    <Button variant='light' className='border icon-hover'>
                      <FaHeart className='text-danger' />
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