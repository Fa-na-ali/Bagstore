import { useState, useEffect } from 'react'
import AdminSidebar from '../../../components/AdminSidebar';
import { useGetAllOrdersQuery } from '../../../redux/api/ordersApiSlice';
import { Row, Col, FormControl, InputGroup, Form, Container } from 'react-bootstrap'
import Ttable from '../../../components/Ttable';
import debounce from 'lodash.debounce';
import Footer from '../../../components/Footer';

const OrderManagement = () => {

  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSort, setSelectedSort] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data } = useGetAllOrdersQuery({
    searchTerm: searchTerm || "",
    status: selectedSort || "",
    page: currentPage,
  });

  const orders = data?.orders || [];

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

  const columns = [
    { key: "orderId", label: "OrderID" },

    {
      key: "userId",
      label: "User",

    },
    { key: "totalPrice", label: "Total" },
    { key: "createdAt", label: "Date" },

  ];

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = () => {

  }
  const handleUnblock = () => {

  }

  return (
    <>
      <div className="d-flex">
        <AdminSidebar />
        <div className="main-content-wrapper background-one flex-grow-1">
          <Container fluid>
            <Row className="g-0">
              <Col xs={12} lg={12}>
                <h2 className='text-center my-5 heading'>ORDERS</h2>
                <div className="table-title mb-4">
                  <Row className="align-items-center">
                    <Col
                      xs={12}
                      md={12}
                      className="d-flex flex-column flex-md-row justify-content-between gap-2"
                    >
                      <Form.Group>
                        <Form.Select
                          className='w-100'
                          value={selectedSort}
                          onChange={(e) => {
                            setSelectedSort(e.target.value);
                            setCurrentPage(1);
                          }}
                        >
                          <option value="">Sort by</option>
                          <option value="Completed">Completed</option>
                          <option value="Not completed">Not completed</option>
                        </Form.Select>
                      </Form.Group>
                      <InputGroup className="mb-3">
                        <Form className=" w-25">
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
                {(orders) && (orders.length > 0) ? (
                  <Ttable
                    naming="orders"
                    data={orders}
                    columns={columns}
                    onDelete={handleDelete}
                    onUnblock={handleUnblock}
                    onPage={handlePageChange}
                    pageData={data}
                    currentPage={currentPage}
                  />
                ) : (
                  <p>No Orders found</p>
                )}

              </Col>
            </Row>
          </Container>
          <Footer />
        </div>
      </div>
    </>
  )
}

export default OrderManagement