import React from 'react'
import { useParams } from 'react-router';
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useGetOrderDetailsQuery } from '../../../redux/api/ordersApiSlice';
import AdminSidebar from '../../../components/AdminSidebar'



const OrderDetails = () => {
 

  const { id } = useParams();
  console.log("id", id)

  const { data: order, error, isLoading, } = useGetOrderDetailsQuery(id);


  console.log("API Response order:", order);
  console.log("Error:", error);

  if (isLoading) return <div>Loading...</div>;
  if (error) {
    // Handle HTML responses
    if (error.originalStatus === 404) {
      return <div>Error: Order not found</div>;
    }
    return (
      <div>
        <h3>Error</h3>
        <p>Status: {error.status}</p>
        <p>Message: {error.data?.message || "An unknown error occurred"}</p>
      </div>
    );
  }


  const address = order?.shippingAddress
  return (
    <>
      <Container fluid>
        <Row className="g-0">
          <Col lg={2} className="d-none d-lg-block">
            <AdminSidebar />
          </Col>

          <Col md={8}>
            <Card.Body className="p-4">
              <h6>Profile</h6>
              <hr className="mt-0 mb-4" />
              <Row className="pt-1">
                <Col xs={6} className="mb-3">
                  <h6>Customer</h6>
                  <p className="text-muted">{order?.userId.name}</p>
                </Col>
                <Col xs={6} className="mb-3">
                  <h6>Order Date</h6>
                  <p className="text-muted">{order?.createdAt}</p>
                </Col>
              </Row>
              <Row className="pt-1">
                <Col xs={6} className="mb-3">
                  <h6>Customer</h6>
                  <p className="text-muted">{order?.userId.name}</p>
                </Col>
                <Col xs={6} className="mb-3">
                  <h6>Address</h6>
                  <p className="text-muted">{address.houseName},{address.town},{address.street},
                    {address.state}, {address.zipcode}, {address.country}</p>
                </Col>
              </Row>
              <h6>Address</h6>
              <hr className="mt-0 mb-4" />


            </Card.Body>
          </Col>
        </Row>
      </Container>

    </>
  )
}

export default OrderDetails