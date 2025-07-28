
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { useCreateOrderWalletMutation, useGetMyWalletQuery, useGetRazorpayKeyQuery, useUpdateWalletMutation } from '../../redux/api/walletApiSlice';
import { LOGO_URL, WALLET_IMG_URL } from '../../redux/constants';

const Wallet = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: keyData } = useGetRazorpayKeyQuery();
  const { data: myWallet, refetch } = useGetMyWalletQuery()
  const wallet = myWallet?.wallet
  const [createOrderWallet] = useCreateOrderWalletMutation();
  const [updateWallet] = useUpdateWalletMutation();
  const [amount, setAmount] = useState('');
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleAddMoney = async () => {
    if (!amount || amount <= 0) {
      Swal.fire('Invalid Amount', 'Please enter a valid amount.', 'warning');
      return;
    }

    try {
      const orderRes = await createOrderWallet(amount).unwrap();
      const key = keyData.key;
      const options = {
        key,
        amount: amount * 100,
        currency: 'INR',
        order_id: orderRes.id,
        name: 'Add Money to Wallet',
        description: 'Transaction for wallet',
        image: `${LOGO_URL}`,
        handler: async () => {
          const res = await updateWallet(amount).unwrap();
          if (res.success) {
            Swal.fire('Payment Successful!', 'Your payment has been processed successfully.', 'success');
            setAmount('');
            setShowInput(false);
          } else {
            Swal.fire('Error', 'Failed to update wallet balance.', 'error');
          }
        },
        prefill: {
          name: userInfo?.name,
          email: userInfo?.email,
          contact: '9876543210'
        },
        theme: { color: '#F37254' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      Swal.fire('Error', 'Something went wrong during payment.', 'error');
    }
  };

  return (
    <Container className="my-5 my-custom-min-height">
      <h1 className="text-center mb-4 heading">MY WALLET</h1>
      <Row className="mb-4">
        <Col md={4}>
          <Card bg="warning" text="dark" className="p-4">
            <Card.Body>
              <Card.Title className="d-flex justify-content-between align-items-center">
                Gold Card <i className="fab fa-cc-mastercard fa-2x"></i>
              </Card.Title>
              <Card.Text className="wallet-balance fs-4">Rs.{(wallet?.balance ?? 0).toFixed(2)}</Card.Text>
              <div className="d-flex justify-content-between">
                <div>
                  <div className="fw-bold">{userInfo?.name}</div>
                </div>
                <img src={`${WALLET_IMG_URL}`} alt="Chip" width="40" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}></Col>
        <Col md={2} className="d-flex flex-column justify-content-center">
          <Button className='button-custom' onClick={() => setShowInput(true)}>Add Money</Button>
          {showInput && (
            <div className="mt-2">
              <Form.Control
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
              />
              <Button className="mt-2" onClick={handleAddMoney}>Submit</Button>
            </div>
          )}
        </Col>
      </Row>

      <div>
        <h5 className='caption mt-5'>Recent Transactions</h5>
        <hr />
        {wallet?.transactions?.map((txn, idx) => (
          <div key={idx} className="transaction-item d-flex justify-content-between align-items-center mb-2">
            <div className="d-flex">
              <div className="me-3">
                <span className={txn.type === 'Credit' ? 'text-success' : 'text-danger'}>
                  {txn.type === 'Credit' ? 'Credited' : 'Debited'}
                </span>
              </div>
              <div className="me-3">
                <h6>Rs. {txn.amount.toFixed(2)}</h6>
              </div>
              <p className="small">{txn.description}</p>
            </div>
            <div>{format(new Date(txn.createdAt), 'EEE, MMM dd, yyyy')}</div>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default Wallet;
