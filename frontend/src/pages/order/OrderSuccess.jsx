import { Container, Row, Col, Card, Button, } from "react-bootstrap";
import { useLocation, useNavigate} from "react-router";

const OrderSuccess = () => {

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
                                        <h2 className="text-center text-success">Thank You for your Order</h2>
                                        <h3 className="text-center text-success">Your Order has been placed successfully</h3>
                                        <p className="text-center caption">We will notify you when your items have been shipped</p>
                                        <hr />
                                        <div className="d-flex justify-content-center align-items-center gap-3">
                                            <Button variant="" className="border me-2 button-custom" onClick={() => { navigate(`/order-details/${id}`) }}>
                                                Order Details
                                            </Button>
                                            <Button variant="success" className="shadow-0 border button-custom" onClick={() => { navigate('/shop-products') }}>
                                                Continue Shopping
                                            </Button>
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

export default OrderSuccess