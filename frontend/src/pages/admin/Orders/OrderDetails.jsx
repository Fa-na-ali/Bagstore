import { useEffect, useState } from 'react'
import { useParams } from 'react-router';
import { Container, Row, Col, Card, Button, Table, Image, Form } from "react-bootstrap";
import { useGetOrderDetailsQuery, useSetItemStatusMutation } from '../../../redux/api/ordersApiSlice';
import AdminSidebar from '../../../components/AdminSidebar'
import { toast } from 'react-toastify'
import { io } from 'socket.io-client';
import { ORDER_MESSAGES } from '../../../constants/messageConstants';

const socket = io(import.meta.env.VITE_SOCKET_URL);


const OrderDetails = () => {

  const { id } = useParams();
  const { data, refetch, error, isLoading, } = useGetOrderDetailsQuery(id);
  const order = data?.order
  const [itemStatuses, setItemStatuses] = useState({});
  const [setItemStatus] = useSetItemStatusMutation();

  useEffect(() => {
    socket.on('orderStatusUpdated', (updatedOrder) => {
      if (updatedOrder.orderId === id) {
        toast.success(ORDER_MESSAGES.ORDER_STATUS_UPDATE_SUCCESS);
        refetch();
      }
    });
    return () => {
      socket.off('orderStatusUpdated');
    };
  }, [id, refetch]);

  useEffect(() => {
    if (order?.items) {
      const initialStatuses = order?.items?.reduce((acc, item) => {
        acc[item._id] = item.status;
        return acc;
      }, {});
      setItemStatuses(initialStatuses);
    }
  }, [order]);

  if (isLoading) return <div>Loading...</div>;
  if (error) {

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

  const handleItemStatusChange = (itemId, newStatus) => {
    setItemStatuses((prevStatuses) => ({
      ...prevStatuses,
      [itemId]: newStatus,
    }));
  };

  const handleSaveChanges = async (status, item, id) => {
    try {
      await setItemStatus({ status, item, id });
      refetch()
      toast.success(ORDER_MESSAGES.ORDER_STATUS_UPDATE_SUCCESS)
    } catch (error) {
      toast.error(error?.data?.message || ORDER_MESSAGES.ORDER_STATUS_UPDATE_FAILURE);
    }
  };

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
                  <p className="text-muted">{order?.userId?.name}</p>
                </Col>
                <Col xs={6} className="mb-3">
                  <h6>Order Date</h6>
                  <p className="text-muted">{order?.createdAt}</p>
                </Col>
              </Row>
              <Row className="pt-1">
                <Col xs={6} className="mb-3">
                  <h6>Email</h6>
                  <p className="text-muted">{order?.userId?.email}</p>
                </Col>
                <Col xs={6} className="mb-3">
                  <h6>Shipping Price</h6>
                  <p className="text-muted">{order?.shippingPrice}</p>
                </Col>
              </Row>
              <Row className="pt-1">
                <Col xs={6} className="mb-3">
                  <h6>Phone</h6>
                  <p className="text-muted">{order?.userId?.phone}</p>
                </Col>
                <Col xs={6} className="mb-3">
                  <h6>Payment Method</h6>
                  <p className="text-muted">{order?.paymentMethod}</p>
                </Col>
              </Row>
              <Row className="pt-1">
                <Col xs={6} className="mb-3">
                  <h6>Address</h6>
                  <p className="text-muted">{address?.houseName},{address?.town},{address?.street},
                    {address?.state}, {address?.zipcode}, {address?.country}</p>
                </Col>
                <Col xs={6} className="mb-3">
                  <h6>Total Price</h6>
                  <p className="text-muted">{order?.totalPrice?.toFixed(2)}</p>
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
                    <th>Discount</th>
                    <th>Total Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {order?.items?.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <Image
                            src={`${item?.product?.pdImage[0]}`}
                            className="img-fluid rounded-3"
                            style={{ width: "120px" }}
                            alt="Book"
                          />
                          <div className="flex-column ms-4">
                            <p className="mb-2">{item?.product?.name}</p>
                            <p className="mb-0">{item?.product?.color}</p>
                          </div>
                        </div>
                      </td>
                      <td className="align-middle">
                        <p className="mb-0 fw-bold">{item.qty}</p>
                      </td>

                      <td className="align-middle">
                        <p className="mb-0 fw-bold">{item?.product?.price}</p>
                      </td>
                      <td className="align-middle">
                        <p className="mb-0 fw-bold">{item.discount.toFixed(2)}</p>
                      </td>
                      <td className="align-middle">
                        <p className="mb-0 fw-bold">{((item?.product?.price - item.discount) * item.qty).toFixed(2)}</p>
                      </td>
                      <td className="align-middle">
                        {(item.status === "Cancelled") || (item.status === "Returned") || (item.status === "Delivered") ? (
                          <p className="mb-0 fw-bold text-danger">{item.status}</p>
                        ) : item.status === "Return requested" ? (
                          <div>
                            <p className="mb-0 fw-bold text-warning">Return Request</p>
                            <p className="mb-0"><strong>Reason:</strong> {item.returnReason}</p>
                            <Button
                              className="me-2"
                              variant="success"
                              size="sm"
                              onClick={() => handleSaveChanges("Returned", item, order._id)}
                            >
                              Approve
                            </Button>
                            {/* <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleReturnAction(item._id, "rejected")}
                            >
                              Reject
                            </Button> */}
                          </div>
                        ) : (
                          <Form.Select
                            value={itemStatuses[item._id]}
                            onChange={(e) => handleItemStatusChange(item._id, e.target.value)}
                          >
                            <option value={item.status}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</option>
                            {item.status === "Pending" && <option value="Shipped">Shipped</option>}
                            {item.status === "Shipped" && <option value="Delivered">Delivered</option>}
                          </Form.Select>
                        )}
                      </td>
                      <td className="align-middle">
                        {item.status !== "Cancelled" && item.status !== "Returned" && item.status !== "Delivered" && (
                          <Button className='button-custom' size="sm" onClick={() => handleSaveChanges(itemStatuses[item._id], item, order._id)}>
                            Save Changes
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <Col md={12}>
              <div className='ms-2'>
                <h5>Order Status</h5>
                <Row>
                  <Col md={5}>
                    <Button
                      className='mt-1'
                      size="sm"
                      variant={order.status === "Completed" ? "success" : "danger"}
                    >
                      {order.status}
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