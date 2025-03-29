import React, { useState } from "react";
import { Row, Col, Button, Container, Form } from "react-bootstrap";
import { MdOutlineAdd } from "react-icons/md";
import AdminSidebar from "../../../components/AdminSidebar";
import { useAddCategoryMutation } from "../../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { useGetAllOffersToAddQuery } from "../../../redux/api/usersApiSlice";

const AddCategory = () => {
    const { data: off } = useGetAllOffersToAddQuery()
      console.log(off)
      const offers = off?.offers
    const [name, setName] = useState("");
    const [offer, setOffer] = useState("")
    const [createCategory] = useAddCategoryMutation();
    const navigate=useNavigate()

    const handleCreateCategory = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Category name is required");
            return;
        }

        try {
            const result = await createCategory({ name,offer }).unwrap();
            console.log(result)
            setName("");
            if (result?.category?.name) {
                toast.success(`${result?.category?.name} category created successfully.`);
                navigate('/admin/category')
            } else if (result.message) {
                toast.error(result.message); 
            } else {
                toast.error("Unexpected response, try again.");
            }
        } catch (error) {
            console.error(error);
            toast.error(error?.data.message);
        }
    };

    return (
        <>
            <Container fluid>
                <Row className="g-0 background-one">
                    <Col lg={2} className="d-none d-lg-block">
                        <AdminSidebar />
                    </Col>
                    <Col lg={6}>
                        <h2 className="ms-5 my-5 heading">ADD CATEGORY</h2>
                        <Form className="ms-5">
                            <Form.Group controlId="categoryName">
                                <Form.Label className="caption">Category Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter category name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="offer" className="mt-3">
                            <Form.Label className="caption">Offer</Form.Label>
                            <Form.Select name="offer" value={offer} onChange={(e) => setOffer(e.target.value)}>
                                <option value="none">None</option>
                                {offers?.filter((o) => o.type === "category").map((o) => (
                                    <option key={o.name} value={o.name}>
                                        {o.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        </Form>
                    </Col>
                    <Col lg={4} className="my-5">
                        <Button className="me-2 button-custom" onClick={handleCreateCategory}>
                            <MdOutlineAdd /> <span>Add New Category</span>
                        </Button>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default AddCategory;
