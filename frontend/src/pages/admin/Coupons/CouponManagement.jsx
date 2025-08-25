import { useEffect, useState } from 'react';
import Ttable from '../../../components/Ttable'
import AdminSidebar from '../../../components/AdminSidebar';
import { Row, Col, Button, FormControl, InputGroup, Form, Container } from 'react-bootstrap'
import { Link } from 'react-router';
import { MdOutlineAdd } from "react-icons/md";
import { toast } from 'react-toastify';
import { useDeleteCouponMutation, useGetAllCouponsQuery } from '../../../redux/api/usersApiSlice';
import debounce from 'lodash.debounce';
import { COUPON_MESSAGES } from '../../../constants/messageConstants';

const CouponManagement = () => {

  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  let { data, refetch: load, error, isLoading } = useGetAllCouponsQuery({ keyword: searchTerm, page: currentPage });
  const coupons = data?.coupons || [];
  const [deleteCoupon] = useDeleteCouponMutation();

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
    if (window.confirm("Do you want to delete")) {
      try {
        await deleteCoupon(id);
        toast.success(COUPON_MESSAGES.COUPON_DLT_SUCCESS)
        load();

      } catch (err) {
        toast.error(err?.data?.message || `${COUPON_MESSAGES.COUPON_DLT_FAILURE}`);
      }
    }
  };


  return (
    <>
      <Container fluid>
        <Row className="g-0">
          <Col lg={2} className="d-none d-lg-block">
            <AdminSidebar />
          </Col>

          <Col lg={9} className="p-4 background-one vw-75">
            <h2 className='text-center my-5 heading'>COUPONS</h2>
            <div className="table-title my-5">
              <Row className="align-items-center">
                <Col lg={6}>
                  <Link to="/admin/coupons/add">
                    <Button className="me-2 button-custom">
                      <MdOutlineAdd /> <span>Add New</span>
                    </Button>
                  </Link>
                </Col>
                <Col lg={3}></Col>
                <Col lg={3} className="d-flex justify-content-end gap-3">
                  <InputGroup className="mb-3">
                    <Form className="d-flex">
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
                data={coupons}
                columns={columns}
                onDelete={handleDelete}
                onPage={handlePageChange}
                pageData={data}
                currentPage={currentPage}


              />
            ) : (
              <p>No coupons found</p>
            )}

          </Col>
          <Col lg={1} className=" background-one"></Col>
        </Row>
      </Container>
    </>
  );
};

export default CouponManagement;
