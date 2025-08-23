import { useState } from "react";
import { useParams } from "react-router";
import { useCancelOrderMutation, useGetOrderByIdQuery, useReturnOrderMutation } from "../../redux/api/ordersApiSlice";
import { Container, Row, Col, Card, Button, Form, Image, Modal } from "react-bootstrap";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { toast } from "react-toastify";
import RetryButton from "../../components/RetryButton";
import { ORDER_MESSAGES } from "../../constants/messageConstants";

pdfMake.vfs = pdfFonts?.pdfMake?.vfs || {};

const OrderDetail = () => {
  const { id } = useParams();
  const { data, refetch, isLoading, isError } = useGetOrderByIdQuery(id);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cancelOrder] = useCancelOrderMutation();
  const [returnOrder] = useReturnOrderMutation();
  const order = data?.order
  if (isLoading) return <p>Loading...</p>;
  if (isError || !order) return <p>Error fetching order details.</p>;


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
      toast.error(error?.data?.message || `${ORDER_MESSAGES.ORDER_CANCEL_FAILURE}`);
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

  //download invoice
  const generate_invoice = () => {

    const docDefinition = {
      content: [
        { text: 'Invoice', style: 'header' },
        { text: `Order ID: ${order.orderId}`, margin: [0, 10, 0, 10] },
        {
          text: 'Customer Details',
          style: 'subheader',
        },
        {
          ul: [
            `Name: ${order.userId.name}`,
            `Phone Number: ${order.userId.phone || 'N/A'}`,
            `Address: ${order.shippingAddress.houseName}, ${order.shippingAddress.street}, ${order.shippingAddress.town}, ${order.shippingAddress.state}, ${order.shippingAddress.country}, ZIP CODE: ${order.shippingAddress.zipcode}`,
          ],
          margin: [0, 0, 0, 10],
        },
        { text: 'Products', style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto'],
            body: [
              ['Product', 'Quantity', 'Price (₹)'],
              ...order.items.map((item) => [item.product.name, item.qty, item.product.price.toFixed(2)]),
            ],
          },
          margin: [0, 0, 0, 10],
        },
        { text: 'Summary', style: 'subheader' },
        {
          table: {
            widths: ['*', 'auto'],
            body: [
              ['Subtotal :', `₹${(order.totalPrice).toFixed(2)}`],
              //['Shipping Fee:', payment.delivery_fee > 0 ? `₹${payment.delivery_fee.toFixed(2)}` : 'Free'],
              ['Tax:', '₹3.00'],
              ['Total:', `₹${order.totalPrice.toFixed(2)}`],
            ],
          },
          margin: [0, 0, 0, 10],
        },
      ],
      styles: {
        header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 20] },
        subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
      },
    };
    pdfMake.createPdf(docDefinition).download(`invoice_${order.orderId}.pdf`);
  };

  return (
    <>
      <section className="full-height background">
        <div className="d-flex justify-content-end align-items-center mb-4">
          <Button
            onClick={generate_invoice}
            className="mt-3 button-custom"
          >
            Download Invoice
          </Button>
        </div>
        <h2 className="text-center pt-5 heading">ORDER DETAILS</h2>
        <p className="text-center caption">Order Id : {order.orderId}</p>
        {order.paymentStatus === "Failed" ? (<div className="d-flex justify-content-center mb-4">
          <RetryButton orderId={id} />
        </div>) : ""
        }

        <Container id="order-details" className="">
          <Row className="d-flex justify-content-center  h-100">
            <Col>
              {order.items.length === 0 ? (
                <h5 className="text-center text-muted">No items in cart</h5>
              ) : (
                order.items.map((item) => (
                  <Card key={item._id} className="mb-4">
                    <Card.Body className="p-4">
                      <Row className="align-items-center">
                        <Col md={1}>
                          <Image
                            src={`${item?.product?.pdImage[0]}`}
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
                            <p className="lead fw-normal mb-0 caption">₹{item?.product?.price.toFixed(2)}</p>
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
                            <p className="lead fw-normal mb-0 caption">₹{((item?.product?.price - item?.discount) * item?.qty).toFixed(2)}</p>
                          </div>
                        </Col>
                        <Col md={1} className="d-flex justify-content-center">
                          <div>
                            <p className="small text-muted mb-4 pb-2">Action</p>


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
                            ) : (
                              <h6
                                className={`mb-0 ${item.status === "Cancelled" || item.status === "Returned"
                                  ? "text-danger"
                                  : "text-success"
                                  }`}
                              >
                                {item.status}
                              </h6>
                            )}
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
                    <strong>Name:</strong> {order?.shippingAddress?.name}
                  </div>
                  <div className="mb-2 caption">
                    <strong>Address:</strong> {order?.shippingAddress?.houseName}, {order?.shippingAddress?.street}
                  </div>
                  <div className="mb-2 caption">
                    {order?.shippingAddress?.town}, {order?.shippingAddress?.state}
                  </div>
                  <div className="mb-2 caption">
                    {order?.shippingAddress?.country}, {order?.shippingAddress?.zipcode}
                  </div>
                  <div className="caption">
                    <strong>Phone:</strong> {order?.shippingAddress?.phone}
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
                    <span>{order.paymentMethod}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 caption">
                    <span><strong>Status:</strong></span>
                    <span className={`badge ${order.paymentStatus === 'paid' ? 'bg-success' : 'bg-warning'}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-2 caption">
                    <span><strong>Subtotal:</strong></span>
                    <span>₹{(order.totalPrice - order.shippingPrice - order.tax).toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 caption">
                    <span><strong>Shipping:</strong></span>
                    <span>₹{order.shippingPrice.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 caption">
                    <span><strong>Tax:</strong></span>
                    <span>₹{order.tax.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 caption">
                    <span><strong>Discount:</strong></span>
                    <span className="text-danger">-₹{order.totalDiscount.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold caption">
                    <span>Total:</span>
                    <span>₹{order.totalPrice.toFixed(2)}</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
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
  );
};

export default OrderDetail;
