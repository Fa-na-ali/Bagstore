import React, { useState, useEffect } from 'react'
import AdminSidebar from '../../../components/AdminSidebar';
import { useGetAllOrdersQuery } from '../../../redux/api/ordersApiSlice';
import { Row, Col, Button, FormControl, InputGroup, Form, Container } from 'react-bootstrap'
import { Link } from 'react-router';
import { MdOutlineAdd } from "react-icons/md";
import { toast } from 'react-toastify';
import Ttable from '../../../components/Ttable';

const OrderManagement = () => {


  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSort, setSelectedSort] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error, refetch } = useGetAllOrdersQuery({
    searchTerm: searchTerm || "",
    status: selectedSort || "",
    page: currentPage,
  });

  const orders = data?.orders || [];
  console.log("orders", orders)



  useEffect(() => {
    if (data)
      refetch()

  }, [refetch]);

  const columns = [
    { key: "orderId", label: "OrderID" },

    {
      key: "userId",
      label: "User",

    },
    { key: "createdAt", label: "Date" },

  ];



  const searchHandler = (e) => {
    e.preventDefault();
    refetch();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handleDelete = () => {

  }

  return (
    <>
      <Container fluid>
        <Row className="g-0">
          <Col lg={2} className="d-none d-lg-block">
            <AdminSidebar />
          </Col>

          <Col lg={9} className="p-4 background-one vw-75">
            <h2 className='text-center my-5 heading'>ORDERS</h2>
            <div className="table-title my-5">
              <Row className="align-items-center">
                <Col lg={6}>

                </Col>
                <Col lg={3} className='mb-3'>
                  <Form.Group>

                    <Form.Select
                      value={selectedSort}
                      onChange={(e) => {
                        setSelectedSort(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">Sort by</option>
                      <option value="Completed">Completed</option>
                      <option value="Not completed">Not completed</option>
                      {/* <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="returned">Returned</option> */}
                    </Form.Select>
                  </Form.Group>
                </Col>


                <Col lg={3} className="d-flex justify-content-end gap-3">
                  <InputGroup className="mb-3">
                    <Form onSubmit={searchHandler} method="GET" className="d-flex">
                      <FormControl
                        type="search"
                        placeholder="Search"
                        aria-label="Search"
                        aria-describedby="search-addon"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value) }}
                      />
                      <Button type='submit' variant="outline-primary" id="search-addon">
                        Search
                      </Button>
                    </Form>
                  </InputGroup>
                </Col>
              </Row>
            </div>
            {(orders) && (orders.length > 0) ? (
              <Ttable
                naming="orders"
                data={orders}
                columns={columns}
                onDelete={handleDelete}
                onPage={handlePageChange}
                pageData={data}
                currentPage={currentPage}


              />
            ) : (
              <p>No Orders found</p>
            )}

          </Col>
          <Col lg={1} className=" background-one"></Col>
        </Row>
      </Container>

    </>
  )
}

export default OrderManagement