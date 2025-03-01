import React,{useEffect} from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { FaFacebookF, FaTwitter, FaInstagram, FaEdit, FaTrash } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router";
import { useDeleteAddressMutation, useProfileQuery } from "../../redux/api/usersApiSlice";
import { toast } from "react-toastify";


const Account = () => {
    
    const navigate = useNavigate()
    const {data:user,refetch} = useProfileQuery()
    const [deleteAddress] = useDeleteAddressMutation();
    console.log("useraccount",user)

    useEffect(() => {
        refetch(); 
    }, [refetch]); 

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this address?")) {
            try {
                await deleteAddress(id).unwrap();
                toast.success("Address deleted successfully!");
                refetch(); // Refresh user data
            } catch (error) {
                console.error("Failed to delete address", error);
                toast.error("Error deleting address.");
            }
        }
    };

    return (
        <section className="vh-100" style={{ backgroundColor: "#f4f5f7" }}>
            <Container className="py-5">
                <Row className="d-flex justify-content-center align-items-center">
                    <Col lg={12} className="mb-4 mb-lg-0">
                        <Card className="mb-3" style={{ borderRadius: ".5rem" }}>
                            <Row className="g-0">
                                <Col md={4} className="text-center text-white d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: "#6c757d", borderTopLeftRadius: ".5rem", borderBottomLeftRadius: ".5rem" }}>
                                    <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp" alt="Avatar" className="img-fluid my-4" style={{ width: "80px" }} />
                                    <h5>{user?.name}</h5>
                                    <Link to='/account/edit' style={{ textDecoration: "none", color: "inherit" }}>
                                        <FaEdit className="mb-4" />
                                    </Link>
                                </Col>
                                <Col md={8}>
                                    <Card.Body className="p-4">
                                        <h6>Profile</h6>
                                        <hr className="mt-0 mb-4" />
                                        <Row className="pt-1">
                                            <Col xs={6} className="mb-3">
                                                <h6>Email</h6>
                                                <p className="text-muted">{user?.email}</p>
                                            </Col>
                                            <Col xs={6} className="mb-3">
                                                <h6>Phone</h6>
                                                <p className="text-muted">{user?.phone}</p>
                                            </Col>
                                        </Row>
                                        <h6>Address</h6>
                                        <hr className="mt-0 mb-4" />
                                        <Row className="pt-1">
                                        {user?.address?.length > 0 ? (
                                                user.address.map((address,index) => (
                                            <Col xs={6} className="mb-3" key={address._id}>
                                                <Card style={{height:'170px'}}>
                                                    <Card.Body>
                                                        <div className="d-flex justify-content-between">
                                                            <Card.Title>{`Address ${index+1}`}</Card.Title>
                                                            <div>
                                                                <Button variant="outline-secondary" size="sm" className="me-2" onClick={()=>{navigate(`/account/edit-address/${address._id}`)}}><FaEdit /></Button>
                                                                <Button variant="outline-secondary" size="sm"  onClick={() => handleDelete(address._id)}><FaTrash /></Button>
                                                            </div>
                                                        </div>
                                                        
                                                        <Card.Text>
                                                            {address.houseName},{address.town},{address.street},
                                                        {address.state}, {address.zipcode}, {address.country} <br />
                                                        <strong>Phone:</strong> {address.phone}
                                                        </Card.Text>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                                ))):(
                                                    <Col xs={6} className="mb-3">
                                                    <Card>
                                                        <Card.Body>
                                                            <p className="text-muted text-center">No addresses added yet.</p>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                                )}
                                            <Col xs={6} className="mb-3">
                                                <Card style={{height:'170px'}}>
                                                    <Card.Body>
                                                        <Link to='/account/add-address' style={{ textDecoration: "none", color: "inherit" }}>
                                                            <Card.Title className="text-center mt-5">+ Add Address</Card.Title>
                                                        </Link>

                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        </Row>

                                    </Card.Body>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default Account;
