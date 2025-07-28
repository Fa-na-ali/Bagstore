import { useState } from 'react'
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { useNavigate } from 'react-router';
import { useAddAddressMutation } from '../../redux/api/usersApiSlice';
import { toast } from 'react-toastify';

const AddAddress = () => {
    const [name, setName] = useState("")
    const [houseName, setHouseName] = useState("");
    const [town, setTown] = useState("");
    const [street, setStreet] = useState("");
    const [state, setState] = useState("");
    const [zipcode, setZipcode] = useState("");
    const [country, setCountry] = useState("");
    const [phone, setPhone] = useState("");
    const [addAddress] = useAddAddressMutation();
    const navigate = useNavigate();

    //on submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { data } = await addAddress({
                name, houseName, town, street, state, zipcode, country, phone
            }).unwrap();

            toast.success('Address added successfully!');
            navigate(-1);

        } catch (error) {
            toast.error(error?.data?.message || 'Failed to add address');
        }
    };

    return (
        <>
            <section className="vh-100" style={{ backgroundColor: "#f4f5f7" }}>
                <Container className="py-5 h-100">
                    <Row className="d-flex justify-content-center align-items-center h-100">
                        <Col lg={12} className="mb-4 mb-lg-0">
                            <Card className="" style={{ borderRadius: ".5rem", padding: "2rem" }}>
                                <h2 className='text-center my-2 heading'>ADD ADDRESS</h2>
                                <Form onSubmit={handleSubmit}>
                                    <Row className="mb-3 my-5">
                                        <Form.Group as={Col} controlId="formName">
                                            <Form.Label className='caption'>Name </Form.Label>
                                            <Form.Control type="text"
                                                value={name} onChange={(e) => setName(e.target.value)}
                                            />
                                        </Form.Group>
                                        <Form.Group as={Col} controlId="formName">
                                            <Form.Label className='caption'>House Name</Form.Label>
                                            <Form.Control type="text"
                                                value={houseName} onChange={(e) => setHouseName(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Row>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} controlId="formName">
                                            <Form.Label className='caption'>Town </Form.Label>
                                            <Form.Control type="text"
                                                value={town} onChange={(e) => setTown(e.target.value)}
                                            />
                                        </Form.Group>
                                        <Form.Group as={Col} controlId="formName">
                                            <Form.Label className='caption'>Street</Form.Label>
                                            <Form.Control type="text"
                                                value={street} onChange={(e) => setStreet(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Row>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} controlId="formName">
                                            <Form.Label className='caption'>Zipcode </Form.Label>
                                            <Form.Control type="text"
                                                value={zipcode} onChange={(e) => setZipcode(e.target.value)}
                                            />
                                        </Form.Group>
                                        <Form.Group as={Col} controlId="formName">
                                            <Form.Label className='caption'>State</Form.Label>
                                            <Form.Control type="text"
                                                value={state} onChange={(e) => setState(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Row>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} controlId="formName">
                                            <Form.Label className='caption'>Country</Form.Label>
                                            <Form.Control type="text"
                                                value={country} onChange={(e) => setCountry(e.target.value)}
                                            />
                                        </Form.Group>
                                        <Form.Group as={Col} controlId="formName">
                                            <Form.Label className='caption'>Phone</Form.Label>
                                            <Form.Control type="text"
                                                value={phone} onChange={(e) => setPhone(e.target.value)}
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

export default AddAddress