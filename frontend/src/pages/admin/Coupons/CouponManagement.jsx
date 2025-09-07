import { useEffect, useState } from 'react';
import Ttable from '../../../components/Ttable'
import AdminSidebar from '../../../components/AdminSidebar';
import { Row, Col, Button, FormControl, InputGroup, Form, Container } from 'react-bootstrap'
import { Link } from 'react-router';
import { MdOutlineAdd } from "react-icons/md";
import { toast } from 'react-toastify';
import { useDeleteCouponMutation, useGetAllCouponsQuery, useUnblockCouponMutation } from '../../../redux/api/usersApiSlice';
import debounce from 'lodash.debounce';
import { COUPON_MESSAGES } from '../../../constants/messageConstants';
import Swal from "sweetalert2";
import Footer from '../../../components/Footer';

const CouponManagement = () => {

  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  let { data, refetch: load, error, isLoading } = useGetAllCouponsQuery({ keyword: searchTerm, page: currentPage });
  const coupons = data?.coupons || [];
  const [deleteCoupon] = useDeleteCouponMutation();
  const [unblockCoupon] = useUnblockCouponMutation();
  const [coupon, setCoupon] = useState([])

  //columns for table
  const columns = [
    { key: "coupon_code", label: "Coupon Code" },
    { key: "name", label: "Coupon Name" },
    { key: "discount", label: "Discount" },
    { key: "minAmount", label: "Min" },
    { key: "maxAmount", label: "Max" },
    { key: "expiry", label: "Expiry" },
    { key: "createdAt", label: "created At" },
    { key: "status", label: "Status" }
  ];

  useEffect(() => {
    if (coupons) {
      setCoupon(coupons);
    }
  }, [coupons]);

  useEffect(() => {
    const debouncedResults = debounce(() => {
      setSearchTerm(inputValue);
    }, 500);

    debouncedResults()

    return () => {
      debouncedResults.cancel();
    };

  }, [inputValue]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // on delete
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Do you want to delete?",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteCoupon(id);
          setCoupon((prev) =>
            prev.map((c) =>
              c._id === id ? { ...c, status: false, isExist: false } : c
            )
          );
          toast.success(COUPON_MESSAGES.COUPON_DLT_SUCCESS)
        } catch (err) {
          toast.error(err?.data?.message || `${COUPON_MESSAGES.COUPON_DLT_FAILURE}`);
        }
      }
    })
  };

  // on unblock
  const handleUnblock = async (id) => {
    Swal.fire({
      title: "Do you want to unblock?",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await unblockCoupon(id);
          setCoupon((prev) =>
            prev.map((c) =>
              c._id === id ? { ...c, status: true, isExist: true } : c
            )
          );
          toast.success(COUPON_MESSAGES.COUPON_UNBLOCK_SUCCESS)
        } catch (err) {
          toast.error(err?.data?.message || `${COUPON_MESSAGES.COUPON_UNBLOCK_FAILURE}`);
        }
      }
    })
  };

  return (
    <>
      <div className="d-flex">
        <AdminSidebar />
        <div className="main-content-wrapper background-one flex-grow-1">
          <Container fluid>
            <Row className="g-0">
              <Col xs={12} lg={12} >
                <h2 className='text-center my-5 heading'>COUPONS</h2>
                <div className="table-title mb-4">
                  <Row className="align-items-center">
                    <Col
                      xs={12}
                      md={12}
                      className="d-flex flex-column flex-md-row justify-content-between gap-2"
                    >
                      <Link to="/admin/coupons/add">
                        <Button className="me-2 button-custom">
                          <MdOutlineAdd /> <span>Add New</span>
                        </Button>
                      </Link>
                      <InputGroup className="w-25 w-md-25">
                        <Form className="d-flex  w-100">
                          <FormControl
                            type="search"
                            placeholder="Search"
                            aria-label="Search"
                            aria-describedby="search-addon"
                            value={inputValue}
                            onChange={handleChange}
                          />
                        </Form>
                      </InputGroup>
                    </Col>
                  </Row>
                </div>
                {(coupons) && (coupons.length > 0) ? (
                  <Ttable
                    naming="coupons"
                    data={coupon}
                    columns={columns}
                    onDelete={handleDelete}
                    onUnblock={handleUnblock}
                    onPage={handlePageChange}
                    pageData={data}
                    currentPage={currentPage}
                  />
                ) : (
                  <p>No coupons found</p>
                )}

              </Col>
            </Row>
          </Container>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default CouponManagement;
