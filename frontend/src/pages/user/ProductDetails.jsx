import React, { useEffect, useState } from 'react'
import { lazy, Suspense } from 'react';
import { useFetchRelatedProductsQuery, useGetProductByIdQuery } from '../../redux/api/productApiSlice';
import { useNavigate, useParams } from 'react-router';
import { Row, Col, Container, Button, Card, Modal, Image } from 'react-bootstrap'
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/features/cart/cartSlice';
import { useGetAllOffersToAddQuery } from '../../redux/api/usersApiSlice';
import { IMG_URL } from '../../redux/constants';

const Cards = lazy(() => import('../../components/Cards'));

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { data, refetch, isLoading, isError } = useGetProductByIdQuery(id);
  const product = data?.product
  const [quantity, setQuantity] = useState(1);
  const [discounts, setDiscounts] = useState(0);
  const [salesPrices, setSalesPrices] = useState(0)
  const { data: off } = useGetAllOffersToAddQuery()
  const offers = off?.offers
  const { data: products } = useFetchRelatedProductsQuery(id)

  useEffect(() => {
    if (product && offers) {
      let newDiscounts = 0;
      let newSalesPrices = product.price;

      let productDiscount = 0;
      let categoryDiscount = 0;

      // Product Offer Discount
      offers.forEach((offer) => {
        if (offer.name === product.offer) {
          productDiscount = offer.discount;
        }
      });

      // Category Offer Discount
      if (product.category && product.category.offer) {
        offers.forEach((offer) => {
          if (offer.type === "category" && offer.name === product.category.offer) {
            categoryDiscount = offer.discount;
          }
        });
      }

      // Apply the highest discount
      const finalDiscount = Math.max(productDiscount, categoryDiscount);
      newDiscounts = finalDiscount;

      // Calculate Sales Price
      if (finalDiscount !== 0) {
        newSalesPrices = product.price - (finalDiscount / 100) * product.price;
      }

      setDiscounts(newDiscounts);
      setSalesPrices(newSalesPrices);
    }
  }, [product, offers]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading product details.</div>;
  if (!product) return <div>Product not found.</div>;

  //add to cart
  const addToCartHandler = () => {
    dispatch(addToCart({
      ...product,
      originalPrice: product.price,
      discountedPrice: salesPrices,
      discount: (product.price - salesPrices), qty: 1
    }));
    toast.success("Item added successfully");
  };

  return (

    <>
      <section className='background'>
        <Container className=" py-5 ">
          <Row>

            <Col md={6} className="mb-4">

              <Image
                id="mainImage"
                src={`${IMG_URL}${product.pdImage[0]}`}
                alt="Product"
                fluid
                rounded
                className="mb-3 zoom-image"
                style={{ width: "500px", height: "500px", }}
              />


              <div className="d-flex">
                {product.pdImage.slice(0, 5).map((image, index) => (
                  <Image
                    key={index}
                    src={`${IMG_URL}${image}`}
                    alt={`Thumbnail ${index + 1}`}
                    rounded
                    className="thumbnail active"
                    onClick={() => document.getElementById('mainImage').src = `${IMG_URL}${image}`}
                    style={{ width: "80px", height: "80px", objectFit: "cover", cursor: "pointer" }}
                  />
                ))}
              </div>
            </Col>


            <Col md={6}>
              <h2 className="mb-3 caption">{product.name}</h2>
              <p className="text-muted mb-4 caption">ID: {product._id}</p>
              <div className="mb-3">
                {discounts !== 0 ? (
                  <>
                    <span className='text-decoration-line-through text-muted me-2'>
                      ₹{product.price}
                    </span>
                    <span className='text-success fw-bold'>
                      ₹{salesPrices}
                    </span>
                  </>
                ) : (
                  <span>₹{product.price}</span>
                )}

              </div>
              <div className="mb-3">
                {[...Array(product.rating)].map((_, i) => (
                  <i key={i} className="bi bi-star-fill text-warning"></i>
                ))}
                {product.rating < 5 && <i className="bi bi-star-half text-warning"></i>}
                <span className=" caption">Reviews: 4.5 ({20} reviews)</span>
              </div>
              <p className="mb-4 caption">Description: {product.description}</p>
              <div className="mb-4">
                <h5 className='caption'>Color:</h5>
                <div className="btn-group" role="group" aria-label="Color selection">
                  {product.color ? (
                    <React.Fragment>
                      <input
                        type="radio"
                        className="btn-check"
                        name="color"
                        id={product.color}
                        autoComplete="off"
                        defaultChecked
                      />
                      <label className={`btn btn-outline-${product.color.toLowerCase()}`} htmlFor={product.color}>
                        {product.color}
                      </label>
                    </React.Fragment>
                  ) : (
                    <span>No color available</span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="quantity" className="form-label caption">
                  Quantity
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="quantity"
                  value={quantity}
                  min={1}
                  max={5}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  style={{ width: "80px" }}
                />
              </div>
              <Button size="lg" className="mb-3 me-2 button-custom"
                onClick={addToCartHandler}
                disabled={product?.quantity <= 0 || !product?.category?.isExist}>
                <i className="bi bi-cart-plus"></i> Add to Cart
              </Button>
              <Button variant="outline-secondary" size="lg" className="mb-3">
                <i className="bi bi-heart"></i> Add to Wishlist
              </Button>

            </Col>
          </Row>
          <Row>

            <div className='text-center py-5'>
              <h4 className='mt-4 mb-5 heading'><strong>RELATED PRODUCTS</strong></h4>
              <Suspense fallback={<div>Loading Related Products...</div>}>
                <Cards
                  products={products?.relatedProducts}

                />
              </Suspense>
            </div>


          </Row>
        </Container>

      </section>

    </>
  )
}

export default ProductDetails