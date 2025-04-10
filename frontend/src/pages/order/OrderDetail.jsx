import React, { useEffect } from "react";
import { useParams } from "react-router";
import { useGetOrderByIdQuery } from "../../redux/api/ordersApiSlice";
import { Container, Row, Col, Card, Button, Image } from "react-bootstrap";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts?.pdfMake?.vfs || {};


const OrderDetail = () => {
  const { id } = useParams();
  const { data: order, isLoading, isError } = useGetOrderByIdQuery(id);
  const imageBaseUrl = "http://localhost:5004/uploads/";
  console.log(order)
 
  if (isLoading) return <p>Loading...</p>;
  if (isError || !order) return <p>Error fetching order details.</p>;
  
  const handleCancel = () => {

  }

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
                          src={`${imageBaseUrl}${item.product.pdImage[0]}`}
                          className="img-fluid"
                          alt={item.product.name}
                        />
                      </Col>
                      <Col md={2} className="d-flex justify-content-center">
                        <div>
                          <p className="small text-muted mb-4 pb-2">Name</p>
                          <p className="lead fw-normal mb-0 caption">{item.product.name}</p>
                        </div>
                      </Col>
                      <Col md={1} className="d-flex justify-content-center">
                        <div>
                          <p className="small text-muted mb-4 pb-2">Color</p>
                          <p className="lead fw-normal mb-0 caption">{item.product.color}</p>
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
        <Row>
          <Col md={10}>
            <h4 className="heading">Shipping Address</h4>
            <p className="caption">{order.shippingAddress.name}, {order.shippingAddress.houseName}, {order.shippingAddress.town},</p>
            <p className="caption">{order.shippingAddress.street}, {order.shippingAddress.zipcode}, {order.shippingAddress.country}, {order.shippingAddress.phone}</p>
          </Col>
          <Col md={2}>
            <h4 className="heading" >Payment Details</h4>
            <p className="caption">Method:{order.paymentMethod}</p>
            <p className="caption">Payment Status:{order.paymentStatus}</p>
            <p className="caption">Total Discount:{order.totalDiscount}</p>
            <p className="caption">Tax:{order.tax}</p>
            <p className="caption">Shipping Price:{order.shippingPrice}</p>
            <p className="caption">Total Price:{order.totalPrice}</p>
          </Col>

        </Row>
      </Container>
    </section>
  );
};

export default OrderDetail;
