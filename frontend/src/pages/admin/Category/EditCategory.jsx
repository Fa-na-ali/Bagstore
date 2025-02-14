import React, { useState, useEffect } from 'react'
import { Row, Col, Button, Container, Form } from 'react-bootstrap'
import { MdOutlineAdd } from "react-icons/md";
import AdminSidebar from '../../../components/AdminSidebar'
import { useParams, useNavigate } from 'react-router-dom';
import { useSpecificCategoriesQuery, useUpdateCategoryMutation } from '../../../redux/api/categoryApiSlice';
import { toast } from 'react-toastify';
const EditCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
   console.log("id",id)
    const { data: category, refetch, isLoading, isError } = useSpecificCategoriesQuery(id);
    const [update, { isLoading: isUpdating }] = useUpdateCategoryMutation();

    const [updatingName, setUpdatingName] = useState("");
console.log("category",category)
    useEffect(() => {
        if (category) {
            setUpdatingName(category.name || "");
        }
    }, [category]);

    const updateHandler = async (e, id) => {
        e.preventDefault();
        try {
            await update({
                id,
                name: updatingName,
            }).unwrap();
            console.log(updatingName)
            toast.success("Category updated successfully!");
            navigate("/admin/category");
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to update the category.");
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
                        <h2 className='ms-5 my-5 heading'>
                            EDIT CATEGORY
                        </h2>
                        <Form className='ms-5'>
                            <Form.Group controlId="categoryName">
                                <Form.Label className='caption'>Category Name</Form.Label>
                                <Form.Control type="text" 
                                    value={updatingName}
                                    onChange={(e) => setUpdatingName(e.target.value)} />
                            </Form.Group>
                        </Form>
                    </Col>
                    <Col lg={4} className="my-5">
                        <Button className="me-2 button-custom" onClick={(e) => { updateHandler(e, category._id) }}>
                            <span>Edit Category</span>
                        </Button>
                    </Col>
                </Row>
            </Container>
        </>
    )
}



export default EditCategory

