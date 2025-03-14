import React, { useState } from 'react'
import { useParams } from 'react-router';
import { Container, Row, Col, Card, Button, Table, Image, Form } from "react-bootstrap";
import { useGetOrderDetailsQuery } from '../../../redux/api/ordersApiSlice';
import AdminSidebar from '../../../components/AdminSidebar'



const OrderDetails = () => {


  const { id } = useParams();
  console.log("id", id)

  const { data: order, error, isLoading, } = useGetOrderDetailsQuery(id);
  const imageBaseUrl = "http://localhost:5004/uploads/";
  const [orderStatus, setOrderStatus] = useState(order?.status);
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
  const handleStatusChange = (newStatus) => {
    setOrderStatus(newStatus);
  };

  const handleSaveChanges = () => {
    console.log("Saving order status:", orderStatus);
    // Call API to update order status
  };
  const handleOrderStatus = () => {

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
              <h6>Order Details</h6>
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
                  <h6>Email</h6>
                  <p className="text-muted">{order?.userId.email}</p>
                </Col>
                <Col xs={6} className="mb-3">
                  <h6>Shipping Price</h6>
                  <p className="text-muted">{order?.shippingPrice}</p>
                </Col>
              </Row>
              <Row className="pt-1">
                <Col xs={6} className="mb-3">
                  <h6>Phone</h6>
                  <p className="text-muted">{order?.userId.phone}</p>
                </Col>
                <Col xs={6} className="mb-3">
                  <h6>Payment Method</h6>
                  <p className="text-muted">{order?.paymentMethod}</p>
                </Col>
              </Row>
              <Row className="pt-1">
                <Col xs={6} className="mb-3">
                  <h6>Address</h6>
                  <p className="text-muted">{address.houseName},{address.town},{address.street},
                    {address.state}, {address.zipcode}, {address.country}</p>
                </Col>
                <Col xs={6} className="mb-3">
                  <h6>Total Price</h6>
                  <p className="text-muted">{order?.totalPrice}</p>
                </Col>
              </Row>
              <hr className="mt-0 mb-4" />
            </Card.Body>

            <div className="table-responsive">
              <Table>
                <thead>
                  <tr>
                    <th className="h5">Product Details</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <Image
                            src={`${imageBaseUrl}${item.product.pdImage[0]}`}
                            className="img-fluid rounded-3"
                            style={{ width: "120px" }}
                            alt="Book"
                          />
                          <div className="flex-column ms-4">
                            <p className="mb-2">{item.product.name}</p>
                            <p className="mb-0">{item.product.color}</p>
                          </div>
                        </div>
                      </td>
                      <td className="align-middle">
                        <p className="mb-0 fw-bold">{item.qty}</p>
                      </td>

                      <td className="align-middle">
                        <p className="mb-0 fw-bold">{item.product.price}</p>
                      </td>
                      <td className="align-middle">
                        <p className="mb-0 fw-bold">{item.product.price * item.qty}</p>
                      </td>
                      <td className="align-middle">
                        <Form.Select value={orderStatus} onChange={handleStatusChange}>
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </Form.Select>
                      </td>
                      <td className="align-middle">
                        <Button className='button-custom' size="sm" onClick={handleSaveChanges}>
                          Save Changes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <Col md={12}>
              <div className='ms-2 '>
                <h5>Order Status</h5>
                <Row>
                  <Col md={4}>
                    <Form.Select value={orderStatus} onChange={handleStatusChange}>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                  </Col>
                  <Col md={5}>
                    <Button className='button-custom mt-1' size="sm" onClick={handleOrderStatus}>
                      SET STATUS
                    </Button>
                  </Col>
                </Row>
              </div>
            </Col>
          </Col>
        </Row>
      </Container >

    </>
  )
}

export default OrderDetails