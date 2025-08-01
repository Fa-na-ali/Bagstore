import { useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  InputGroup,
  ListGroup,
  Spinner,
  Alert
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
  useGetReferralCodeMutation,
  useGetReferralDetailsQuery,

} from '../../redux/api/usersApiSlice';

const Referrals = () => {
  const { data: referralData, isLoading, error, refetch } = useGetReferralDetailsQuery();
  const [generateCode, { isLoading: isGenerating }] = useGetReferralCodeMutation();

  useEffect(() => {
    if (referralData)
      refetch()
  }, [refetch])


  const handleGetReferral = async () => {
    try {
      const { data } = await generateCode().unwrap();
      refetch(); // Refresh the referral data

    } catch (err) {
      toast.error("Failed to generate code");
    }
  };

  // Copy to clipboard function
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('Copied to clipboard!'))
      .catch(err => toast.error('Copy failed'));
  };

  if (isLoading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">Error loading referrals</Alert>;

  return (

    <Container fluid className="pt-4 my-custom-min-height background-one">
      <Row>
        <Col lg={8}>
          <h2 className='heading'>My Referral Details</h2>

          {!referralData?.referrals?.referralCode ? (
            <Button
              onClick={handleGetReferral}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Get Referral Code'}
            </Button>
          ) : (
            <>
              <Form.Group className="mt-3 mb-3">
                <Form.Label className='caption'>Referral Code</Form.Label>
                <InputGroup>
                  <Form.Control
                    value={referralData.referrals.referralCode || ''}
                    readOnly
                  />
                  <Button className='button-custom'
                    onClick={() => copyToClipboard(referralData.referrals.referralCode)}
                  >
                    Copy
                  </Button>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className='caption'>Amount Earned</Form.Label>
                <div className='text-success'>₹ {referralData.referrals.amountEarned || 0}</div>
              </Form.Group>

              {referralData.referrals.referredUsers?.length > 0 && (
                <div>
                  <h4 className='caption'>Users Referred</h4>
                  <ListGroup>
                    {referralData.referrals.referredUsers.map((user, idx) => (
                      <ListGroup.Item key={idx}>
                        {user.name} ({user.email})
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Referrals;