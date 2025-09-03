import { useEffect, useState } from 'react';
import { Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { FaHeart } from 'react-icons/fa';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import { useAddToCartMutation, useGetWishlistQuery, useUpdateWishlistMutation } from '../redux/api/productApiSlice';
import { useGetAllOffersToAddQuery } from '../redux/api/usersApiSlice';
import { CART_MESSAGES, WISHLIST_MESSAGES } from '../constants/messageConstants';
import { PropTypes } from "prop-types";
import { PLACEHOLDER_URL } from '../constants/constants';

const Cards = ({ products }) => {
  const { data: off } = useGetAllOffersToAddQuery()
  const offers = off?.offers
  const [likedProducts, setLikedProducts] = useState({});
  const [discounts, setDiscounts] = useState({});
  const [salesPrices, setSalesPrices] = useState({})
  const { data: wishlistData } = useGetWishlistQuery()
  const [update] = useUpdateWishlistMutation()
  const [addToCart] = useAddToCartMutation()

  useEffect(() => {
    if (wishlistData && wishlistData.wishlist) {
      const initialLikedProducts = {};
      wishlistData?.wishlist.forEach(item => {
        initialLikedProducts[item.productId._id] = true;
      });
      setLikedProducts(initialLikedProducts);
    }
  }, [wishlistData]);

  useEffect(() => {
    if (!products || !offers) return;

    const newDiscounts = {};
    const newSalesPrices = {};

    products.forEach((product) => {
      let productDiscount = 0;
      let categoryDiscount = 0;


      offers.forEach((offer) => {
        if (offer.name === product.offer) {
          productDiscount = offer.discount;
        }
      });

      if (product.category && product.category.offer) {
        offers.forEach((offer) => {
          if (offer.type === "category" && offer.name === product.category.offer) {
            categoryDiscount = offer.discount;
          }
        });
      }

      const finalDiscount = Math.max(productDiscount, categoryDiscount);
      newDiscounts[product._id] = finalDiscount;

      if (finalDiscount !== 0) {
        newSalesPrices[product._id] = product.price - (finalDiscount / 100) * product.price;
      } else {
        newSalesPrices[product._id] = product.price;
      }
    });

    setDiscounts(newDiscounts);
    setSalesPrices(newSalesPrices);
  }, [products, offers]);

  const cartHandler = async (product) => {
    await addToCart({ productId: product._id, qty: 1 }).unwrap();
    toast.success(CART_MESSAGES.ADD_TO_CART_SUCCESS);
  };


  const toggleLike = async (productId, color) => {
    const isLiked = !likedProducts[productId];
    setLikedProducts((prev) => ({ ...prev, [productId]: isLiked }));

    try {
      if (isLiked) {

        const res = await update({ productId, color }).unwrap();
        if (res.status === 'success')
          toast.success(WISHLIST_MESSAGES.ADD_SUCCESS)
      } else {

        await update({ productId, color }).unwrap();
        toast.success(WISHLIST_MESSAGES.REMOVE_SUCCESS)

      }

    } catch (error) {
      toast.error(error.message || `${WISHLIST_MESSAGES.UPDATE_FAILURE}`);
      setLikedProducts((prev) => ({ ...prev, [productId]: !isLiked }));
    }
  };

  return (
    <>
      <Row>
        {products?.map((product) => {
          const productImages = product.pdImage?.length
            ? product.pdImage.map((img) => `${img}`)
            : [`${PLACEHOLDER_URL}`];

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
                    {discounts[product._id] !== 0 ? (
                      <>
                        <span className='text-decoration-line-through text-muted me-2'>
                          ₹{product.price.toFixed(2)}
                        </span>
                        <span className='text-success fw-bold'>
                          ₹{(salesPrices[product._id] || 0).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span>₹{product.price.toFixed(2)}</span>
                    )}
                  </div>

                  <div className='d-flex justify-content-center gap-3 mt-auto'>
                    {/* Add to Cart Button */}
                    <Button
                      className='button-custom'
                      onClick={() => cartHandler(product)}
                      disabled={product.quantity <= 0 || !product.category?.isExist}
                    >
                      Add to cart
                    </Button>
                    <Button
                      variant='light'
                      className='border icon-hover'
                      onClick={() => toggleLike(product._id, product.color)}
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

Cards.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      pdImage: PropTypes.arrayOf(PropTypes.string),
      quantity: PropTypes.number.isRequired,
      color: PropTypes.string.isRequired,
      category: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
        offer: PropTypes.string,
        isExist: PropTypes.bool
      }),
    })
  ).isRequired,
};


export default Cards;