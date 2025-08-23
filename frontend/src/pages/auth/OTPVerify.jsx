import { useState, useRef, useEffect } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useVerifyOtpMutation, useResendOtpMutation } from "../../redux/api/usersApiSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { USER_MESSAGES } from "../../constants/messageConstants";

const OTPVerify = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(90);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { search } = useLocation();
  const dispatch = useDispatch()
  const sp = new URLSearchParams(search);
  const email = sp.get("email") || "";

  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

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
      toast.error(USER_MESSAGES.USER_OTP_VALIDATION);
      return;
    }

    try {
      const res = await verifyOtp({ email, otp: otpCode }).unwrap();
      toast.success(USER_MESSAGES.USER_OTP_SUCCESS);

      dispatch(setCredentials({ ...res }));
      if (res.user.isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }

    } catch (err) {
      toast.error(err?.data?.message || `${USER_MESSAGES.USER_OTP_FAILURE}`);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    try {
      await resendOtp({ email }).unwrap();
      toast.success(USER_MESSAGES.USER_OTP_SENT);
      setOtp(new Array(6).fill(""));
      inputRefs.current[0]?.focus();
      setTimer(90);
    } catch (err) {
      toast.error(err?.data?.message || USER_MESSAGES.USER_OTP_RESEND_FAIL);
    }
  };

  return (
    <Container fluid className="vh-100 d-flex align-items-center justify-content-center background">
      <Row className="justify-content-center">
        <Col md={6}>
          <div className="text-center">
            <h3 className="mb-4 heading">Enter OTP</h3>
            <p>We have sent an OTP to your email</p>

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
              <div className="mt-3">
                {timer > 0 ? (
                  <p className="text-muted">Resend OTP in <strong>{formatTime(timer)}</strong></p>
                ) : (

                  <Button
                    variant="secondary"
                    className="w-100 mt-2"
                    onClick={handleResendOtp}
                    disabled={isResending}
                  >
                    {isResending ? "Resending..." : "Resend OTP"}
                  </Button>
                )}
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default OTPVerify;
