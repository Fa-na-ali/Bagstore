import { Container, Row, Col, Card } from "react-bootstrap";
import icon from '../../assets/images/female.png'
import Footer from "../../components/Footer";

const About = () => {
    return (
        <>
            <main className="about-main py-5 background-one">
                <Container>
                    {/* About Section */}
                    <section className="mb-5">
                        <h2 className="text-center mb-4 heading">Welcome to Bagbelle</h2>
                        <p className="caption">
                            We are dedicated to providing the best products at competitive prices. Our mission is to bring you a seamless shopping experience, ensuring quality, trust, and customer satisfaction.
                        </p>
                        <p className="caption">
                            Founded in 2024, our store has served thousands of customers across the globe, making their shopping experience hassle-free and enjoyable.
                        </p>
                    </section>

                    {/* Team Section */}
                    <section>
                        <h2 className="text-center mb-4 caption">Meet Our Team</h2>
                        <Row className="justify-content-center">
                            <Col xs={12} md={4} className="mb-4">
                                <Card className="text-center shadow-sm">
                                    <Card.Img
                                        variant="top"
                                        src={icon}
                                        alt="Anand P S"
                                        style={{ width: "150px", height: "150px", margin: "1rem auto" }}
                                    />
                                    <Card.Body>
                                        <Card.Title className="caption">Fathima Nabeela Ali</Card.Title>
                                        <Card.Text className="caption">Founder & CEO</Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col xs={12} md={4} className="mb-4">
                                <Card className="text-center shadow-sm">
                                    <Card.Img
                                        variant="top"
                                        src={icon}
                                        alt="Jane Smith"
                                        style={{ width: "150px", height: "150px", margin: "1rem auto" }}
                                    />
                                    <Card.Body>
                                        <Card.Title className="caption">Rachel Smith</Card.Title>
                                        <Card.Text className="caption">Head of Marketing</Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </section>
                </Container>
            </main>
            <Footer />
        </>
    );
};

export default About;
