import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useRegisterMutation } from "../../redux/api/usersApiSlice";
import { GoogleWrapper } from "../../App";


//  Yup validation schema
const validationSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords do not match")
    .required("Confirm Password is required"),
  terms: yup.bool().oneOf([true], "You must accept the terms"),
});

const Register = () => {

  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const [registerUser, { isLoading }] = useRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {

    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  //Handle form submission
  const submitHandler = async (data) => {
    try {
      const res = await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        confirmPassword: data.confirmPassword,
        referCode: data.referCode
      }).unwrap();
      toast.success("User successfully registered");
      navigate(`/verify-otp?email=${data.email}`);
      toast.success("OTP has been sent to your email.");

    } catch (err) {
      toast.error(err.data?.message || "Registration failed");
    }
  };

  return (
    <section className="background p-3 p-md-4 p-xl-5">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={9} lg={7} xl={6} xxl={5}>
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-3 p-md-4 p-xl-5">
                <Row>
                  <Col xs={12}>
                    <div className="mb-5">
                      <h2 className="heading">Registration</h2>
                      <h3 className="fs-6 fw-normal m-0 caption">
                        Enter your details to register
                      </h3>
                    </div>
                  </Col>
                </Row>

                <Form onSubmit={handleSubmit(submitHandler)}>
                  <Row className="gy-3">
                    <Col xs={12}>
                      <Form.Group controlId="name">
                        <Form.Control type="text" placeholder="Name" {...register("name")} />
                        {errors.name && <p className="text-danger">{errors.name.message}</p>}
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group controlId="email">
                        <Form.Control type="text" placeholder="Email" {...register("email")} />
                        {errors.email && <p className="text-danger">{errors.email.message}</p>}
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group controlId="phone">
                        <Form.Control type="text" placeholder="Phone Number" {...register("phone")} />
                        {errors.phone && <p className="text-danger">{errors.phone.message}</p>}
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group controlId="password">
                        <Form.Control type="password" placeholder="Password" {...register("password")} />
                        {errors.password && <p className="text-danger">{errors.password.message}</p>}
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group controlId="confirmPassword">
                        <Form.Control type="password" placeholder="Confirm Password" {...register("confirmPassword")} />
                        {errors.confirmPassword && <p className="text-danger">{errors.confirmPassword.message}</p>}
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group controlId="referralCode">
                        <Form.Control type="text" placeholder="Enter Referral Code" {...register("referCode")} />
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Check
                        type="checkbox"
                        label={
                          <>
                            I agree to the{" "}
                            <a href="#!" className="link-primary text-decoration-none">
                              terms and conditions
                            </a>
                          </>
                        }
                        {...register("terms")}
                      />
                      {errors.terms && <p className="text-danger">{errors.terms.message}</p>}
                    </Col>

                    <Col xs={12}>
                      <Button size="lg" type="submit" className="w-100 button-custom" disabled={isLoading}>
                        {isLoading ? "Registering..." : "Sign Up"}
                      </Button>
                    </Col>
                  </Row>
                </Form>

                <Row className="mt-4">
                  <Col xs={12}>
                    <hr className="border-secondary-subtle" />
                    <p className="text-secondary text-center">
                      Already have an account?{" "}
                      <Link to="/login" className="text-decoration-none">
                        Sign in
                      </Link>
                    </p>
                  </Col>
                </Row>

                <Row className="mt-4">
                  <Col xs={12}>
                    <p className="text-secondary text-center">Or continue with</p>
                    <GoogleWrapper />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Register;
