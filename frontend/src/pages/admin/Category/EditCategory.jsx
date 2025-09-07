import { useState, useEffect } from 'react'
import { Row, Col, Button, Container, Form } from 'react-bootstrap'
import AdminSidebar from '../../../components/AdminSidebar'
import { useParams, useNavigate } from 'react-router-dom';
import { useSpecificCategoriesQuery, useUpdateCategoryMutation } from '../../../redux/api/categoryApiSlice';
import { useGetAllOffersToAddQuery } from '../../../redux/api/usersApiSlice';
import { toast } from 'react-toastify';
import { CATEGORY_MESSAGES, NAME_REGEX } from '../../../constants/messageConstants';
import Footer from '../../../components/Footer';

const EditCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, refetch } = useSpecificCategoriesQuery(id);
    const [update] = useUpdateCategoryMutation();
    const { data: off } = useGetAllOffersToAddQuery()
    const offers = off?.offers

    const [updatingName, setUpdatingName] = useState("");
    const [offer, setOffer] = useState("")
    const category = data?.category

    useEffect(() => {
        if (category) {
            setUpdatingName(category.name || "");
            setOffer(category.offer || "")
        }
    }, [category]);

    //onclicking update
    const updateHandler = async (e, id) => {
        e.preventDefault();

        if (!updatingName.trim() || updatingName.length > 15 || !NAME_REGEX.test(updatingName)) {
            toast.error(CATEGORY_MESSAGES.VALIDATION_MSG);
            return;
        }

        try {
            await update({
                id,
                name: updatingName,
                offer: offer,
            }).unwrap();
            toast.success(CATEGORY_MESSAGES.CATEGORY_UPDATE_SUCCESS);
            navigate("/admin/category");
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || `${CATEGORY_MESSAGES.CATEGORY_UPDATE_FAILURE}`);
        }
    };
    return (
        <>
            <div className="main-app-container">
                <div className="d-flex">
                    <AdminSidebar />
                    <div className="main-content-wrapper background-one flex-grow-1">
                        <Container fluid className="mt-4 p-4">
                            <Row className="g-0">
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

                    </div>
                </div>
                <Footer />
            </div>
        </>
    )
}



export default EditCategory

