import React from 'react'
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";

const Register = () => {
  return <>
   <section className="bg-primary p-3 p-md-4 p-xl-5">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={9} lg={7} xl={6} xxl={5}>
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-3 p-md-4 p-xl-5">
                <Row>
                  <Col xs={12}>
                    <div className="mb-5">
                      <h2 className="h3">Registration</h2>
                      <h3 className="fs-6 fw-normal text-secondary m-0">
                        Enter your details to register
                      </h3>
                    </div>
                  </Col>
                </Row>

                <Form>
                  <Row className="gy-3">
                    <Col xs={12}>
                      <Form.Group controlId="firstName">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control type="text" placeholder="First Name" required />
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group controlId="lastName">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control type="text" placeholder="Last Name" required />
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" placeholder="name@example.com" required />
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" required />
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Check
                        type="checkbox"
                        label={
                          <>
                            I agree to the{" "}
                            <a href="#!" className="link-primary text-decoration-none">
                              terms and conditions
                            </a>
                          </>
                        }
                        required
                      />
                    </Col>

                    <Col xs={12}>
                      <Button variant="primary" size="lg" className="w-100">
                        Sign Up
                      </Button>
                    </Col>
                  </Row>
                </Form>

                <Row className="mt-4">
                  <Col xs={12}>
                    <hr className="border-secondary-subtle" />
                    <p className="text-secondary text-center">
                      Already have an account?{" "}
                      <a href="#!" className="link-primary text-decoration-none">
                        Sign in
                      </a>
                    </p>
                  </Col>
                </Row>

                <Row className="mt-4">
                  <Col xs={12}>
                    <p>Or continue with</p>
                    <div className="d-grid gap-3">
                      <Button variant="danger" className="d-flex align-items-center">
                        <i className="bi bi-google me-2"></i> Sign in With Google
                      </Button>
                      <Button variant="primary" className="d-flex align-items-center">
                        <i className="bi bi-facebook me-2"></i> Sign in With Facebook
                      </Button>
                      <Button variant="info" className="d-flex align-items-center">
                        <i className="bi bi-twitter me-2"></i> Sign in With Twitter
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  
  
  
  </>
}

export default Register