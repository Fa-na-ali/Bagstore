import { useState, useEffect } from "react";
import { Form, Button, Row, Col, Container } from "react-bootstrap";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import AdminSidebar from "../../../components/AdminSidebar";
import { useAddOfferMutation } from "../../../redux/api/usersApiSlice";
import { useNavigate } from "react-router";
import { OFFER_MESSAGES } from "../../../constants/messageConstants";
import { toast } from "react-toastify";

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
    const [errors, setErrors] = useState({});
    const [addOffer] = useAddOfferMutation()
    const navigate = useNavigate()

    const validateForm = () => {
        let newErrors = {};
        if (!formData.name.trim() || formData.name.length > 20) newErrors.name = "Offer name must be atmost 20 characters long";
        if (!formData.description.trim() || formData.description.length > 50) newErrors.description = "Description must be atmost 50 characters long";
        if (!formData.activation) newErrors.activation = "Activation date is required";
        if (!formData.expiry) newErrors.expiry = "Expiry date is required";
        if (formData.activation && formData.expiry && new Date(formData.expiry) <= new Date(formData.activation)) {
            newErrors.expiry = "Expiry date must be after activation date";
        }
        if (!formData.discount || formData.discount <= 0 || formData.discount > 100) newErrors.discount = "Enter a valid discount";
        if (!formData.minAmount || formData.minAmount <= 0 || formData.minAmount > 100000) newErrors.minAmount = "Enter a valid minimum amount";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const handleDateChange = (name, date) => {
        if (date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const formattedDate = `${year}-${month}-${day}`;

            setFormData((prev) => ({
                ...prev,
                [name]: formattedDate,
            }));
        }
    };

    //on submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            const response = await addOffer(formData).unwrap();
            navigate('/admin/offers')
            toast.success(response.message);
        } catch (err) {
            toast.error(err.data?.message || `${OFFER_MESSAGES.OFFER_ADD_FAILURE}`);
        }

    };

    useEffect(() => {
        const activationPicker = flatpickr("#activation", {
            dateFormat: "d-M-Y",
            minDate: "today",
            onChange: function (selectedDates) {
                const activationDate = selectedDates[0];
                if (activationDate) {
                    expiryPicker.set("minDate", new Date(activationDate.getTime() + 24 * 60 * 60 * 1000));
                    expiryPicker.setDate(null);
                    handleDateChange("activation", activationDate);
                }
            },
        });

        const expiryPicker = flatpickr("#expiry", {
            dateFormat: "d-M-Y",
            minDate: "today",
            onChange: function (selectedDates) {
                const expiryDate = selectedDates[0];
                if (expiryDate) {
                    handleDateChange("expiry", expiryDate);
                }
            },
        });

        return () => {
            activationPicker.destroy();
            expiryPicker.destroy();
        };
    }, []);


    return (
        <div className="d-flex">
            <AdminSidebar />
            <div className="main-content-wrapper background-one flex-grow-1">
                <Container fluid className="mt-4 p-4">
                    <Row className="g-0">
                        <Col md={9}>
                            <h2 className="ms-5 my-5 heading text-center">ADD OFFER</h2>
                            <Form id="offer-form" onSubmit={handleSubmit} encType="multipart/form-data" className="ms-5 .
                    23">
                                <Form.Group className="mb-3">
                                    <Form.Label>Offer Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="name"
                                        name="name"
                                        placeholder="Enter offer name (e.g., Dhamaka2024)"
                                        value={formData.name}
                                        onChange={handleChange}
                                        isInvalid={!!errors.name}
                                        style={{ width: "100%" }}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Offer Applicable</Form.Label>
                                    <Form.Select
                                        id="type"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}

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
                                        isInvalid={!!errors.description}
                                        style={{ width: "100%", height: "95px" }}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
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
                                                isInvalid={!!errors.activation}
                                                style={{ width: "100%" }}
                                            />
                                            <Form.Control.Feedback type="invalid">{errors.activation}</Form.Control.Feedback>
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
                                                isInvalid={!!errors.expiry}
                                                style={{ width: "100%" }}
                                            />
                                            <Form.Control.Feedback type="invalid">{errors.expiry}</Form.Control.Feedback>
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
                                                isInvalid={!!errors.discount}
                                                style={{ width: "100%" }}
                                            />
                                            <Form.Control.Feedback type="invalid">{errors.discount}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label>Criteria Amount in &#8377;</Form.Label>
                                            <div className="currency-input">

                                                <Form.Control
                                                    type="number"
                                                    id="min_amount"
                                                    name="minAmount"
                                                    placeholder="Minimum purchase amount"
                                                    value={formData.minAmount}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.minAmount}
                                                    style={{ width: "100%" }}
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.minAmount}</Form.Control.Feedback>
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
            </div>
        </div>
    );
};

export default CreateOffer;