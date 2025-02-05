import React, { useState, useRef } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";

const OTPVerify = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);

  // Handle input change
  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if available
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Submit OTP
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Entered OTP: ${otp.join("")}`);
  };

  return (
    <Container fluid className="vh-100 d-flex align-items-center justify-content-center background">
      <Row className="justify-content-center">
        <Col md={6} >
          <div className=" text-center">
            <h3 className="mb-4 heading">Enter OTP</h3>
            <Form onSubmit={handleSubmit}>
              <div className="d-flex justify-content-center gap-2 mb-3">
                {otp.map((digit, index) => (
                  <Form.Control
                    key={index}
                    type="text"
                    className="text-center"
                    style={{
                      width: "50px",
                      height: "50px",
                      fontSize: "24px",
                      fontWeight: "bold",
                    }}
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    ref={(el) => (inputRefs.current[index] = el)}
                    required
                  />
                ))}
              </div>
              <Button type="submit" variant="primary" className="w-100 button-custom">
                Verify
              </Button>
              <Button
                variant=""
                className="w-100 mt-2 "
                onClick={() => setOtp(new Array(6).fill(""))}
              >
                Resend OTP
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default OTPVerify;
