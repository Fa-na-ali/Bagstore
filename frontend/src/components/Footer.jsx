import { Container, Row, Col } from "react-bootstrap";
import { FaFacebookF, FaTwitter, FaGoogle, FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="text-center text-white" style={{ backgroundColor: " #cc664E ", marginTop: "auto" }}>
      <Container fluid>
        <section>
          <Row className="text-center d-flex justify-content-center pt-5">
            <Col xs={6} md={2}>
              <h6 className="text-uppercase fw-bold">
                <a href="#!" className="text-white">About us</a>
              </h6>
            </Col>

            <Col xs={6} md={2}>
              <h6 className="text-uppercase fw-bold">
                <a href="#!" className="text-white">Products</a>
              </h6>
            </Col>

            <Col xs={6} md={2}>
              <h6 className="text-uppercase fw-bold">
                <a href="#!" className="text-white">Awards</a>
              </h6>
            </Col>

            <Col xs={6} md={2}>
              <h6 className="text-uppercase fw-bold">
                <a href="#!" className="text-white">Help</a>
              </h6>
            </Col>

            <Col xs={6} md={2}>
              <h6 className="text-uppercase fw-bold">
                <a href="#!" className="text-white">Contact</a>
              </h6>
            </Col>
          </Row>
        </section>

        <hr className="my-5" />

        <section className="mb-5">
          <Row className="d-flex justify-content-center">
            <Col lg={8}>
              <p>
                We are dedicated to providing the best products at competitive prices.
                Our mission is to bring you a seamless shopping experience, ensuring quality, trust, and customer satisfaction.
              </p>
            </Col>
          </Row>
        </section>

        <section className="text-center mb-5 footer-link">
          <a href="#!" className="text-white me-4"><FaFacebookF /></a>
          <a href="#!" className="text-white me-4"><FaTwitter /></a>
          <a href="#!" className="text-white me-4"><FaGoogle /></a>
          <a href="#!" className="text-white me-4"><FaInstagram /></a>
          <a href="#!" className="text-white me-4"><FaLinkedin /></a>
          <a href="#!" className="text-white me-4"><FaGithub /></a>
        </section>
      </Container>

      <div className="text-center p-3" style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}>
        © 2025 Copyright:{" "}
        <a className="text-white" href="">
          nabeelaalifathima@gmail.com
        </a>
      </div>
    </footer>
  );
};

export default Footer;
