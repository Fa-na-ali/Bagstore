import { useEffect, useState } from 'react';
import Ttable from '../../../components/Ttable'
import AdminSidebar from '../../../components/AdminSidebar';
import { Row, Col, Container } from 'react-bootstrap'
import { useGetAllWalletsQuery } from '../../../redux/api/walletApiSlice'
import Footer from '../../../components/Footer';

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
  }, [load, wallets]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = () => {

  };

  const handleUnblock = () => {

  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;


  return (
    <>
      <div className="d-flex">
        <AdminSidebar />
        <div className="main-content-wrapper background-one flex-grow-1">
          <Container>
            <Row className="g-0">
              <Col xs={12} lg={9} >
                <h2 className='text-center my-5 heading'>WALLETS</h2>
                {(wallets) && (wallets.length > 0) ? (
                  <Ttable
                    naming="wallets"
                    data={wallets}
                    columns={columns}
                    onDelete={handleDelete}
                    onUnblock={handleUnblock}
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
          <Footer />
        </div>
      </div>
    </>
  );
};

export default WalletManagement;
