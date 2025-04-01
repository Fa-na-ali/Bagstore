import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form, Image } from "react-bootstrap";
import { FaHeart, FaTrash, FaMinus, FaPlus } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { addToCart, removeFromCart, syncCartWithDatabase, updateCartItemQuantity, } from "../../redux/features/cart/cartSlice";
import { useGetProductsByIdsQuery } from "../../redux/api/productApiSlice";

const Cart = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;
  console.log(cartItems)
  const imageBaseUrl = "http://localhost:5004/uploads/";
  const maximum = 5

  const productIds = cartItems.map((item) => item._id);
  const { data: latestProducts } = useGetProductsByIdsQuery(productIds);
  console.log("data", latestProducts)

  useEffect(() => {
    if (latestProducts) {
      dispatch(syncCartWithDatabase(latestProducts?.products));
    }
  }, [latestProducts, dispatch]);



  const isAnyItemOutOfStock = () => {
    return cartItems.some((item) => item.quantity === 0

    );
  };

  const updateQuantityHandler = (product, qty) => {

    const maxAllowed = Math.min(maximum, product?.quantity);
    if (qty < 1 || qty > maxAllowed) {
      toast.error(`You can only add up to ${maxAllowed} units of this product`);
      return;
    }

    dispatch(updateCartItemQuantity({ productId: product._id, qty }))

  };
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discount = cartItems.reduce((acc, item) => acc + item.discount * item.qty, 0);
  const tax = subtotal * 0.05;
  const total = subtotal - discount + tax;
  return (
    <section className="bg-light my-5">
      <Container>
        <Row>
          <Col lg={9}>
            <Card className="border shadow-0">
              <Card.Body>
                <h4 className="card-title mb-4">Your shopping cart</h4>
                {cartItems.length === 0 ? (
                  <h5 className="text-center text-muted">Your cart is empty</h5>
                ) : (
                  cartItems.map((item) => (
                    <Row className="gy-3 mb-4" key={item._id}>
                      <Col lg={5}>
                        <div className="d-flex">
                          <Image
                            src={`${imageBaseUrl}${item.pdImage[0]}`}
                            className="border rounded me-3"
                            style={{ width: "96px", height: "96px" }}
                          />
                          <div>
                            <p className="nav-link">{item.name}</p>
                            <p className="text-muted">{item.color}</p>
                          </div>
                        </div>
                      </Col>
                      <Col lg={3} md={6} className="mb-4 mb-lg-0">

                        <div className="d-flex mb-4" style={{ maxWidth: "300px" }}>
                          <Button variant="primary" className="px-3 me-2" onClick={() => updateQuantityHandler(item, item.qty - 1)}
                            disabled={item.qty <= 1}>
                            <FaMinus />
                          </Button>
                          <Form.Control
                            type="number"
                            min="1"
                            max={Math.min(maximum, item.quantity)}
                            value={item.qty}
                            onChange={(e) => {
                              let value = Number(e.target.value);
                              if (value >= 1 && value <= Math.min(maximum, item.quantity)) {
                                updateQuantityHandler(item, value);
                              }
                            }}

                            className="text-center"
                          />
                          <Button variant="primary" className="px-3 ms-2" onClick={() => updateQuantityHandler(item, item.qty + 1)}
                            disabled={item.qty >= Math.min(maximum, item.quantity)}>
                            <FaPlus />
                          </Button>
                        </div>
                      </Col>
                      <Col>
                        <p className="text-muted py-2 ms-5">
                          {item.originalPrice !== item.discountedPrice ? (
                            <>
                              <span className="text-decoration-line-through text-muted me-2">
                                ₹{item.originalPrice}
                              </span>
                              <span className="text-success fw-bold">₹{item.discountedPrice}</span>
                            </>
                          ) : (
                            <span>₹{item.price}</span>
                          )}

                        </p></Col>
                      <Col lg className="d-flex justify-content-sm-center justify-content-md-start justify-content-lg-center justify-content-xl-end mb-2">
                        <div className="float-md-end">
                          <Button variant="danger" className="border px-2">
                            <FaHeart className="" />
                          </Button>
                          <Button variant="primary" className="border  ms-2" onClick={() => dispatch(removeFromCart(item._id))}>
                            <FaTrash />
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  ))
                )}
              </Card.Body>
            </Card>
          </Col>
          <div className="col-lg-3">
            <Card className="shadow-0 border">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <p className="mb-2">Total price:</p>
                  <p className="mb-2">₹{subtotal.toFixed(2)}</p>
                </div>
                <div className="d-flex justify-content-between">
                  <p className="mb-2">Discount:</p>
                  <p className="mb-2 text-success">-₹{discount.toFixed(2)}</p>
                </div>
                <div className="d-flex justify-content-between">
                  <p className="mb-2">TAX:</p>
                  <p className="mb-2">₹{tax.toFixed(2)}</p>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <p className="mb-2">Total price:</p>
                  <p className="mb-2 fw-bold">₹{total.toFixed(2)}</p>
                </div>
                <div className="mt-3">
                  <Button className="w-100 shadow-0 mb-2 button-custom"
                    onClick={() => { navigate('/checkout') }}
                    disabled={isAnyItemOutOfStock() || cartItems.length === 0}
                  >
                    CHECKOUT
                  </Button>
                  <Button variant="light" className="w-100 border mt-2">
                    Back to shop
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Row>
      </Container>
    </section>
  );
};

export default Cart;
