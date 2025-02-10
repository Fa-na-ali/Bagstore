import React, { useState, useRef, useEffect } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useVerifyOtpMutation, useResendOtpMutation } from "../../redux/api/usersApiSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../../redux/features/auth/authSlice";

const OTPVerify = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { search } = useLocation();
  const dispatch = useDispatch()
  const sp = new URLSearchParams(search);
  const email = sp.get("email") || "";

  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {

      if (userInfo.user.isAdmin) {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [navigate, userInfo]);

  // Handle OTP input change
  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Submit OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      toast.error("Please enter a 6-digit OTP.");
      return;
    }

    try {
      const res = await verifyOtp({ email, otp: otpCode }).unwrap();
      toast.success("OTP Verified Successfully!");
      dispatch(setCredentials({ ...res }));
      if (res.user.isAdmin) {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Verification Error:", err);
      toast.error(err?.data?.message || "Invalid OTP. Please try again.");
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    try {
      await resendOtp({ email }).unwrap();
      toast.success("A new OTP has been sent to your email.");
      setOtp(new Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err) {
      console.error("Resend OTP Error:", err);
      toast.error("Failed to resend OTP. Try again later.");
    }
  };

  return (
    <Container fluid className="vh-100 d-flex align-items-center justify-content-center background">
      <Row className="justify-content-center">
        <Col md={6}>
          <div className="text-center">
            <h3 className="mb-4 heading">Enter OTP</h3>
            <p>We have sent an OTP to your email: <strong>{email}</strong></p>

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

              <Button type="submit" variant="primary" className="w-100 button-custom" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify"}
              </Button>

              <Button
                variant="secondary"
                className="w-100 mt-2"
                onClick={handleResendOtp}
                disabled={isResending}
              >
                {isResending ? "Resending..." : "Resend OTP"}
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default OTPVerify;
