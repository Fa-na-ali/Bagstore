import React, { useEffect } from 'react';
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
import { 
  useGetReferralCodeMutation, 
  useGetReferralDetailsQuery,
 
} from '../../redux/api/usersApiSlice';

const Referrals = () => {
  const { data: referralData,isLoading, error, refetch } = useGetReferralDetailsQuery();
  const [generateCode, { isLoading: isGenerating }] =useGetReferralCodeMutation();
  console.log("ref",referralData)

  useEffect(() => {
  if(referralData)
    refetch()
  }, [refetch])
  
  
  const handleGetReferral = async () => {
    try {
      const { data } = await generateCode().unwrap();
      refetch(); // Refresh the referral data
      console.log("Generated code:", data);
    } catch (err) {
      console.error("Failed to generate code:", err);
    }
  };

  // Copy to clipboard function
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('Copied to clipboard!'))
      .catch(err => console.error('Copy failed:', err));
  };

  if (isLoading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">Error loading referrals</Alert>;

  return (
    <Container fluid className="mt-4 p-4 my-custom-min-height">
      <Row>
        <Col lg={8}>
          <h2>My Referral Details</h2>

          {!referralData?.referrals?.referralCode ? (
            <Button 
              onClick={handleGetReferral}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Get Referral Code'}
            </Button>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Referral Code</Form.Label>
                <InputGroup>
                  <Form.Control
                    value={referralData.referrals.referralCode || ''}
                    readOnly
                  />
                  <Button 
                    onClick={() => copyToClipboard(referralData.referrals.referralCode)}
                  >
                    Copy
                  </Button>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Amount Earned</Form.Label>
                <div>₹ {referralData.referrals.amountEarned || 0}</div>
              </Form.Group>

              {referralData.referrals.referredUsers?.length > 0 && (
                <div>
                  <h4>Users Referred</h4>
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