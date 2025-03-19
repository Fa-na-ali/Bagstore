import React, { useState } from 'react'
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useLocation, useNavigate } from 'react-router';
import { useResetPasswordMutation } from '../../redux/api/usersApiSlice';
import { toast } from 'react-toastify';


const Password = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get("email");
    console.log(email)

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});

    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    const validatePassword = (password, confirmPassword) => {
        const errors = {};
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
        if (!password) {
            errors.newPassword = "New Password is required";
        } else if (!passwordRegex.test(password)) {
            errors.newPassword = "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character.";
        }
    
        if (!confirmPassword) {
            errors.confirmPassword = "Please confirm your password";
        } else if (password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }
    
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validatePassword(newPassword, confirmPassword)) {
            return;
        }

        try {
            const response = await resetPassword({ email, newPassword, confirmPassword }).unwrap();
            toast.success(response.message);
            navigate("/login");
        } catch (error) {
            toast.error(error?.data?.message || "Something went wrong");
        }
    };
    return (

        <>
            <section className='d-flex vh-100 justify-content-center align-items-center background'>
                <Container >
                    <h2 className='text-center heading mb-5'>RESET PASSWORD</h2>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col lg={3}></Col>
                            <Col lg={6}>
                                <Form.Group className="mb-4" controlId="formEmail">
                                    <Form.Label className='caption'>New Password</Form.Label>
                                    <Form.Control type="password" placeholder="Enter New Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        isInvalid={!!errors.newPassword} />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.newPassword}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg={3}></Col>
                            <Col lg={6}>
                                <Form.Group className="mb-4" controlId="formPassword">
                                    <Form.Label className='caption'>Confirm Password</Form.Label>
                                    <Form.Control type="password" placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        isInvalid={!!errors.confirmPassword} />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.confirmPassword}
                                    </Form.Control.Feedback>
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