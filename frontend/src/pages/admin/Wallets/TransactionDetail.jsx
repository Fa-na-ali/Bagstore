import React from 'react';
import { useGetTransactionQuery } from '@/features/transactions/transactionApiSlice';
import { Card, Badge, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';

const TransactionDetail = () => {
  const { transactionId } = useParams();
  const { data: transaction, isLoading } = useGetTransactionQuery(transactionId);

  if (isLoading) return <p>Loading...</p>;

  const { transaction: trx, transactionType, orderButton } = transaction;
  const { user } = transaction;

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Order Returned':
        return <div className="alert alert-warning"><i className="bi bi-arrow-return-left me-2"></i>Order Return Refund</div>;
      case 'Order Cancelled':
        return <div className="alert alert-danger"><i className="bi bi-x-circle me-2"></i>Order Cancellation Refund</div>;
      case 'Debited':
        return <div className="alert alert-info"><i className="bi bi-bag-check me-2"></i>Order Payment</div>;
      case 'Referral Bonus':
        return <div className="alert alert-success"><i className="bi bi-people me-2"></i>Referral Bonus</div>;
      case 'Credit':
        return <div className="alert alert-success"><i className="bi bi-plus-circle me-2"></i>Wallet Credit</div>;
      case 'Wallet Recharge':
        return <div className="alert alert-primary"><i className="bi bi-wallet2 me-2"></i>Wallet Recharge</div>;
      default:
        return <div className="alert alert-secondary"><i className="bi bi-arrow-left-right me-2"></i>Regular Transaction</div>;
    }
  };

  return (
    <section className="container mt-4">
      <h3 className="fw-bold text-primary border-bottom pb-2">Transaction Detail</h3>
      <Badge bg="secondary" className="text-white fs-6 mt-2">
        <i className="bi bi-hash"></i> Transaction ID: {trx.transactionId}
      </Badge>

      <div className="row mt-4">
        <div className="col-md-6 mb-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <i className="bi bi-person-circle me-2"></i>User Information
            </Card.Header>
            <Card.Body>
              <div className="row">
                <div className="col-5 fw-bold text-secondary">
                  <p>User:</p>
                  <p>Email:</p>
                  <p>Transaction Date:</p>
                  <p>Transaction Type:</p>
                  <p>Amount:</p>
                  <p>Description:</p>
                </div>
                <div className="col-7">
                  <p>{user.firstName} {user.lastName}</p>
                  <p>{user.email}</p>
                  <p><i className="bi bi-calendar me-1"></i>{format(new Date(trx.createdAt), 'dd MMM yyyy')}</p>
                  <p><Badge bg="info" text="dark">{transactionType}</Badge></p>
                  <p className={`${trx.amount > 0 ? 'text-success' : 'text-danger'} fw-bold`}>
                    <i className={`bi ${trx.amount > 0 ? 'bi-arrow-up-circle' : 'bi-arrow-down-circle'} me-1`}></i>
                    Rs. {trx.amount}
                  </p>
                  <p className="text-muted small">{trx.description}</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-6 mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-primary text-white">
              <i className="bi bi-info-circle me-2"></i>Transaction Source
            </Card.Header>
            <Card.Body className="d-flex flex-column">
              <div className="row mb-auto">
                <div className="col-5 fw-bold text-secondary">
                  <p>Source:</p>
                </div>
                <div className="col-7">
                  {getTypeBadge(transactionType)}
                </div>
              </div>
              {orderButton && (
                <div className="text-center mt-3">
                  <a href={orderButton} className="btn btn-outline-primary btn-sm w-100">
                    <i className="bi bi-eye me-2"></i>View Order
                  </a>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {orderButton && (
        <div className="row mb-4">
          <div className="col-12">
            <Card className="shadow-sm bg-light">
              <Card.Header className="bg-dark text-white">
                <i className="bi bi-box me-2"></i>Order Details
              </Card.Header>
              <Card.Body className="text-center p-4">
                <div className="mb-4">
                  <span className="fw-bold text-dark d-block mb-2">Transaction Related To:</span>
                  <span className={`badge rounded-pill p-2 ${
                    transactionType === 'Order Returned' ? 'bg-warning text-dark' :
                    transactionType === 'Order Cancelled' ? 'bg-danger' :
                    transactionType === 'Debited' ? 'bg-info text-dark' : 'bg-secondary'
                  }`}>
                    {transactionType}
                  </span>
                </div>
                <a href={orderButton} className="btn btn-primary btn-lg">
                  <i className="bi bi-box-arrow-up-right me-2"></i>Click Here to View Order
                </a>
              </Card.Body>
            </Card>
          </div>
        </div>
      )}
    </section>
  );
};

export default TransactionDetail;
