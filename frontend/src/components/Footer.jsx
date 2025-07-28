import { Container, Row, Col, Image } from 'react-bootstrap';
import logo from "../assets/images/2.png"

const Footer = () => {
  return (
    <section className="footer-container">
      <Container className="footer-wrapper ">
        <div className="footer-content mt-5 text-white">
          <Row className="footer-sections">
            <Col md={6} lg={4} className="main-section">
              <Row className="content-grid">
                <Col md={12} className="brand-section mb-4">
                  <Image
                    src={logo}
                    className="brand-logo"
                    alt="NOVA brand logo"
                    fluid
                  />
                  <p className="brand-description">
                    NOVA is an e-commerce website that <br /> sells skincare products.
                  </p>
                  <div className="social-links d-flex">
                    <a href="#" aria-label="Facebook">
                      <Image
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/157a8817381a72a261b4d0247f98b3601946fefa5b024ca9eb4c7fc3bdde0be8?placeholderIfAbsent=true&apiKey=d7cebeeadab64378ab4fc611373387df"
                        className="social-icon mx-2"
                        alt="Facebook icon"
                        fluid
                      />
                    </a>
                    <a href="#" aria-label="Instagram">
                      <Image
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/120dd5f9f2078dc648b1f827b981d151af53fddc1972d5d673d22c0ee5787d51?placeholderIfAbsent=true&apiKey=d7cebeeadab64378ab4fc611373387df"
                        className="instagram-icon mx-2"
                        alt="Instagram icon"
                        fluid
                      />
                    </a>
                    <a href="#" aria-label="Twitter">
                      <Image
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/88cbdc11bb3518d95eb2d34506fa3da82c1197fdc63b5942e9364922d9c03e7e?placeholderIfAbsent=true&apiKey=d7cebeeadab64378ab4fc611373387df"
                        className="social-icon mx-2"
                        alt="Twitter icon"
                        fluid
                      />
                    </a>
                  </div>
                </Col>
              </Row>
            </Col>

            <Col md={6} lg={2} className="footer-column">
              <h5 className="column-title">SUPPORT</h5>
              <ul className="link-list list-unstyled">
                <li className="mb-2">FAQ</li>
                <li className="mb-2">Terms of Use</li>
                <li className="mb-2">Privacy Policy</li>
              </ul>
            </Col>

            <Col md={6} lg={2} className="footer-column">
              <ul className="link-list list-unstyled">
                <li className="mb-2">About Us</li>
              </ul>
            </Col>

            <Col md={6} lg={2} className="footer-column">
              <h5 className="column-title">SHOP</h5>
              <ul className="link-list list-unstyled">
                <li className="mb-2">My Account</li>
                <li className="mb-2">Checkout</li>
                <li className="mb-2">Cart</li>
              </ul>
            </Col>

            <Col md={6} lg={2} className="footer-column">
              <div className="payment-section">
                <h5>ACCEPTED PAYMENTS</h5>
                <Image
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/10c92b30dbe8680d8ef37f1e62b46e805dfd6b0c7a30bff079faa6c1033208aa?placeholderIfAbsent=true&apiKey=d7cebeeadab64378ab4fc611373387df"
                  className="payment-methods mt-2"
                  alt="Accepted payment methods"
                  fluid
                />
              </div>
            </Col>
          </Row>

          <Row>
            <Col className="text-center copyright-text py-3">
              © 2025 Fathima Nabeela Ali. All rights reserved.
            </Col>
          </Row>
        </div>
      </Container>
    </section>
  );
};

export default Footer;