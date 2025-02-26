import React from "react";
import { Container, Row, Col, Card ,Button} from "react-bootstrap";
import { FaFacebookF, FaTwitter, FaInstagram, FaEdit, FaTrash  } from "react-icons/fa";

const Account = () => {
    return (
        <section className="vh-100" style={{ backgroundColor: "#f4f5f7" }}>
            <Container className="py-5">
                <Row className="d-flex justify-content-center align-items-center">
                    <Col lg={12} className="mb-4 mb-lg-0">
                        <Card className="mb-3" style={{ borderRadius: ".5rem" }}>
                            <Row className="g-0">
                                <Col md={4} className="text-center text-white d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: "#6c757d", borderTopLeftRadius: ".5rem", borderBottomLeftRadius: ".5rem" }}>
                                    <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp" alt="Avatar" className="img-fluid my-4" style={{ width: "80px" }} />
                                    <h5>Marie Horwitz</h5>

                                    <FaEdit className="mb-4" />
                                </Col>
                                <Col md={8}>
                                    <Card.Body className="p-4">
                                        <h6>Profile</h6>
                                        <hr className="mt-0 mb-4" />
                                        <Row className="pt-1">
                                            <Col xs={6} className="mb-3">
                                                <h6>Email</h6>
                                                <p className="text-muted">info@example.com</p>
                                            </Col>
                                            <Col xs={6} className="mb-3">
                                                <h6>Phone</h6>
                                                <p className="text-muted">123 456 789</p>
                                            </Col>
                                        </Row>
                                        <h6>Address</h6>
                                        <hr className="mt-0 mb-4" />
                                        <Row className="pt-1">
                                            <Col xs={6} className="mb-3">
                                                <Card>
                                                    <Card.Body>
                                                        <div className="d-flex justify-content-between">
                                                            <Card.Title>Card Title</Card.Title>
                                                            <div>
                                                                <Button variant="outline-secondary" size="sm" className="me-2"><FaEdit /></Button>
                                                                <Button variant="outline-secondary" size="sm"><FaTrash /></Button>
                                                            </div>
                                                        </div>
                                                        <Card.Subtitle className="mb-2 text-muted">Card Subtitle</Card.Subtitle>
                                                        <Card.Text>
                                                            Some quick example text to build on the card title and make up the
                                                            bulk of the card's content.
                                                        </Card.Text>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col xs={6} className="mb-3">
                                                <Card>
                                                    <Card.Body>
                                                        <Card.Title>+ Add Address</Card.Title>


                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        </Row>
                                       
                                    </Card.Body>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default Account;
