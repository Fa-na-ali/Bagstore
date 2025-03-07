import React, { useState } from 'react'
import { Card, Form, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useForgotPasswordMutation } from '../../redux/api/usersApiSlice';
import { toast } from 'react-toastify';
const ForgotPass = () => {

  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleClick = async () => {

    if (!email) {
      toast.error("Please enter your email.");
      return;
    }
    try {
      const { data } = await forgotPassword({ email }).unwrap();
      console.log(data)
      toast.success(data?.message || "OTP sent to your email!");
      navigate(`/verify-otp-password?email=${email}`);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to send OTP.");
    }
  }


  return (


    <>
      <section className="d-flex vh-100 justify-content-center align-items-center background">
        <Card className="text-center shadow-lg mb-5" style={{ width: "400px" }}>
          <Card.Header className="h5 text-white background-two">Password Reset</Card.Header>
          <Card.Body className="px-4">
            <Card.Text className="py-2">
              Enter your email address and we'll send you an email with an OTP to reset your password.
            </Card.Text>
            <Form>
              <Form.Group controlId="typeEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control type="email" placeholder="Enter email" className="my-3" value={email}
                  onChange={(e) => setEmail(e.target.value)} />
              </Form.Group>
              <Button className="w-100 button-custom" onClick={handleClick}>Reset Password</Button>
            </Form>
            <div className="d-flex justify-content-between mt-4">
              <Link to="/login" className="text-decoration-none">Login</Link>
              <Link to="/register" className="text-decoration-none">Register</Link>
            </div>
          </Card.Body>
        </Card>
      </section>
    </>
  )
}

export default ForgotPass