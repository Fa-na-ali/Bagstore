import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router';
import { toast } from 'react-toastify'
import { useGetAddressQuery, useUpdateAddressMutation } from '../../redux/api/usersApiSlice';
const EditAddress = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data, refetch,isLoading } = useGetAddressQuery(id)
    console.log("data",data)
    const address= data?.address
    const [updateAddress] = useUpdateAddressMutation()

    const [formData, setFormData] = useState({
        name: "",
        houseName: "",
        town: "",
        street: "",
        zipcode: "",
        state: "",
        country: "",
        phone: "",
    });

    useEffect(() => {
        if (address) {
            setFormData({
                name: address.name || "",
                houseName: address.houseName || "",
                town: address.town || "",
                street: address.street || "",
                zipcode: address.zipcode || "",
                state: address.state || "",
                country: address.country || "",
                phone: address.phone || "",
            });
        }
    }, [address]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateAddress({ id, ...formData }).unwrap();
            toast.success("User Edited successfully!");
            navigate(-1);
        } catch (error) {
            console.error("Failed to update address", error);
        }
    };

    return (
        <>
            <section className="vh-100" style={{ backgroundColor: "#f4f5f7" }}>
                <Container className="py-5 h-100">
                    <Row className="d-flex justify-content-center align-items-center h-100">
                        <Col lg={12} className="mb-4 mb-lg-0">
                            <Card className="" style={{ borderRadius: ".5rem", padding: "2rem" }}>
                                <h2 className='text-center my-2 heading'>EDIT ADDRESS</h2>
                                <Form onSubmit={handleSubmit}>
                                    <Row className="mb-3 my-5">
                                        <Form.Group as={Col} controlId="formName">
                                            <Form.Label className='caption'>Name </Form.Label>
                                            <Form.Control type="text"
                                                name="name" value={formData.name} onChange={handleChange}
                                            />
                                        </Form.Group>
                                        <Form.Group as={Col} controlId="formName">
                                            <Form.Label className='caption'>House Name</Form.Label>
                                            <Form.Control type="text"
                                                name="houseName" value={formData.houseName} onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Row>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} controlId="formName">
                                            <Form.Label className='caption'>Town </Form.Label>
                                            <Form.Control type="text"
                                                name="town" value={formData.town} onChange={handleChange}
                                            />
                                        </Form.Group>
                                        <Form.Group as={Col} controlId="formName">
                                            <Form.Label className='caption'>Street</Form.Label>
                                            <Form.Control type="text"
                                                name="street" value={formData.street} onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Row>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} controlId="formName">
                                            <Form.Label className='caption'>Zipcode </Form.Label>
                                            <Form.Control type="text"
                                                name="zipcode" value={formData.zipcode} onChange={handleChange}
                                            />
                                        </Form.Group>
                                        <Form.Group as={Col} controlId="formName">
                                            <Form.Label className='caption'>State</Form.Label>
                                            <Form.Control type="text"
                                                name="state" value={formData.state} onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Row>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} controlId="formName">
                                            <Form.Label className='caption'>Country</Form.Label>
                                            <Form.Control type="text"
                                                name="country" value={formData.country} onChange={handleChange}
                                            />
                                        </Form.Group>
                                        <Form.Group as={Col} controlId="formName">
                                            <Form.Label className='caption'>Phone</Form.Label>
                                            <Form.Control type="text"
                                                name="phone" value={formData.phone} onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Row>
                                    <Button className='button-custom w-100 my-5' type="submit" >
                                        SAVE
                                    </Button>
                                </Form>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

        </>
    )
}

export default EditAddress