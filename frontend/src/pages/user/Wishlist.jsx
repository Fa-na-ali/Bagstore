import React, { useEffect, useState } from 'react'
import { useGetWishlistQuery, useRemoveFromWishlistMutation, useUpdateWishlistMutation } from '../../redux/api/productApiSlice'
import { Badge, Card, Col, Row, Button, Container } from 'react-bootstrap'
import { FaTrash } from 'react-icons/fa'
import { Link } from 'react-router'
import { useDispatch } from 'react-redux'
import { addToCart } from '../../redux/features/cart/cartSlice'
import { toast } from 'react-toastify'
import { useGetAllOffersToAddQuery } from '../../redux/api/usersApiSlice'

const Wishlist = () => {
  const [discounts, setDiscounts] = useState({});
  const [salesPrices, setSalesPrices] = useState({})
  const imageBaseUrl = 'http://localhost:5004/uploads/';
  const { data, refetch } = useGetWishlistQuery()
  console.log("wishlist", data)
  const { data: off } = useGetAllOffersToAddQuery()
  console.log(off)
  const offers = off?.offers
  const products = data?.wishlist
  const [update] = useUpdateWishlistMutation()
  const dispatch = useDispatch()


 useEffect(() => {
  if (!products || !offers) return;

    const newDiscounts = {};
    const newSalesPrices = {};

    products.forEach((product) => {
      let productDiscount = 0;
      let categoryDiscount = 0;

      // Find Product Offer Discount
      offers.forEach((offer) => {
        if (offer.name === product.productId.offer) {
          productDiscount = offer.discount;
        }
      });

      // Find Category Offer Discount
      if (product.productId.category && product.productId.category.offer) {
        offers.forEach((offer) => {
          if (offer.type === "category" && offer.name === product.productId.category.offer) {
            categoryDiscount = offer.discount;
          }
        });
      }

      // Apply the highest discount
      const finalDiscount = Math.max(productDiscount, categoryDiscount);
      newDiscounts[product.productId._id] = finalDiscount;

      // Calculate Sales Price
      if (finalDiscount !== 0) {
        newSalesPrices[product.productId._id] = product.productId.price - (finalDiscount / 100) * product.productId.price;
      } else {
        newSalesPrices[product.productId._id] = product.productId.price;
      }
    });

    setDiscounts(newDiscounts);
    setSalesPrices(newSalesPrices);
  }, [products, offers]);



  const cartHandler = (product) => {

    const finalPrice = salesPrices[product._id] || product.price;
    dispatch(addToCart({
      ...product,
      originalPrice: product.price,
      discountedPrice: finalPrice,
      discount: (product.price - finalPrice), qty: 1
    }));
    toast.success('Item added to cart');
    removeHandler(product)

  };

  const removeHandler = async (productId) => {
    try {
      console.log(productId)
      const res = await update({ productId, }).unwrap();
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
                ? product?.productId?.pdImage.map((img) => `${imageBaseUrl}${img}`)
                : ['https://via.placeholder.com/300'];
              return (
                <Col key={product?.productId?._id} lg={4} md={4} className='mb-4'>
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
                        {product?.productId?.quantity > 0 ? (
                          <Badge bg='success'>In Stock</Badge>
                        ) : (
                          <Badge bg='danger'>Out of Stock</Badge>
                        )}
                      </div>

                      <Link to={`/details/${product?.productId?._id}`}>
                        <Card.Img
                          variant='top'
                          src={productImages[0]}
                          className='w-100 h-100'
                          alt={product?.productId?.name}
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
                          {product?.productId?.name}
                        </Card.Title>
                      </div>
                      <div className='text-reset text-decoration-none text-center'>
                        <p className='caption'>{product.color}</p>
                      </div>
                      <div className='text-center mb-3'>
                  {discounts[product.productId._id] !== 0 ? (
                    <>
                      <span className='text-decoration-line-through text-muted me-2'>
                        ₹{product.productId.price}
                      </span>
                      <span className='text-success fw-bold'>
                        ₹{salesPrices[product.productId._id]}
                      </span>
                    </>
                  ) : (
                    <span>₹{product.productId.price}</span>
                  )}
                  </div>

                      <div className='d-flex justify-content-center gap-3 mt-auto'>
                        {/* Add to Cart Button */}
                        <Button
                          className='button-custom'
                          onClick={() => cartHandler(product?.productId)}
                          disabled={product?.productId?.quantity <= 0 || !product?.productId?.category?.isExist}
                        >
                          Add to cart
                        </Button>
                        <Button
                          variant='danger'
                          className='border icon-hover'
                          onClick={() => { removeHandler(product?.productId?._id) }}
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