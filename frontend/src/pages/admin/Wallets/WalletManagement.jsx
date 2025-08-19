import { useEffect, useState } from 'react';
import Ttable from '../../../components/Ttable'
import AdminSidebar from '../../../components/AdminSidebar';
import { Row, Col, Button, FormControl, InputGroup, Form, Container } from 'react-bootstrap'
import { useGetAllWalletsQuery } from '../../../redux/api/walletApiSlice'

const WalletManagement = () => {

  const [currentPage, setCurrentPage] = useState(1);
  let { data, refetch: load, error, isLoading } = useGetAllWalletsQuery({ page: currentPage });
  const wallets = data?.transactionData || [];
  console.log(data)
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
            {(wallets) && (wallets.length > 0) ? (
              <Ttable
                naming="wallets"
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
