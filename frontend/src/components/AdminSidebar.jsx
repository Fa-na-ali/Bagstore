
import { BiSolidOffer, BiSolidCategory } from "react-icons/bi";
import { MdOutlineLocalOffer } from "react-icons/md";
import { FaUserGroup } from "react-icons/fa6";
import { FiShoppingBag } from "react-icons/fi";
import { IoLogoDropbox } from "react-icons/io5";
import { RxDashboard } from "react-icons/rx";
import { BsWallet2 } from "react-icons/bs";
import { FaSignOutAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from "react";
import { Offcanvas, Button, Nav } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../redux/features/auth/authSlice";
import { useLogoutMutation } from "../redux/api/usersApiSlice";

const AdminSidebar = () => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      dispatch(logout());
      console.error(error);
    }
  };

  return (
    <>
      <Button
        onClick={handleShow}
        className="d-lg-none position-fixed button-custom top-0 start-0 m-2 z-3"
      >
        ☰
      </Button>

      <div className="d-none d-lg-block background-two text-white vh-100 p-3 sidebar-fixed">
        <Nav className="flex-column">
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
          <Nav.Link onClick={logoutHandler} className="py-2 ripple text-white">
            <FaSignOutAlt /> Logout
          </Nav.Link>
        </Nav>
      </div>

      {/* Offcanvas Sidebar for Mobile */}
      <Offcanvas show={show} onHide={handleClose} placement="start" className="background-two">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title></Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
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
            <Nav.Link onClick={logoutHandler} className="py-2 ripple text-white">
              <FaSignOutAlt /> Logout
            </Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default AdminSidebar;
