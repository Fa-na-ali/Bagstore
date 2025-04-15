import React, { useEffect } from "react";
import { useParams } from "react-router";
import { useGetOrderByIdQuery, useGetPendingOrderByIdQuery } from "../../redux/api/ordersApiSlice";
import { Container, Row, Col, Card, Button, Image } from "react-bootstrap";

const PendingOrders = () => {
  const { id } = useParams();
  const { data, isLoading, isError } = useGetPendingOrderByIdQuery(id);
  const imageBaseUrl = "http://localhost:5004/uploads/";
  const order = data?.orders
  console.log(order)

  if (isLoading) return <p>Loading...</p>;
  if (isError || !order) return <p>Error fetching order details.</p>;

  return (
    <section className="full-height background">
      <div className="d-flex justify-content-end align-items-center mb-4">
        {/* <Button
          onClick={generate_invoice}
          className="mt-3 button-custom"
        >
          Download Invoice
        </Button> */}
      </div>
      <h2 className="text-center pt-5 heading">PENDING ORDER DETAILS</h2>
      <p className="text-center caption">Order Id : {order[0].orderId}</p>
      <Container id="order-details" className="">
        <Row className="d-flex justify-content-center  h-100">
          <Col>
            {order[0]?.items?.length === 0 ? (
              <h5 className="text-center text-muted">No items in cart</h5>
            ) : (
              order[0]?.items?.map((item) => (
                <Card key={item._id} className="mb-4">
                  <Card.Body className="p-4">
                    <Row className="align-items-center">
                      <Col md={1}>
                        <Image
                          src={`${imageBaseUrl}${item?.product?.pdImage[0]}`}
                          className="img-fluid"
                          alt={item?.product?.name}
                        />
                      </Col>
                      <Col md={2} className="d-flex justify-content-center">
                        <div>
                          <p className="small text-muted mb-4 pb-2">Name</p>
                          <p className="lead fw-normal mb-0 caption">{item?.product?.name}</p>
                        </div>
                      </Col>
                      <Col md={1} className="d-flex justify-content-center">
                        <div>
                          <p className="small text-muted mb-4 pb-2">Color</p>
                          <p className="lead fw-normal mb-0 caption">{item?.product?.color}</p>
                        </div>
                      </Col>
                      <Col md={1} className="d-flex justify-content-center">
                        <div>
                          <p className="small text-muted mb-4 pb-2">Quantity</p>
                          <p className="lead fw-normal mb-0 caption">{item.qty}</p>
                        </div>
                      </Col>
                      <Col md={2} className="d-flex justify-content-center">
                        <div>
                          <p className="small text-muted mb-4 pb-2">Price</p>
                          <p className="lead fw-normal mb-0 caption">₹{item.product.price}</p>
                        </div>
                      </Col>
                      <Col md={2} className="d-flex justify-content-center">
                        <div>
                          <p className="small text-muted mb-4 pb-2">DiscountedPrice</p>
                          <p className="lead fw-normal mb-0 caption">₹{(Number(item?.product?.price) - Number(item?.discount)).toFixed(2)}</p>
                        </div>
                      </Col>
                      <Col md={2} className="d-flex justify-content-center">
                        <div>
                          <p className="small text-muted mb-4 pb-2">Total</p>
                          <p className="lead fw-normal mb-0 caption">₹{(Number(item?.product?.price) - Number(item?.discount)) * item.qty.toFixed(2)}</p>
                        </div>
                      </Col>

                    </Row>
                  </Card.Body>
                </Card>
              ))
            )}
          </Col>

        </Row>
        <Row className="mt-4">
                 <Col md={8} className="mb-4">
                   <Card className="h-100">
                     <Card.Header className="bg-light">
                       <h5 className="mb-0 heading">Shipping Address</h5>
                     </Card.Header>
                     <Card.Body>
                       <div className="mb-2 caption">
                         <strong>Name:</strong> {order[0]?.shippingAddress?.name}
                       </div>
                       <div className="mb-2 caption">
                         <strong>Address:</strong> {order[0]?.shippingAddress?.houseName}, {order[0]?.shippingAddress?.street}
                       </div>
                       <div className="mb-2 caption">
                         {order[0]?.shippingAddress?.town}, {order[0]?.shippingAddress?.state}
                       </div>
                       <div className="mb-2 caption">
                         {order[0]?.shippingAddress?.country}, {order[0]?.shippingAddress?.zipcode}
                       </div>
                       <div className="caption">
                         <strong>Phone:</strong> {order[0]?.shippingAddress?.phone}
                       </div>
                     </Card.Body>
                   </Card>
                 </Col>
                 <Col md={4} className="mb-4">
                   <Card className="h-100">
                     <Card.Header className="bg-light">
                       <h5 className="mb-0 heading">Payment Details</h5>
                     </Card.Header>
                     <Card.Body>
                       <div className="d-flex justify-content-between mb-2 caption">
                         <span><strong>Method:</strong></span>
                         <span>{order[0].paymentMethod}</span>
                       </div>
                       <div className="d-flex justify-content-between mb-2 caption">
                         <span><strong>Status:</strong></span>
                         <span className={`badge ${order[0].paymentStatus === 'paid' ? 'bg-success' : 'bg-warning'}`}>
                           {order[0].paymentStatus}
                         </span>
                       </div>
                       <hr />
                       <div className="d-flex justify-content-between mb-2 caption">
                         <span><strong>Subtotal:</strong></span>
                         <span>₹{(order[0].totalPrice - order[0].shippingPrice - order.tax).toFixed(2)}</span>
                       </div>
                       <div className="d-flex justify-content-between mb-2 caption">
                         <span><strong>Shipping:</strong></span>
                         <span>₹{order[0]?.shippingPrice?.toFixed(2)}</span>
                       </div>
                       <div className="d-flex justify-content-between mb-2 caption">
                         <span><strong>Tax:</strong></span>
                         <span>₹{order[0]?.tax?.toFixed(2)}</span>
                       </div>
                       <div className="d-flex justify-content-between mb-2 caption">
                         <span><strong>Discount:</strong></span>
                         <span className="text-danger">-₹{order[0]?.totalDiscount?.toFixed(2)}</span>
                       </div>
                       <hr />
                       <div className="d-flex justify-content-between fw-bold caption">
                         <span>Total:</span>
                         <span>₹{order[0]?.totalPrice?.toFixed(2)}</span>
                       </div>
                     </Card.Body>
                   </Card>
                 </Col>
               </Row>
      </Container>
    </section>
  );
};

export default PendingOrders;
