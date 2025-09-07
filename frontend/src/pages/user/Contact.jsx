import { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { CONTACT_URL } from '../../constants/constants';
import Footer from '../../components/Footer';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { name, email, message } = formData;
        if (!name || !email || !message) {
            setStatus({ type: 'warning', message: 'Please fill out all fields.' });
            return;
        }

        const data = new FormData();
        data.append('name', name);
        data.append('email', email);
        data.append('message', message);

        try {
            const res = await fetch(`${CONTACT_URL}`, {
                method: 'POST',
                body: data,
            });

            if (!res.ok) throw new Error();

            setStatus({ type: 'success', message: 'Message sent successfully.' });
            setFormData({ name: '', email: '', message: '' });
        } catch {
            setStatus({ type: 'danger', message: 'An error occurred. Please try again.' });
        }
    };

    return (
        <>
            <main className="py-4">
                <Container>
                    <Row className="mb-5">
                        <Col>
                            <h2 className='text-center heading'>CONTACT US</h2>
                            <p className='caption'>If you have any questions, concerns, or feedback, we&apos;d love to hear from you. Reach out to us through the following channels:</p>
                            <ul className='caption'>
                                <li>Email: <a href="mailto:appx102@gmail.com">bagbelle@gmail.com</a></li>
                                <li>Phone: +91 8732190329</li>
                                <li>Address: 123 Main Street, Gandi Nagar, Bangalore</li>
                            </ul>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={8}>
                            <h3 className='heading'>Send Us a Message</h3>
                            {status.message && (
                                <Alert variant={status.type}>{status.message}</Alert>
                            )}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group controlId="name" className="mb-3">
                                    <Form.Label className='caption'>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId="email" className="mb-3">
                                    <Form.Label className='caption'>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId="message" className="mb-3">
                                    <Form.Label className='caption'>Message</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Button type="submit" className='button-custom'>Submit</Button>
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </main>
            <Footer />
        </>
    );
};

export default Contact;
