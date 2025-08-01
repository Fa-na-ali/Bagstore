import { Navbar, Nav, Container } from "react-bootstrap";
import { BiSolidOffer, BiSolidCategory } from "react-icons/bi";
import { MdOutlineLocalOffer } from "react-icons/md";
import { FaUserGroup } from "react-icons/fa6";
import { FiShoppingBag } from "react-icons/fi";
import { IoLogoDropbox } from "react-icons/io5";
import { RxDashboard } from "react-icons/rx";
import { BsWallet2 } from "react-icons/bs";
import { Link } from "react-router";

const AdminSidebar = () => {
  return (
    <Navbar expand="lg" className="d-lg-block sidebar collapse vh-100 background-two postion-fixed">
      <Container fluid className="position-sticky">
        <Nav className="flex-column  mt-5 ">
          <Nav.Link as={Link} to='/admin/dashboard' className="py-2 ripple text-white">
            <RxDashboard className="me-3" />
            Main Dashboard
          </Nav.Link>
          <Nav.Link as={Link} to='/admin/products' className="py-2 ripple active text-white">
            <IoLogoDropbox className="me-3" />
            Products
          </Nav.Link>
          <Nav.Link as={Link} to='/admin/category' className="py-2 ripple text-white">
            <BiSolidCategory className="me-3" />
            Category
          </Nav.Link>
          <Nav.Link as={Link} to='/admin/orders' className="py-2 ripple text-white">
            <FiShoppingBag className="me-3" />
            Orders
          </Nav.Link>
          <Nav.Link as={Link} to='/admin/coupons' className="py-2 ripple text-white">
            <MdOutlineLocalOffer className="me-3" />
            Coupons
          </Nav.Link>
          <Nav.Link as={Link} to='/admin/offers' className="py-2 ripple text-white">
            <BiSolidOffer className="me-3" />
            Offer
          </Nav.Link>
          <Nav.Link as={Link} to='/admin/wallets' className="py-2 ripple text-white">
            <BsWallet2 className="me-3" />
            Wallets
          </Nav.Link>
          <Nav.Link as={Link} to='/admin/user' className="py-2 ripple text-white">
            <FaUserGroup className="me-3" />
            Users
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default AdminSidebar;
