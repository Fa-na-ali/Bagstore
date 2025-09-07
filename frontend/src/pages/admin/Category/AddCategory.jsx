import { useState } from "react";
import { Row, Col, Button, Container, Form } from "react-bootstrap";
import { MdOutlineAdd } from "react-icons/md";
import AdminSidebar from "../../../components/AdminSidebar";
import { useAddCategoryMutation } from "../../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { useGetAllOffersToAddQuery } from "../../../redux/api/usersApiSlice";
import { CATEGORY_MESSAGES, NAME_REGEX } from "../../../constants/messageConstants";
import Footer from "../../../components/Footer";

const AddCategory = () => {
    const { data: off } = useGetAllOffersToAddQuery()
    const offers = off?.offers
    const [name, setName] = useState("");
    const [offer, setOffer] = useState("")
    const [createCategory] = useAddCategoryMutation();
    const navigate = useNavigate()

    const handleCreateCategory = async (e) => {
        e.preventDefault();

        if (!name.trim() || name.length > 15 || !NAME_REGEX.test(name)) {
            toast.error(CATEGORY_MESSAGES.VALIDATION_MSG);
            return;
        }

        try {
            const result = await createCategory({ name, offer }).unwrap();
            setName("");
            if (result?.category?.name) {
                toast.success(`${result?.category?.name} ${CATEGORY_MESSAGES.CATEGORY_ADD_SUCCESS}`);
                navigate('/admin/category')
            } else if (result.message) {
                toast.error(result.message);
            } else {
                toast.error(CATEGORY_MESSAGES.CATEGORY_ADD_FAILURE);
            }
        } catch (error) {
            toast.error(error?.data.message);
        }
    };

    return (
        <div className="main-app-container">
            <div className="d-flex">
                <AdminSidebar />
                <div className="main-content-wrapper  flex-grow-1 h-100">
                    <Container fluid className="mt-4 p-4">
                        <Row className="g-0 ">
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
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AddCategory;
