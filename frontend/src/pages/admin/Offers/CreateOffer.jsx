import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Container } from "react-bootstrap";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import AdminSidebar from "../../../components/AdminSidebar";

const CreateOffer = () => {
    const [formData, setFormData] = useState({
        name: "",
        type: "products",
        description: "",
        activation: "",
        expiry: "",
        discount: "",
        minAmount: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form Data:", formData);
        // Add your form submission logic here
    };

    // Initialize flatpickr for date pickers
    useEffect(() => {
        const activationPicker = flatpickr("#activation", {
            dateFormat: "d-M-Y",
            minDate: "today",
            onChange: function (selectedDates) {
                const activationDate = selectedDates[0];
                if (activationDate) {
                    expiryPicker.set("minDate", new Date(activationDate.getTime() + 24 * 60 * 60 * 1000));
                    expiryPicker.setDate(null);
                }
            },
        });

        const expiryPicker = flatpickr("#expiry", {
            dateFormat: "d-M-Y",
            minDate: "today",
        });

        return () => {
            activationPicker.destroy();
            expiryPicker.destroy();
        };
    }, []);

    return (
        <Container fluid>
            <Row className="g-0 background-one">
                <Col lg={2} className="d-none d-lg-block">
                    <AdminSidebar />
                </Col>
                <Col md={9}>
                <h2 className="ms-5 my-5 heading text-center">ADD OFFER</h2>
                    <Form id="offer-form" onSubmit={handleSubmit} encType="multipart/form-data" className="ms-5">
                        <Form.Group className="mb-3">
                            <Form.Label>Offer Name</Form.Label>
                            <Form.Control
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Enter offer name (e.g., Dhamaka2024)"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={{ width: "100%" }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Offer Applicable</Form.Label>
                            <Form.Select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                style={{ width: "100%" }}
                            >
                                <option value="products">Products</option>
                                <option value="category">Category</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                id="description"
                                name="description"
                                placeholder="Type here"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                style={{ width: "100%", height: "95px" }}
                            />
                        </Form.Group>

                        <Row className="mb-3">
                            <Col>
                                <Form.Group>
                                    <Form.Label>Activation Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        id="activation"
                                        name="activation"
                                        placeholder="dd-mm-yyyy"
                                        value={formData.activation}
                                        onChange={handleChange}
                                        required
                                        style={{ width: "100%" }}
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group>
                                    <Form.Label>Expiry Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        id="expiry"
                                        name="expiry"
                                        placeholder="dd-mm-yyyy"
                                        value={formData.expiry}
                                        onChange={handleChange}
                                        required
                                        style={{ width: "100%" }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col>
                                <Form.Group>
                                    <Form.Label>Discount Rate</Form.Label>
                                    <Form.Control
                                        type="number"
                                        id="discount"
                                        name="discount"
                                        value={formData.discount}
                                        onChange={handleChange}
                                        required
                                        style={{ width: "100%" }}
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group>
                                    <Form.Label>Criteria Amount in &#8377;</Form.Label>
                                    <div className="currency-input">

                                        <Form.Control
                                            type="number"
                                            id="min_amount"
                                            name="min_amount"
                                            placeholder="Minimum purchase amount"
                                            value={formData.minAmount}
                                            onChange={handleChange}
                                            required
                                            style={{ width: "100%" }}
                                        />
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="gap-3 mt-4 text-center">
                            <Button className="button-custom " type="submit">
                                Create Offer
                            </Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default CreateOffer;