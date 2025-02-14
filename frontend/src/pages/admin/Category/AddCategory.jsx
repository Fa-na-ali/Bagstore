import React, { useState } from "react";
import { Row, Col, Button, Container, Form } from "react-bootstrap";
import { MdOutlineAdd } from "react-icons/md";
import AdminSidebar from "../../../components/AdminSidebar";
import { useAddCategoryMutation } from "../../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";

const AddCategory = () => {
    const [name, setName] = useState("");
    const [createCategory] = useAddCategoryMutation();

    const handleCreateCategory = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Category name is required");
            return;
        }

        try {
            const result = await createCategory({ name }).unwrap();
            setName("");
            if (result.name) {
                toast.success(`${result.name} category created successfully.`);
            } else if (result.message) {
                toast.error(result.message); 
            } else {
                toast.error("Unexpected response, try again.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Creating category failed, try again.");
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
