import React from 'react'
import { Form, Button, Container, Row, Col } from "react-bootstrap";


const Password = () => {
    return (

        <>
            <section className='d-flex vh-100 justify-content-center align-items-center background'>
                <Container >
                    <h2 className='text-center heading mb-5'>RESET PASSWORD</h2>
                    <Form>
                        <Row>
                            <Col lg={3}></Col>
                            <Col lg={6}>
                                <Form.Group className="mb-4" controlId="formEmail">
                                    <Form.Label className='caption'>New Password</Form.Label>
                                    <Form.Control type="email" placeholder="Enter New Password" />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg={3}></Col>
                            <Col lg={6}>
                                <Form.Group className="mb-4" controlId="formPassword">
                                    <Form.Label className='caption'>Confirm Password</Form.Label>
                                    <Form.Control type="password" placeholder="Confirm Password" />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg={3}></Col>
                            <Col lg={6}>
                                <Button className="w-100 mb-4 button-custom" type="submit">
                                    RESET PASSWORD
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Container>
            </section>
        </>
    )
}

export default Password