import React, { useEffect } from "react";
import { useParams } from "react-router";
import { useGetOrderByIdQuery, useGetPendingOrderByIdQuery } from "../../redux/api/ordersApiSlice";
import { Container, Row, Col, Card, Button, Image } from "react-bootstrap";

const PendingOrders = () => {
  const { id } = useParams();
  const { data, isLoading, isError } = useGetPendingOrderByIdQuery(id);
  const imageBaseUrl = "http://localhost:5004/uploads/";
  const order=data?.orders
 
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
                      <Col md={2} className="d-flex justify-content-center">
                        <div>
                          <p className="small text-muted mb-4 pb-2">Color</p>
                          <p className="lead fw-normal mb-0 caption">{item?.product?.color}</p>
                        </div>
                      </Col>
                      <Col md={2} className="d-flex justify-content-center">
                        <div>
                          <p className="small text-muted mb-4 pb-2">Quantity</p>
                          <p className="lead fw-normal mb-0 caption">{item.qty}</p>
                        </div>
                      </Col>
                      <Col md={2} className="d-flex justify-content-center">
                        <div>
                          <p className="small text-muted mb-4 pb-2">Price</p>
                          <p className="lead fw-normal mb-0 caption">₹{item?.product?.price}</p>
                        </div>
                      </Col>
                      <Col md={2} className="d-flex justify-content-center">
                        <div>
                          <p className="small text-muted mb-4 pb-2">Total</p>
                          <p className="lead fw-normal mb-0 caption">₹{item?.product?.price * item.qty}</p>
                        </div>
                      </Col>
                      
                    </Row>
                  </Card.Body>
                </Card>
              ))
            )}
          </Col>

        </Row>
        <Row>
          <Col md={10}>
            <h4 className="heading">Shipping Address</h4>
            <p className="caption">{order[0]?.shippingAddress?.name}, {order[0]?.shippingAddress?.houseName}, {order[0]?.shippingAddress?.town},</p>
            <p className="caption">{order[0]?.shippingAddress?.street}, {order[0]?.shippingAddress?.zipcode}, {order[0]?.shippingAddress?.country}, {order[0]?.shippingAddress?.phone}</p>
          </Col>
          <Col md={2}>
            <h4 className="heading" >Payment Details</h4>
            <p className="caption">Method:{order[0]?.paymentMethod}</p>
            <p className="caption">Payment Status:{order[0].paymentStatus}</p>
            <p className="caption">Total Discount:{order[0].totalDiscount}</p>
            <p className="caption">Tax:{order[0].tax}</p>
            <p className="caption">Shipping Price:{order[0].shippingPrice}</p>
            <p className="caption">Total Price:{order[0].totalPrice}</p>
          </Col>

        </Row>
      </Container>
    </section>
  );
};

export default PendingOrders;
