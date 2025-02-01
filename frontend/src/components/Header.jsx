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

   
    <header class="hero text-center text-white d-flex align-items-center">
        <div class="container">
            <h1>Shop the Best Bags</h1>
            <p>Discover stylish and high-quality bags for every occasion.</p>
            <a href="#" class="btn btn-primary btn-lg">Shop Now</a>
        </div>
    </header>

   
    <section class="container my-5">
        <h2 class="text-center">Featured Products</h2>
        <div class="row mt-4">
            <div class="col-md-4">
                <div class="card">
                    <img src="https://via.placeholder.com/300" class="card-img-top" alt="Bag 1"/>
                    <div class="card-body text-center">
                        <h5 class="card-title">Classic Leather Bag</h5>
                        <p class="card-text">$99.99</p>
                        <a href="#" class="btn btn-outline-primary">Add to Cart</a>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <img src="https://via.placeholder.com/300" class="card-img-top" alt="Bag 2"/>
                    <div class="card-body text-center">
                        <h5 class="card-title">Modern Backpack</h5>
                        <p class="card-text">$79.99</p>
                        <a href="#" class="btn btn-outline-primary">Add to Cart</a>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <img src="https://via.placeholder.com/300" class="card-img-top" alt="Bag 3"/>
                    <div class="card-body text-center">
                        <h5 class="card-title">Luxury Handbag</h5>
                        <p class="card-text">$129.99</p>
                        <a href="#" class="btn btn-outline-primary">Add to Cart</a>
                    </div>
                </div>
            </div>
        </div>
    </section>

   
    <section class="bg-light py-5">
        <div class="container">
            <h2 class="text-center">What Our Customers Say</h2>
            <div class="row mt-4">
                <div class="col-md-4">
                    <div class="testimonial text-center p-4">
                        <p>"Amazing quality! The leather bag is just perfect!"</p>
                        <h6>- Sarah M.</h6>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="testimonial text-center p-4">
                        <p>"Great customer service and fast delivery."</p>
                        <h6>- David R.</h6>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="testimonial text-center p-4">
                        <p>"Stylish bags at affordable prices. Love my new handbag!"</p>
                        <h6>- Emily W.</h6>
                    </div>
                </div>
            </div>
        </div>
    </section>

    
    <footer class="bg-dark text-white text-center py-3">
        <p>&copy; 2025 BagStore. All rights reserved.</p>
    </footer>

    


    </>
  
}

export default Header