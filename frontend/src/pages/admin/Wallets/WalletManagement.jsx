import React, { useEffect, useState } from 'react';
import Ttable from '../../../components/Ttable'
import AdminSidebar from '../../../components/AdminSidebar';
import { Row, Col, Button, FormControl, InputGroup, Form, Container } from 'react-bootstrap'
import { Link } from 'react-router';
import { MdOutlineAdd } from "react-icons/md";
import { toast } from 'react-toastify';
import {useGetAllWalletsQuery} from '../../../redux/api/walletApiSlice'


const WalletManagement = () => {

  const [currentPage, setCurrentPage] = useState(1);
  let { data, refetch: load, error, isLoading } = useGetAllWalletsQuery({ page: currentPage });
  const wallets = data?.transactionData || [];
  console.log(wallets)
  
  const columns = [
    { key: "transactionId", label: "TransctionID" },
    { key: "transactionDate", label: "Transaction Date" }, 
    { key: "email", label: "Email" },
    { key: "type", label: "Transaction Type" },
    { key: "amount", label: "Amount" },
    
    
  ];

  useEffect(() => {
    if (wallets)
      load()

  }, [load]);

  const searchHandler = (e) => {
    e.preventDefault();
    refetch();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
   const handleDelete = () => {
     
    };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;


  return (
    <>
      <Container fluid>
        <Row className="g-0">
          <Col lg={2} className="d-none d-lg-block">
            <AdminSidebar />
          </Col>

          <Col lg={9} className="p-4 background-one vw-75">
            <h2 className='text-center my-5 heading'>WALLETS</h2>
            <div className="table-title my-5">
              <Row className="align-items-center">
                <Col lg={6}>
            
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
                      />
                      <Button type='submit' variant="outline-primary" id="search-addon">
                        Search
                      </Button>
                    </Form>
                  </InputGroup>
                </Col>
              </Row>
            </div>
            {(wallets) && (wallets.length > 0 ) ? (
              <Ttable
              naming="wallet"
              data={wallets}
              columns={columns}
              onDelete={handleDelete}
              onPage={handlePageChange}
              pageData={data}
              currentPage={currentPage}


              />
            ) : (
              <p>No wallets found</p>
            )}

          </Col>
          <Col lg={1} className=" background-one"></Col>
        </Row>
      </Container>
    </>
  );
};

export default WalletManagement;
