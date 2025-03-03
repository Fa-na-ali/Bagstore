import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form ,Image} from "react-bootstrap";
import { FaTrash, } from "react-icons/fa";
import { useSelector } from "react-redux";

const Checkout = () => {

  const cart = useSelector((state) => state.cart);
  const {userInfo} = useSelector((state) => state.auth); 
  console.log("userinfo",userInfo)
  const { cartItems } = cart;
  const { address } = userInfo; 
  const imageBaseUrl = "http://localhost:5004/uploads/";

  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    if (address && address.length > 0) {
      setSelectedAddress(address[0].id); // Set default address
    }
  }, [address]);

  const handleAddressChange = (id) => {
    setSelectedAddress(id);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discount = subtotal * 0.1;
  const tax = subtotal * 0.05;
  const total = subtotal - discount + tax;



  return (
    <section className="h-100 h-custom" style={{ backgroundColor: "#eee" }}>
      <Container className="py-5 h-100">
        <Row className="d-flex justify-content-center align-items-center h-100">
          <Col>
            <Card>
              <Card.Body className="p-4">
                <Row>
                  {/* Shopping Cart Section */}
                  <Col lg={7}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <p className="mb-1">Shopping cart</p>
                        <p className="mb-0">You have {cartItems.length}  items in your cart</p>
                      </div>
                    </div>

                    {cartItems.length === 0 ? (
                      <h5 className="text-center text-muted">Your cart is empty</h5>
                    ) : (
                      cartItems.map((item) => (
                      <Card key={item._id} className="mb-3">
                        <Card.Body>
                          <div className="d-flex justify-content-between">
                            <div className="d-flex flex-row align-items-center">
                              <div>
                                <Image
                                  src={`${imageBaseUrl}${item.pdImage[0]}`}
                                  className="img-fluid rounded-3"
                                  alt="Shopping item"
                                  style={{ width: "65px" }}
                                />
                              </div>
                              <div className="ms-3">
                                <h5>{item.name}</h5>
                                <p className="small mb-0">{item.color}</p>
                              </div>
                            </div>
                            <div className="d-flex flex-row align-items-center">
                              <div style={{ width: "50px" }}>
                                <h5 className="fw-normal mb-0">{item.qty}</h5>
                              </div>
                              <div style={{ width: "80px" }}>
                                <h5 className="mb-0">₹{item.price * item.qty}</h5>
                              </div>
                              <Button variant="link" className="text-danger p-0">
                                <FaTrash size={18} />
                              </Button>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                     ))
                    )}
                  </Col>

                  {/* Shipping Info Section */}
                  <Row>
                  <Col lg={7}>
                    <Card className="shadow-0 border">
                      <Card.Body className="p-4">
                        <h5 className="card-title mb-3">Shipping info</h5>
                        <hr className="my-4" />

                        <Row className="mb-3">
                        {address && address.length > 0 ? (
                          address.map((address,index) => (
                            <Col lg={4} key={index} className="mb-3">
                              <Form.Check
                                type="radio"
                                name="shippingOption"
                                label={
                                  <>
                                    <strong>{address[index]}</strong>
                                    <br />
                                    <small className="text-muted">
                                    {address.street}, {address.city}
                                    </small>
                                    <br />
                                    <small className="text-primary">{address.phone}</small>
                                  </>
                                }
                                checked={selectedAddress === address.id}
                                onChange={() => handleAddressChange(address.id)}
                                className="border rounded-3 p-3"
                              />
                            </Col>
                            ))
                          ) : (
                            <p className="text-muted">No saved addresses found. Please add one.</p>
                          )}
                        </Row>

                        <Form.Check
                          type="checkbox"
                          id="saveAddress"
                          label="Save this address"
                          className="mb-3"
                        />

                        <div className="float-end">
                          <Button variant="light" className="border me-2">
                            Cancel
                          </Button>
                          <Button variant="success" className="shadow-0 border">
                            Continue
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  </Row>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Checkout;
