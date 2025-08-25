import { useState } from 'react'
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from 'react-router';
import { useChangePasswordMutation, } from '../../redux/api/usersApiSlice';
import { toast } from 'react-toastify';
import { USER_MESSAGES } from '../../constants/messageConstants';


const ChangePassword = () => {

    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [changePassword] = useChangePasswordMutation();

    //validations
    const validatePassword = (currentPassword, newPassword, confirmPassword) => {
        const errors = {};
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!currentPassword) {
            errors.currentPassword = "Current Password is required";
        }

        if (!newPassword) {
            errors.newPassword = "New Password is required";
        } else if (!passwordRegex.test(newPassword)) {
            errors.newPassword = "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character";
        }

        if (!confirmPassword) {
            errors.confirmPassword = "Please confirm your password";
        } else if (newPassword !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }

        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    //onsubmit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validatePassword(currentPassword, newPassword, confirmPassword)) {
            return;
        }

        try {
            const response = await changePassword({ currentPassword, newPassword, confirmPassword }).unwrap();
            toast.success(response.message);
            navigate("/login");
        } catch (error) {
            toast.error(error?.data?.message || `${USER_MESSAGES.USER_PASSWORD_CHANGE_FAILURE}`);
        }
    };

    return (

        <>
            <section className='d-flex vh-100 justify-content-center align-items-center background'>
                <Container >
                    <h2 className='text-center heading mb-5'>CHANGE PASSWORD</h2>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col lg={3}></Col>
                            <Col lg={6}>
                                <Form.Group className="mb-4" controlId="formEmail">
                                    <Form.Label className='caption'>Current Password</Form.Label>
                                    <Form.Control type="password" placeholder="Enter Current Password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        isInvalid={!!errors.currentPassword} />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.currentPassword}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg={3}></Col>
                            <Col lg={6}>
                                <Form.Group className="mb-4" controlId="formPassword">
                                    <Form.Label className='caption'>New Password</Form.Label>
                                    <Form.Control type="password" placeholder="New Password"
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
                                    CHANGE PASSWORD
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Container>
            </section>
        </>
    )
}

export default ChangePassword