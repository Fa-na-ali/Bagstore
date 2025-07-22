import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router";
import { useRetryPaymentMutation, useVerifyRetryPaymentMutation } from "../../redux/api/usersApiSlice";
import Swal from 'sweetalert2';
import RetryButton from "../../components/RetryButton";

const PaymentFailure = () => {

  const [retryPayment] = useRetryPaymentMutation();
  const [verifyRetryPayment] = useVerifyRetryPaymentMutation();
  const navigate = useNavigate()
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const id = sp.get("id") || "";
  console.log("id", id)

  const handleRetryPayment = async (orderId) => {
    try {
      const { data } = await retryPayment(orderId);
      console.log("data", data)
      if (data.status === "success") {
        initiateRazorpay(data, orderId);
      } else {
        Swal.fire({
          icon: "error",
          title: "Payment Error",
          text: "Failed to create retry payment order.",
        });
      }
    } catch (err) {
      console.error("Error retrying payment:", err);
      Swal.fire({
        icon: "error",
        title: "Payment Error",
        text: "An error occurred while retrying payment.",
      });
    }
  };

  const initiateRazorpay = (order, orderId) => {
    const options = {
      key: order.order.key,
      amount: order.order.amount,
      currency: "INR",
      order_id: order.order.id,
      handler: async function (response) {
        try {
          const verifyData = {
            razorpay_order_id: order.order.id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId
          };

          const result = await verifyRetryPayment(verifyData);
          if (result.data.status === "success") {
            Swal.fire({
              icon: "success",
              title: "Payment Successful",
              text: "Retry payment completed!",
            })
            navigate(`/order-success?id=${orderId}`)
          } else {
            Swal.fire({
              icon: "error",
              title: "Payment Failed",
              text: "Verification failed.",
            });
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          Swal.fire({
            icon: "error",
            title: "Payment Error",
            text: "An error occurred while verifying payment.",
          });
        }
      },
      theme: { color: "#3399cc" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };



  return (

    <>
      <section className="vh-100 h-custom background">
        <Container className="py-5 h-100">
          <Row className="d-flex justify-content-center align-items-center h-100">
            <Col>
              <Card>
                <Card.Body className="p-4">
                  <Row>
                    <h2 className="text-center text-success">Your payment has been failed</h2>
                    <h3 className="text-center text-success">Your Order is there in the pending state</h3>
                    {/* <p className="text-center caption">We will notify you when your items have been shipped</p> */}
                    <hr />
                    <div className="d-flex justify-content-center align-items-center gap-3">
                      <Button variant="" className="border me-2 button-custom" onClick={() => { navigate(`/pending/order-details/${id}`) }}>
                        Order Details
                      </Button>
                      {/* <Button variant="success" className="shadow-0 border button-custom" onClick={() => { handleRetryPayment(id) }}>
                        Retry Payment
                      </Button> */}
                      <RetryButton orderId = {id} />
                    </div>


                  </Row>

                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

    </>
  )
}

export default PaymentFailure