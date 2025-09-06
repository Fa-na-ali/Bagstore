import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { useProfileQuery, useResendOtpMutation, } from '../../redux/api/usersApiSlice';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { updateProfile } from '../../redux/features/auth/authSlice';
import { EMAIL_REGEX, NAME_REGEX, PHONE_REGEX, USER_MESSAGES } from '../../constants/messageConstants';

const EditProfile = () => {
    const { data } = useProfileQuery()
    const user = data?.user
    const navigate = useNavigate()
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [errors, setErrors] = useState({});
    const [resendOtp] = useResendOtpMutation();
    const dispatch = useDispatch()

    const validate = () => {
        const newErrors = {};
        if (!name || name.length > 25 || !NAME_REGEX.test(name)) newErrors.name = 'Name must be atmost 25 characters long';
        if (!email || !EMAIL_REGEX.test(email)) newErrors.email = 'Enter a valid email';
        if (!phone || !PHONE_REGEX.test(phone)) newErrors.phone = 'Enter a valid phone number';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
            setPhone(user.phone || "");
        }

    }, [user]);

    //on submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            return;
        }
        try {
            await resendOtp({ email: user.email }).unwrap();
            toast.info(USER_MESSAGES.USER_OTP_SENT);
            dispatch(updateProfile({ name, email, phone }))
            navigate(`/verify-email?email=${user.email}`)
        } catch (error) {
            toast.error(error?.data?.message || USER_MESSAGES.USER_OTP_SENT_FAILURE);
        }
    };

    return (
        <>
            <section className="vh-100" style={{ backgroundColor: "#f4f5f7" }}>
                <Container className="py-5 h-100">
                    <Row className="d-flex justify-content-center align-items-center h-100">
                        <Col lg={6} className="mb-4 mb-lg-0">
                            <Card className="mb-3 d-flex justify-content-center align-items-center" style={{ borderRadius: ".5rem", padding: "2rem" }}>
                                <Col lg={8} className="d-flex flex-column align-items-center">
                                    <h2 className=' text-center heading'>EDIT PROFILE</h2>
                                    <Form className="w-100" onSubmit={handleSubmit}>
                                        <Row className="g-0 pt-3 w-100">
                                            <Form.Group controlId="name" className="w-100">
                                                <Form.Label className='caption'>Name</Form.Label>
                                                <Form.Control type="text" value={name}
                                                    onChange={(e) => setName(e.target.value)} isInvalid={!!errors.name} />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.name}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Row>
                                        <Row className="g-0 pt-2 w-100">
                                            <Form.Group controlId="name" className="w-100">
                                                <Form.Label className='caption'>Email</Form.Label>
                                                <Form.Control type="text" value={email}
                                                    onChange={(e) => setEmail(e.target.value)} isInvalid={!!errors.email} />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.email}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Row>
                                        <Row className="g-0 pt-2 w-100">
                                            <Form.Group controlId="name" className="w-100">
                                                <Form.Label className='caption'>Phone</Form.Label>
                                                <Form.Control type="text" value={phone}
                                                    onChange={(e) => setPhone(e.target.value)} isInvalid={!!errors.phone} />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.phone}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Row>
                                        <Row className="g-0 pt-2 w-100">
                                            <Button className='button-custom w-100 my-5' type="submit" >
                                                SAVE
                                            </Button>
                                        </Row>
                                    </Form>
                                </Col>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

        </>
    )
}

export default EditProfile