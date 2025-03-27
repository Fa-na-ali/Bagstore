import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Container } from "react-bootstrap";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import AdminSidebar from "../../../components/AdminSidebar";
import { useAddCouponMutation } from "../../../redux/api/usersApiSlice";
import { toast } from "react-toastify";



const AddCoupon = () => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        activation: "",
        expiry: "",
        discount: "",
        status: true,
        minAmount: "",
        maxAmount: "",
        limit: "",
        type: "single",
    });
    const [addCoupon] = useAddCouponMutation()


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        console.log("Form Data:", formData);
        try {
            const response = await addCoupon(formData).unwrap();
            console.log(response)
            toast.success(response.message); 
        } catch (err) {
            toast.error(err.data?.message || "Failed to add coupon"); 
        }
    };

    // const handleDateChange = (name, date) => {
    //     if (date) {
    //         const year = date.getFullYear();
    //         const month = String(date.getMonth() + 1).padStart(2, "0");
    //         const day = String(date.getDate()).padStart(2, "0"); 
    //         const formattedDate = `${year}-${month}-${day}`;
            
    //         setFormData((prev) => ({
    //             ...prev,
    //             [name]: formattedDate, 
    //         }));
    //     }
    // };
    
    
 React.useEffect(() => {
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
                    <h2 className="ms-5 my-5 heading text-center">ADD COUPON</h2>
                    <Form id="coupon-form" onSubmit={handleSubmit} className="ms-5">
                        <Form.Group className="mb-3">
                            <Form.Label>Coupon Name</Form.Label>
                            <Form.Control
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Enter Coupon Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                id="description"
                                name="description"
                                rows={4}
                                placeholder="Enter Coupon description..."
                                value={formData.description}
                                onChange={handleChange}
                                required
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
                                        value={formData.activation}
                                        onChange={handleChange}
                                        required
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
                                        value={formData.expiry}
                                        onChange={handleChange}
                                        required
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
                                        placeholder="Enter amount"
                                        value={formData.discount}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group>
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value={true}>Active</option>
                                        <option value={false}>Inactive</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col>
                                <Form.Group>
                                    <Form.Label>Min Amount</Form.Label>
                                    <div className="currency-input">
                                        <span className="currency-symbol">&#8377;</span>
                                        <Form.Control
                                            type="number"
                                            id="min_amount"
                                            name="minAmount"
                                            placeholder="Minimum purchase amount"
                                            value={formData.min_amount}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group>
                                    <Form.Label>Max Amount</Form.Label>
                                    <div className="currency-input">
                                        <span className="currency-symbol">&#8377;</span>
                                        <Form.Control
                                            type="number"
                                            id="max_amount"
                                            name="maxAmount"
                                            placeholder="Maximum purchase amount"
                                            value={formData.max_amount}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col>
                                <Form.Group>
                                    <Form.Label>Usage Limit</Form.Label>
                                    <Form.Control
                                        type="number"
                                        id="limit"
                                        name="limit"
                                        placeholder="Enter limit"
                                        value={formData.limit}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group>
                                    <Form.Label>Usage Type</Form.Label>
                                    <Form.Select
                                        id="type"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="single">Single</option>
                                        <option value="multiple">Multiple</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="text-center gap-3 mt-4">
                            <Button className="button-custom" type="submit">
                                Create Coupon
                            </Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default AddCoupon;