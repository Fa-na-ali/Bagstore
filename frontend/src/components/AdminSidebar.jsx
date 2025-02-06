import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { FaTachometerAlt, FaChartArea, FaLock, FaChartLine, FaChartPie, FaChartBar, FaGlobe, FaBuilding, FaCalendar, FaUsers, FaMoneyBill } from "react-icons/fa";

const AdminSidebar=()=>{
  return (
    <Navbar expand="lg" className="d-lg-block sidebar collapse vh-100 background-two ">
      <Container fluid className="position-sticky">
        <Nav className="flex-column  mt-4 ">
          <Nav.Link href="#" className="py-2 ripple text-white">
            <FaTachometerAlt className="me-3" />
            Main Dashboard
          </Nav.Link>
          <Nav.Link href="#" className="py-2 ripple active text-white">
            <FaChartArea className="me-3" />
            Website Traffic
          </Nav.Link>
          <Nav.Link href="#" className="py-2 ripple text-white">
            <FaLock className="me-3" />
            Password
          </Nav.Link>
          <Nav.Link href="#" className="py-2 ripple text-white">
            <FaChartLine className="me-3" />
            Analytics
          </Nav.Link>
          <Nav.Link href="#" className="py-2 ripple text-white">
            <FaChartPie className="me-3" />
            SEO
          </Nav.Link>
          <Nav.Link href="#" className="py-2 ripple text-white">
            <FaChartBar className="me-3" />
            Orders
          </Nav.Link>
          <Nav.Link href="#" className="py-2 ripple text-white">
            <FaGlobe className="me-3" />
            International
          </Nav.Link>
          <Nav.Link href="#" className="py-2 ripple text-white">
            <FaBuilding className="me-3" />
            Partners
          </Nav.Link>
          <Nav.Link href="#" className="py-2 ripple">
            <FaCalendar className="me-3" />
            Calendar
          </Nav.Link>
          <Nav.Link href="#" className="py-2 ripple text-white">
            <FaUsers className="me-3" />
            Users
          </Nav.Link>
          <Nav.Link href="#" className="py-2 ripple text-white">
            <FaMoneyBill className="me-3" />
            Sales
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default AdminSidebar;
