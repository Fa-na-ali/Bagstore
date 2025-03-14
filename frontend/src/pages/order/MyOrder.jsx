import React from 'react'
import { Container, Row, Col, Card, Button, Form, Image, Modal } from "react-bootstrap";
import { useGetMyOrdersQuery } from '../../redux/api/ordersApiSlice'

const MyOrder = () => {
  const { data: orders, isLoading, error } = useGetMyOrdersQuery();

  console.log("API Response:", orders);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading orders</p>;
  const imageBaseUrl = "http://localhost:5004/uploads/";

  const handleCancelOrder = (orderId) => {
    console.log("Cancel order:", orderId);

  };
  return (
    <>

      <section className="h-100 h-custom" style={{ backgroundColor: "#eee" }}>
        <Container className="py-5 h-100">
          <Row className="d-flex justify-content-center align-items-center h-100">
            <Col>
              <Card>
                <Card.Body className="p-4">
                  <Row>
                    {/* Shopping Cart Section */}
                    <Col lg={12}>
                    <h2 className="mb-1 text-center heading">MY ORDERS</h2>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                        
                         
                        </div>
                      </div>

                      {orders?.length === 0 ? (
                        <h5 className="text-center text-muted">No orders made</h5>
                      ) : (

                        orders?.map((order) => (
                          <div key={order._id}>
                             <h5>Order ID: {order.orderId}</h5>
                            <p>Total Price: ₹{order.totalPrice}</p> 
                            <hr />
                            {order?.items?.length > 0 ? (
                              order.items.map((item) => (
                                <Card key={item.product._id} className="mb-3">
                                  <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center">
                                      <div className="d-flex align-items-center" style={{ flex: "2" }}>
                                        <Image
                                          src={`${imageBaseUrl}${item.product.pdImage[0] || "placeholder.jpg"}`}
                                          className="img-fluid rounded-3"
                                          alt="Shopping item"
                                          style={{ width: "80px", height: "80px", objectFit: "cover" }}
                                        />
                                        <div className="ms-3">
                                          <h5>{item.product.name}</h5>
                                          <p className="small mb-0 text-muted">{item.product.color}</p>
                                        </div>
                                      </div>

                                      {/* Price & Delivery */}
                                      <div className="d-flex align-items-center justify-content-end" style={{ flex: "3" }}>
                                        <div className="me-4 text-center" style={{ width: "80px" }}>
                                          <h5 className="mb-0">₹{item.product.price}</h5>
                                        </div>

                                        <div className="me-4 text-center" style={{ width: "200px" }}>
                                          <h6
                                            className={`mb-0 ${item.status === "pending" ||
                                                item.status === "shipped" ||
                                                item.status === "delivered"
                                                ? "text-success"
                                                : "text-danger"
                                              }`}
                                          >
                                            {item.status}
                                          </h6>
                                        </div>
                                        {item.status === "pending" || item.status === "shipped" ? (
                                          <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleCancelOrder(order._id)}
                                          >
                                            Cancel
                                          </Button>
                                        ) : item.status === "delivered" ? (
                                          <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleReturnOrder(order._id)}
                                          >
                                            Return
                                          </Button>
                                        ) : null}
                                      </div>
                                    </div>

                                  </Card.Body>
                                </Card>
                              ))
                            ) : (
                              <p>No items in this order</p>
                            )}
                            <hr />
                          </div>
                        ))
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row></Container>
      </section>

    </>
  )
}

export default MyOrder