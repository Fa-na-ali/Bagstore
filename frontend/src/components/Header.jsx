import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Navbar, Nav, Badge, Container, Form, FormControl } from 'react-bootstrap';
import { FaUser, FaShoppingCart, FaHeart, FaSignOutAlt } from 'react-icons/fa';
import logo from "../assets/images/2.png"
import '../pages/auth/register.css'
import { logout } from "../redux/features/auth/authSlice";
import { useLogoutMutation } from '../redux/api/usersApiSlice';

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get user info from Redux state
    const { userInfo } = useSelector((state) => state.auth);
    console.log(userInfo);
    const [logoutApiCall] = useLogoutMutation();

    const logoutHandler = async () => {
        try {
            await logoutApiCall().unwrap();
            dispatch(logout());
            navigate("/login");
        } catch (error) {
            console.error(error);
        }
    };


    return (
        <>
            <Navbar expand="lg" bg="white" className="sticky-top shadow shadow-sm">
                <Container>

                    <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center">
                        <img
                            src={logo}
                            alt="BagStore Logo"
                            width="50"
                            height="auto"
                            className="d-inline-block align-top me-2"
                        />
                        <span className="caption">Bagbelle</span>
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="navbarNav" />

                    <Navbar.Collapse id="navbarNav">
                        <div className="d-flex w-100 justify-content-between align-items-center">

                            <Nav>
                                <Nav.Link as={Link} to="/" className='caption'>Home</Nav.Link>
                                <Nav.Link as={Link} to="/" className='caption'>All</Nav.Link>
                                <Nav.Link as={Link} to="/" className='caption'>Categories</Nav.Link>
                                <Nav.Link as={Link} to="/" className='caption'>About</Nav.Link>
                                <Nav.Link as={Link} to="/" className='caption'>Contact</Nav.Link>
                            </Nav>

                            <Form className="mx-auto" style={{ maxWidth: "20rem", flex: 1 }}>
                                <FormControl
                                    type="search"
                                    placeholder="Search"
                                    aria-label="Search"
                                    className="rounded-0"
                                />
                            </Form>


                            <Nav>
                                {userInfo? (
                                    <Nav.Link
                                        as={Link}
                                        to="/account-settings"
                                        className="caption"
                                    >
                                        {userInfo.name}
                                    </Nav.Link>
                                ) : (
                                    <Nav.Link
                                        as={Link}
                                        to="/login"
                                        className="caption"
                                    >
                                        <FaUser />
                                    </Nav.Link>
                                )}
                                <Nav.Link as={Link} to="/" className="me-3 position-relative caption">
                                    <FaShoppingCart size={17} />
                                    <Badge
                                        pill
                                        bg="danger"
                                        className="position-absolute top-3 start-100 translate-middle"
                                    >
                                        1
                                    </Badge>
                                </Nav.Link>
                                <Nav.Link as={Link} to="/" className='caption'><FaHeart /></Nav.Link>
                                <Nav.Link as={Link} to="/" className='caption'>My Orders</Nav.Link>
                                <Nav.Link onClick={logoutHandler} className="text-danger">
                                    <FaSignOutAlt /> Logout
                                </Nav.Link>
                            </Nav>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
};

export default Header;
