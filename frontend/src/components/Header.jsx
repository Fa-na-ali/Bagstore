import React from 'react'
import { Link } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import { FaUser, FaShoppingCart, FaHeart, FaSignOutAlt, FaClipboardList } from "react-icons/fa";


const Header = () => {
    return <>

        <Navbar expand="lg" bg="light" className="shadow-sm">
            <Container>
                {/* Left Side - Brand and Links */}
                <Navbar.Brand as={Link} to="/" className="fw-bold">
                    BagStore
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarNav" />
                <Navbar.Collapse id="navbarNav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/">All</Nav.Link>
                        <Nav.Link as={Link} to="/">Categories</Nav.Link>
                        <Nav.Link as={Link} to="/">About</Nav.Link>
                        <Nav.Link as={Link} to="/">Contact</Nav.Link>
                    </Nav>

                    {/* Right Side - Icons */}
                    <Nav>
                        <Nav.Link as={Link} to="/"><FaUser /></Nav.Link>
                        <Nav.Link as={Link} to="/"><FaShoppingCart /></Nav.Link>
                        <Nav.Link as={Link} to="/"><FaHeart /></Nav.Link>
                        <Nav.Link as={Link} to="/">My Orders</Nav.Link>
                        <Nav.Link as={Link} to="/" className="text-danger"><FaSignOutAlt /> Logout</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    </>

}

export default Header