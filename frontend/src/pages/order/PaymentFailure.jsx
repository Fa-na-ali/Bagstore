import { Container, Row, Col, Card, Button, } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router";
import RetryButton from "../../components/RetryButton";

const PaymentFailure = () => {
  const navigate = useNavigate()
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const id = sp.get("id") || "";

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
                      <RetryButton orderId={id} />
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