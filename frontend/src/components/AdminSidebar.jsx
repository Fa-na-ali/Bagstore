import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { FaTachometerAlt, FaChartArea, FaLock, FaChartLine, FaChartPie, FaChartBar, FaGlobe, FaBuilding, FaCalendar, FaUsers, FaMoneyBill } from "react-icons/fa";

const AdminSidebar=()=>{
  return (
    <Navbar bg="dark" expand="lg" className="d-lg-block sidebar collapse vh-100">
      <Container fluid className="position-sticky">
        <Nav className="flex-column mx-3 mt-4">
          <Nav.Link href="#" className="py-2 ripple">
            <FaTachometerAlt className="me-3" />
            Main Dashboard
          </Nav.Link>
          <Nav.Link href="#" className="py-2 ripple active">
            <FaChartArea className="me-3" />
            Website Traffic
          </Nav.Link>
          <Nav.Link href="#" className="py-2 ripple">
            <FaLock className="me-3" />
            Password
          </Nav.Link>
          <Nav.Link href="#" className="py-2 ripple">
            <FaChartLine className="me-3" />
            Analytics
          </Nav.Link>
          <Nav.Link href="#" className="py-2 ripple">
            <FaChartPie className="me-3" />
            SEO
          </Nav.Link>
          <Nav.Link href="#" className="py-2 ripple">
            <FaChartBar className="me-3" />
            Orders
          </Nav.Link>
          <Nav.Link href="#" className="py-2 ripple">
            <FaGlobe className="me-3" />
            International
          </Nav.Link>
          <Nav.Link href="#" className="py-2 ripple">
            <FaBuilding className="me-3" />
            Partners
          </Nav.Link>
          <Nav.Link href="#" className="py-2 ripple">
            <FaCalendar className="me-3" />
            Calendar
          </Nav.Link>
          <Nav.Link href="#" className="py-2 ripple">
            <FaUsers className="me-3" />
            Users
          </Nav.Link>
          <Nav.Link href="#" className="py-2 ripple">
            <FaMoneyBill className="me-3" />
            Sales
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default AdminSidebar;
