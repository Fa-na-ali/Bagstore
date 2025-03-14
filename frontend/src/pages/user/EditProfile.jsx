import React, { useState,useEffect } from 'react'
import { Container, Row, Col, Card, Button, FormControl, FormGroup, Form } from "react-bootstrap";
import { useProfileQuery, useUpdateUserMutation } from '../../redux/api/usersApiSlice';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';

const EditProfile = () => {
    const { data: user, refetch } = useProfileQuery()
    const navigate = useNavigate()
    const [update] = useUpdateUserMutation()
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

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
        const userData = { name, email, phone };
        try {
            const response = await update(userData).unwrap();
             navigate(`/verify-email?email=${email}`)
            console.log("Updated User Data:", response);  
            toast.success("User Edited successfully!"); 
            refetch(); 
            navigate("/account");
        
        } catch (error) {
            console.error("Update Error:", error);
            toast.error(error?.data?.message || "Failed to edit");
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