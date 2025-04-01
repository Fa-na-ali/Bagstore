import React, { useState, useEffect } from 'react'
import { Row, Col, Button, Container, Form } from 'react-bootstrap'
import { MdOutlineAdd } from "react-icons/md";
import AdminSidebar from '../../../components/AdminSidebar'
import { useParams, useNavigate } from 'react-router-dom';
import { useSpecificCategoriesQuery, useUpdateCategoryMutation } from '../../../redux/api/categoryApiSlice';
import { useGetAllOffersToAddQuery } from '../../../redux/api/usersApiSlice';
import { toast } from 'react-toastify';

const EditCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    console.log("id", id)
    const { data, refetch, isLoading, isError } = useSpecificCategoriesQuery(id);
    const [update, { isLoading: isUpdating }] = useUpdateCategoryMutation();
    const { data: off } = useGetAllOffersToAddQuery()
    console.log(off)
    const offers = off?.offers

    const [updatingName, setUpdatingName] = useState("");
    const [offer, setOffer] = useState("")
    const category = data?.category
    console.log("category", category)
    useEffect(() => {
        if (category) {
            setUpdatingName(category.name || "");
            setOffer(category.offer || "")
        }
    }, [category]);

    const updateHandler = async (e, id) => {
        e.preventDefault();
        try {
            await update({
                id,
                name: updatingName,
                offer:offer,
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

