import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { useProfileQuery, useResendOtpMutation,} from '../../redux/api/usersApiSlice';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { updateProfile } from '../../redux/features/auth/authSlice';

const EditProfile = () => {
    const { data: user, refetch } = useProfileQuery()
    const navigate = useNavigate()
    
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
    const dispatch = useDispatch()
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

        try {

            await resendOtp({ email:user.email }).unwrap();
            toast.info("OTP sent to your email. Please verify.");
             dispatch(updateProfile({name,email,phone}))
            navigate(`/verify-email?email=${user.email}`)


        } catch (error) {
            console.error("OTP Sending Error:", error);
            toast.error(error?.data?.message || "Failed to send OTP");
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
                                                    onChange={(e) => setName(e.target.value)} />
                                            </Form.Group>
                                        </Row>
                                        <Row className="g-0 pt-2 w-100">
                                            <Form.Group controlId="name" className="w-100">
                                                <Form.Label className='caption'>Email</Form.Label>
                                                <Form.Control type="text" value={email}
                                                    onChange={(e) => setEmail(e.target.value)} />
                                            </Form.Group>
                                        </Row>
                                        <Row className="g-0 pt-2 w-100">
                                            <Form.Group controlId="name" className="w-100">
                                                <Form.Label className='caption'>Phone</Form.Label>
                                                <Form.Control type="text" value={phone}
                                                    onChange={(e) => setPhone(e.target.value)} />
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