import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import loginImage from "../../assets/images/b1.webp";
import logo from "../../assets/images/2.png";
import "../auth/register.css";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import { GoogleWrapper } from "../../App";

//Validation schema
const validationSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(validationSchema) });

  //  Submit handler
  const onSubmit = async (data) => {
    try {
      const res = await login({ email: data.email, password: data.password }).unwrap();

      if (res) {
        dispatch(setCredentials({ ...res }));
        if (res.user.isAdmin && res.user.isExist) {
          navigate("/admin/dashboard");
        } else if (!res.user.isAdmin && res.user.isExist) {
          navigate("/");
        }
        else
          toast.error("You are blocked");

      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (err) {
      toast.error(err.data?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <section className="vh-100" style={{ backgroundColor: "#EDE6DF" }}>
      <Container className="py-5 h-100">
        <Row className="d-flex justify-content-center align-items-center h-100">
          <Col xl={10}>
            <Card style={{ borderRadius: "1rem" }}>
              <Row className="g-0">
                <Col md={6} lg={5} className="d-none d-md-block">
                  <img
                    src={loginImage}
                    alt="login form"
                    className="img-fluid w-100 h-100"
                    style={{ borderRadius: "1rem 0 0 1rem", objectFit: "cover" }}
                  />
                </Col>
                <Col md={6} lg={7} className="d-flex align-items-center">
                  <Card.Body className="p-4 p-lg-5 text-black">
                    <Form onSubmit={handleSubmit(onSubmit)}>
                      <div className="d-flex align-items-center mb-3 pb-1">
                        <img src={logo} alt="login form" className="w-25 h-25" />
                      </div>
                      <h5 className="fw-normal mb-3 pb-3 heading" style={{ letterSpacing: "1px" }}>
                        Sign into your account
                      </h5>


                      <Form.Group className="mb-4">
                        <Form.Control type="email" placeholder="Enter email" {...register("email")} />
                        {errors.email && <p className="text-danger">{errors.email.message}</p>}
                      </Form.Group>


                      <Form.Group className="mb-4">
                        <Form.Control type="password" placeholder="Enter password" {...register("password")} />
                        {errors.password && <p className="text-danger">{errors.password.message}</p>}
                      </Form.Group>


                      <div className="pt-1 mb-4">
                        <Button className="button-custom w-100" size="lg" type="submit" disabled={isLoading}>
                          {isLoading ? "Loading..." : "Login"}
                        </Button>
                      </div>

                      <Link to="/forgot-password" className="text-decoration-none">Forgot Password?</Link>
                      <p className="mb-5 pb-lg-2" style={{ color: "#393f81" }}>
                        Don't have an account?{" "}
                        <Link to="/register" className="text-decoration-none">Register here</Link>
                      </p>
                      <p className="text-center" style={{ color: "#393f81" }}>or</p>

                      <GoogleWrapper />

                      <Link to="/" className="small text-muted text-decoration-none">Terms of use.</Link>
                      <Link to="/" className="small text-muted ms-2 text-decoration-none">Privacy policy</Link>
                    </Form>
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Login;
