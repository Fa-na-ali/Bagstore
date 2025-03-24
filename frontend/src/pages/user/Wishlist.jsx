import React from 'react'
import { useGetWishlistQuery } from '../../redux/api/productApiSlice'
import { Badge, Card, Col, Row,Button, Container } from 'react-bootstrap'
import { FaTrash } from 'react-icons/fa'
import { Link } from 'react-router'

const Wishlist = () => {
  const imageBaseUrl = 'http://localhost:5004/uploads/';
    const {data, refetch}=useGetWishlistQuery()
    console.log("wishlist",data)
    const products=data?.wishlist
    const [removeFromWishlist] = useRemoveFromWishlistMutation();

    const cartHandler = (product) => {
        dispatch(addToCart({ ...product, qty: 1 })); 
        toast.success('Item added to cart');
        removeHandler(product)
      
      };

    const removeHandler=async(productId)=>{
      try {
        await removeFromWishlist(productId).unwrap();
        refetch(); 
      } catch (error) {
        console.error("Error removing product:", error);
      }

    }
  return (
    <>
    <section className='background'>
    <h2 className='text-center py-5 heading'>WISHLIST</h2>
    <Container>
    <Row>
        {products?.map((product) => {
          const productImages = product?.productId?.pdImage?.length
            ? product.productId.pdImage.map((img) => `${imageBaseUrl}${img}`)
            : ['https://via.placeholder.com/300'];
          return (
            <Col key={product.productId._id} lg={4} md={4} className='mb-4'>
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
                    {product.productId.quantity > 0 ? (
                      <Badge bg='success'>In Stock</Badge>
                    ) : (
                      <Badge bg='danger'>Out of Stock</Badge>
                    )}
                  </div>

                  <Link to={`/details/${product.productId._id}`}>
                    <Card.Img
                      variant='top'
                      src={productImages[0]}
                      className='w-100 h-100'
                      alt={product.productId.name}
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
                      {product.productId.name}
                    </Card.Title>
                  </div>
                  <div className='text-reset text-decoration-none text-center'>
                    <p className='caption'>{product.color}</p>
                  </div>
                  <h6 className='mb-3 caption text-center'>INR {product.productId.price}</h6>

                  <div className='d-flex justify-content-center gap-3 mt-auto'>
                    {/* Add to Cart Button */}
                    <Button
                      className='button-custom'
                      onClick={()=>cartHandler(product.productId)}
                      disabled={product.productId.quantity <= 0 || !product.productId.category?.isExist }
                    >
                      Add to cart
                    </Button>
                    <Button
                      variant='danger'
                      className='border icon-hover'
                      onClick={()=>{removeHandler(product.productId._id)}}
                    >
                      <FaTrash
                        
                      />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    
      </Container>
      </section>
    </>
  )
}

export default Wishlist