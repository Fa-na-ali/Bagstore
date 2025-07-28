import { useEffect, useState } from 'react';
import Ttable from '../../../components/Ttable'
import AdminSidebar from '../../../components/AdminSidebar';
import { Row, Col, Button, FormControl, InputGroup, Form, Container } from 'react-bootstrap'
import { Link } from 'react-router';
import { MdOutlineAdd } from "react-icons/md";
import { toast } from 'react-toastify';
import { useDeleteOfferMutation, useGetAllOffersQuery } from '../../../redux/api/usersApiSlice';

const OfferManagement = () => {

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  let { data, refetch: load, error, isLoading } = useGetAllOffersQuery({ keyword: searchTerm, page: currentPage });
  const offers = data?.offers || [];
  const [deleteOffer] = useDeleteOfferMutation();

  const columns = [
    { key: "name", label: "Offer Name" },
    { key: "discount", label: "Discount" },
    { key: "minAmount", label: "Min" },
    { key: "type", label: "Type" },
    { key: "expiry", label: "Expiry" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "created At" },

  ];

  useEffect(() => {
    if (offers)
      load()

  }, [load]);

  //searching
  const searchHandler = (e) => {
    e.preventDefault();
    refetch();
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
        await deleteOffer(id);
        toast.success(" Deleted Successfully")
        load();

      } catch (err) {
        toast.error(err?.data?.message || err.error);
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
            <h2 className='text-center my-5 heading'>OFFERS</h2>
            <div className="table-title my-5">
              <Row className="align-items-center">
                <Col lg={6}>
                  <Link to="/admin/offers/add">
                    <Button className="me-2 button-custom">
                      <MdOutlineAdd /> <span>Add New</span>
                    </Button>
                  </Link>
                </Col>
                <Col lg={3}></Col>
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
            {(offers) && (offers.length > 0) ? (
              <Ttable
                naming="offers"
                data={offers}
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

export default OfferManagement;
