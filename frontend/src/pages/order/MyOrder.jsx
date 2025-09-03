import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Form, Image, Modal, InputGroup, FormControl } from "react-bootstrap";
import { useCancelOrderMutation, useGetMyOrdersQuery, useReturnOrderMutation } from '../../redux/api/ordersApiSlice'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router';
import RetryButton from '../../components/RetryButton';
import debounce from 'lodash.debounce';
import { ORDER_MESSAGES } from '../../constants/messageConstants';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL);

const MyOrder = () => {
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const { data: result, refetch, isLoading, error } = useGetMyOrdersQuery(searchTerm);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cancelOrder] = useCancelOrderMutation();
  const [returnOrder] = useReturnOrderMutation();
  const navigate = useNavigate()
  const orders = result?.orders

  useEffect(() => {
    socket.on('orderStatusUpdated', () => {
      toast.success(ORDER_MESSAGES.ORDER_STATUS_UPDATE_SUCCESS);
      refetch();
    });
    return () => {
      socket.off('orderStatusUpdated');
    };
  }, [refetch]);

  useEffect(() => {

    const debouncedResults = debounce(() => {
      setSearchTerm(inputValue);
    }, 500);

    debouncedResults()

    return () => {
      debouncedResults.cancel();
    };

  }, [inputValue]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading orders</p>;


  const handleCancelClick = (orderId, item) => {
    setSelectedOrder(orderId);
    setSelectedProduct(item);
    setShowConfirmModal(true);
  };

  //cancel order
  const handleCancelOrder = async () => {
    try {
      setShowReasonModal(false);
      await cancelOrder({
        orderId: selectedOrder,
        item: selectedProduct,
        cancelReason: selectedReason,
      }).unwrap();
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || ORDER_MESSAGES.ORDER_CANCEL_FAILURE);
    }

  };

  const handleReturnClick = (orderId, item) => {
    setSelectedOrder(orderId);
    setSelectedProduct(item);
    setShowReturnModal(true);
  };

  //return order
  const handleReturnOrder = async () => {
    try {
      setShowReturnModal(false);
      const response = await returnOrder({
        orderId: selectedOrder,
        item: selectedProduct,
        returnReason: selectedReason,
      }).unwrap();
      if (response)
        toast.success(ORDER_MESSAGES.ORDER_RETURN_MSG)
      refetch();
    } catch (error) {
      toast.error(error || `${ORDER_MESSAGES.ORDER_RETURN_FAILURE}`)

    }
  };

  const handleConfirmCancel = () => {
    setShowConfirmModal(false);
    setShowReasonModal(true);
  };

  return (
    <>
      <section className="full-height background">
        <Row className='py-5'>
          <Col lg={6}></Col>
          <Col lg={3}></Col>

          <Col lg={3} className="d-flex justify-content-end gap-3">
            <InputGroup className="mb-3">
              <Form className="d-flex">
                <FormControl
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                  aria-describedby="search-addon"
                  value={inputValue}
                  onChange={handleChange}
                />
              </Form>
            </InputGroup>
          </Col>
        </Row>
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
                            <p>Coupon Discount: ₹{order.couponDiscount}</p>
                            <p>Tax: ₹{order.tax}</p>
                            <p>Total Price: ₹{order.totalPrice}</p>
                            {order.paymentStatus === "Failed" ? (<div className="d-flex justify-content-center mb-4">
                              <RetryButton orderId={order._id} />
                            </div>) : ""
                            }

                            {order?.items?.length > 0 ? (
                              order.items.map((item) => (
                                <Card key={item?.product?._id} className="mb-3">
                                  <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center">
                                      <div className="d-flex align-items-center" style={{ flex: "2" }}>
                                        <Image
                                          src={`${item?.product?.pdImage[0] || "placeholder.jpg"}`}
                                          className="img-fluid rounded-3"
                                          alt="Shopping item"
                                          style={{ width: "80px", height: "80px", objectFit: "cover" }}
                                        />
                                        <div className="ms-3">
                                          <h5>{item?.product?.name}</h5>
                                          <p className="small mb-0 text-muted">{item?.product?.color}</p>
                                        </div>
                                      </div>

                                      {/* Price & Delivery */}
                                      <div className="d-flex align-items-center justify-content-end" style={{ flex: "3" }}>
                                        <div className="me-4 text-center" style={{ width: "150px" }}>
                                          {item?.discount !== 0 ? (
                                            <>
                                              <span className='text-decoration-line-through text-muted me-2'>
                                                ₹{item?.price}
                                              </span>
                                              <span className='text-success fw-bold'>
                                                ₹{(Number(item?.price || 0) - Number(item?.discount || 0)).toFixed(2)}
                                              </span>
                                            </>
                                          ) : (
                                            <span>₹{item?.product?.price}</span>
                                          )}
                                        </div>

                                        <div className="me-4 text-center" style={{ width: "200px" }}>
                                          <h6
                                            className={`mb-0 ${item.status === "Pending" ||
                                              item.status === "Shipped" ||
                                              item.status === "Delivered"
                                              ? "text-success"
                                              : "text-danger"
                                              }`}
                                          >
                                            {item.status}
                                          </h6>
                                        </div>
                                        {item.status === "Pending" || item.status === "Shipped" ? (
                                          <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleCancelClick(order._id, item)}
                                          >
                                            Cancel
                                          </Button>
                                        ) : item.status === "Delivered" ? (
                                          <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleReturnClick(order._id, item)}
                                          >
                                            Return
                                          </Button>
                                        ) : null}
                                        <div className="me-4 text-center" style={{ width: "200px" }}>
                                          <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => navigate(`/order-details/${order._id}`)}
                                          >
                                            View
                                          </Button>
                                        </div>
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

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to cancel this order?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>No</Button>
          <Button variant="danger" onClick={handleConfirmCancel}>Yes, Cancel</Button>
        </Modal.Footer>
      </Modal>

      {/* Cancellation Reason Modal */}
      <Modal show={showReasonModal} onHide={() => setShowReasonModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Choose a Reason</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Select a cancellation reason:</Form.Label>
              <Form.Control as="select" value={selectedReason} onChange={(e) => setSelectedReason(e.target.value)}>
                <option value="">-- Select Reason --</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Found a better price">Found a better price</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Shipping took too long">Shipping took too long</option>
                <option value="Product details incorrect">Product details incorrect</option>
                <option value="Other">Other</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReasonModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleCancelOrder} disabled={!selectedReason}>Submit</Button>
        </Modal.Footer>
      </Modal>

      {/* Return Reason Modal */}
      <Modal show={showReturnModal} onHide={() => setShowReturnModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Return Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Select a return reason:</Form.Label>
              <Form.Control as="select" value={selectedReason} onChange={(e) => setSelectedReason(e.target.value)}>
                <option value="">-- Select Reason --</option>
                <option value="Defective or damaged product">Defective or damaged product</option>
                <option value="Wrong item delivered">Wrong item delivered</option>
                <option value="Item not as described">Item not as described</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Other">Other</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReturnModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleReturnOrder} disabled={!selectedReason}>Submit Return</Button>
        </Modal.Footer>
      </Modal>

    </>
  )
}

export default MyOrder