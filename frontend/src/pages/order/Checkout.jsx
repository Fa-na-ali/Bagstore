import { useEffect, useState } from "react";
import { lazy, Suspense } from 'react';
import { Container, Row, Col, Card, Button, Form, Image, Modal } from "react-bootstrap";
import { FaTrash, } from "react-icons/fa";
import { SiRazorpay } from "react-icons/si";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useApplyCouponMutation, useInitiatePaymentMutation, useProfileQuery, useRemoveCouponMutation } from "../../redux/api/usersApiSlice";
import { clearCartItems, removeFromCart, savePaymentMethod, saveShippingAddress } from "../../redux/features/cart/cartSlice";
import { BsWallet2 } from "react-icons/bs";
import { useCreateOrderMutation } from "../../redux/api/ordersApiSlice";
import { toast } from 'react-toastify'
import { useRef } from "react";
import { CART_MESSAGES, COUPON_MESSAGES, ORDER_MESSAGES, PAYMENT_MESSAGES } from "../../constants/messageConstants";

const CouponModal = lazy(() => import("./CouponModal"));

const Checkout = () => {

  const cart = useSelector((state) => state.cart);
  const { data: user, refetch } = useProfileQuery()
  const { cartItems } = cart;
  const address = user?.user?.address || [];
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const couponDiscountRef = useRef(0);
  const formattedItems = cart?.cartItems.map(item => ({
    product: item._id,
    qty: item.qty,
    discount: item.discount,
    discountedPrice: item.discountedPrice,
    name: item.name,
    price: item.price,
    category: item.category.name
  }));

  const [initiatePayment] = useInitiatePaymentMutation();
  const [createOrder] = useCreateOrderMutation();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponId, setCouponId] = useState("")
  const [cModal, setCModal] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(false);
  const [applyCoupon] = useApplyCouponMutation();
  const [removeCoupon] = useRemoveCouponMutation();

  useEffect(() => {
    refetch();
    if (user?.user?.address && user?.user.address.length > 0) {
      setSelectedAddress(user?.user.address[0]._id);
    }
  }, [user, refetch, couponDiscount]);

  //address selection
  const handleAddressChange = (id) => {
    setSelectedAddress(id);
    dispatch(saveShippingAddress(id));
  };

  //on submit
  const handleContinue = () => {
    if (selectedPayment === "Razorpay") {
      handlePayment();
    } else if (selectedPayment === "Cash On Delivery") {
      setShowModal(true);
    } else {
      handlePlaceOrder("", "", "", "Pending");
    }
  };

  //selecting payment method
  const handlePaymentMethod = (method) => {

    dispatch(savePaymentMethod(method));

  }

  //apply coupon
  const handleApplyCoupon = async () => {
    if (coupon.trim()) {
      setApplied(true);
      try {
        const res = await applyCoupon({ coupon_code: coupon, minAmount: total }).unwrap();
        if (res.status === "success") {
          toast.success(res.message);
          setCouponId(res?.coupon._id)
          let calculatedDiscount = res?.coupon?.discount / 100 * total;
          if (calculatedDiscount < res?.coupon?.maxAmount) {
            couponDiscountRef.current = calculatedDiscount;
            setCouponDiscount(calculatedDiscount)

          }
          else {
            couponDiscountRef.current = res?.coupon?.maxAmount
            setCouponDiscount(res?.coupon?.maxAmount)

          }

        } else {
          toast.error(res.message);
        }
      } catch (error) {
        toast.error(error?.data?.mesage || COUPON_MESSAGES.COUPON_APPLY_FAILURE);
      }
    }
  };

  //remove coupon
  const handleRemoveCoupon = async () => {
    try {
      const res = await removeCoupon({ coupon_code: coupon }).unwrap();
      if (res.success) {
        toast.success(res.message);
        setCoupon("");
        setCouponDiscount(0);
        couponDiscountRef.current = 0;
        setCouponId("")
        setApplied(false);
      } else {
        if (res.message === "Coupon not applied to user") {
          setCoupon("");
          setCouponDiscount(0);
          couponDiscountRef.current = 0;
          setCouponId("")
          setApplied(false);
        }
        else
          toast.error(res.message)
      }
    } catch (error) {
      toast.error(error?.data?.message || COUPON_MESSAGES.COUPON_REMOVE_FAILURE);
    }
  };

  //payment
  const handlePayment = async () => {
    try {
      const { data: orderData } = await initiatePayment(total);
      if (!orderData?.order) throw new Error('Invalid order response');

      const options = {
        key: orderData.order.key,
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'Bag Store',
        description: 'Payment for your order',
        order_id: orderData.order.id,
        method: {
          netbanking: true,
          debit: true,
          credit: true,
          upi: true,
          emi: true,
          wallet: true,
        },
        handler: async function (response) {
          await handlePlaceOrder(
            orderData.order.id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            "Success"
          );
        },
        theme: { color: '#3399cc' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      let paymentFailedHandled = false;
      rzp.on('payment.failed', async function () {
        if (paymentFailedHandled) return;
        paymentFailedHandled = true;
        await handlePlaceOrder(
          orderData.order.id,
          "",
          "",
          "Failed"
        );
      });

    } catch (error) {
      toast.error(error?.data?.message || PAYMENT_MESSAGES.PAYMENT_INITIALIZATION_FAILURE);
    }
  };

  //placing order
  const handlePlaceOrder = async (razorpay_order_id, razorpay_payment_id, razorpay_signature, status) => {

    setShowModal(false);
    if (!cartItems || cartItems.length === 0) {
      toast.error(CART_MESSAGES.CART_EMPTY_MSG);
      return;
    }
    if (selectedPayment === "Razorpay" && razorpay_order_id === "") {
      return handlePayment();
    }
    try {
      const res = await createOrder({
        userId: user?.user._id,
        items: formattedItems,
        shippingAddress: selectedAddress,
        paymentMethod: selectedPayment,
        shippingPrice: total >= 700 ? 0 : 50,
        couponId: couponId || null,
        razorpay_order_id,
        paymentStatus: status,
        couponDiscount: couponDiscountRef.current.toFixed(2),
        totalPrice: total.toFixed(2),
        tax: tax.toFixed(2),
        totalDiscount: totalDiscount.toFixed(2),
      }).unwrap();
      const id = res?.createdOrder?._id
      if (id) {
        dispatch(clearCartItems());
        toast.success(ORDER_MESSAGES.ORDER_SUCCESS);

        navigate(`/order-success?id=${id}`);
      }
      else {
        toast.error(res?.message);
      }
      // if (status === "Success" && cart?.paymentMethod === "Razorpay") {

      //   const verifyData = await verifyPayment({
      //     razorpay_order_id,
      //     razorpay_payment_id,
      //     razorpay_signature,
      //   }).unwrap();

      //   if (verifyData.status === "success") {

      //     toast.success("Order Placed successfully");
      //     navigate(`/order-success?id=${id}`);
      //   }

      // } else if (status === "Failed") {

      //   toast.success("Order Placed successfully");
      //   navigate(`/mine`);

      // } else {
      //   if (id) {
      //     toast.success("Order Placed successfully");
      //     navigate(`/order-success?id=${id}`);
      //   }

      // }
    } catch (error) {
      console.log(error)
      toast.error(error.data?.message || "Failed to place order");
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discount = cartItems.reduce((acc, item) => acc + item.discount * item.qty, 0);
  const totalDiscount = discount + couponDiscount
  const tax = subtotal * 0.05;
  const total = subtotal - (discount + couponDiscount) + tax;
  const id = selectedAddress

  return (
    <section className="my-custom-min-height" style={{ backgroundColor: "#eee" }}>
      <Container className="py-5">
        <Row className="d-flex justify-content-center align-items-center h-100">
          <Col>
            <Card>
              <Card.Body className="p-4">
                <Row>
                  {/* Shopping Cart Section */}
                  <Col lg={7}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <p className="mb-1">Shopping cart</p>
                        <p className="mb-0">You have {cartItems.length}  items in your cart</p>
                      </div>
                    </div>

                    {cartItems.length === 0 ? (
                      <h5 className="text-center text-muted">Your cart is empty</h5>
                    ) : (
                      cartItems.map((item) => (
                        <Card key={item._id} className="mb-3">
                          <Card.Body>
                            <div className="d-flex justify-content-between">
                              <div className="d-flex flex-row align-items-center">
                                <div>
                                  <Image
                                    src={`${item.pdImage[0]}`}
                                    className="img-fluid rounded-3"
                                    alt="Shopping item"
                                    style={{ width: "65px" }}
                                  />
                                </div>
                                <div className="ms-3">
                                  <h5>{item.name}</h5>
                                  <p className="small mb-0">{item.color}</p>
                                </div>
                              </div>
                              <div className="d-flex flex-row align-items-center">
                                <div style={{ width: "50px" }}>
                                  <h5 className="fw-normal mb-0">{item.qty}</h5>
                                </div>
                                <div style={{ width: "150px" }}>
                                  {item.originalPrice !== item.discountedPrice ? (
                                    <>
                                      <span className="text-decoration-line-through text-muted me-2">
                                        ₹{item.originalPrice}
                                      </span>
                                      <span className="text-success fw-bold">₹{item.discountedPrice.toFixed(2)}</span>
                                    </>
                                  ) : (
                                    <span>₹{item.price}</span>
                                  )}
                                </div>
                                <Button variant="link" className="text-danger p-5" onClick={() => dispatch(removeFromCart(item._id))}>
                                  <FaTrash size={18} />
                                </Button>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      ))
                    )}
                  </Col>
                  <Col lg={5}>

                    <div className="mt-5">
                      <Card className="shadow-0 border">
                        <Card.Body>
                          <div className="d-flex justify-content-between">
                            <p className="mb-2">Total price:</p>
                            <p className="mb-2">₹{subtotal.toFixed(2)}</p>
                          </div>
                          <div className="d-flex justify-content-between">
                            <p className="mb-2">Discount:</p>
                            <p className="mb-2 text-success">-₹{discount.toFixed(2)}</p>
                          </div>
                          <div className="d-flex justify-content-between">
                            <p className="mb-2">Coupon Discount:</p>
                            <p className="mb-2 text-success">-₹{couponDiscount.toFixed(2)}</p>
                          </div>
                          <div className="d-flex justify-content-between">
                            <p className="mb-2">TAX:</p>
                            <p className="mb-2">₹{tax.toFixed(2)}</p>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between">
                            <p className="mb-2">Total price:</p>
                            <p className="mb-2 fw-bold">₹{total.toFixed(2)}</p>
                          </div>
                          <div className="mt-3">
                            <Button className="w-100 shadow-0 mb-2 button-custom" onClick={handleContinue}>
                              CONTINUE
                            </Button>
                            <Button variant="light" className="w-100 border mt-2">
                              Back to shop
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  </Col>

                  {/* Shipping Info Section */}
                  <Row>
                    <Col lg={7}>
                      <Card className="shadow-0 border">
                        <Card.Body className="p-4">
                          <h5 className="card-title mb-3">Shipping info</h5>
                          <hr className="my-4" />

                          <Row className="mb-3">
                            {address && address.length > 0 ? (
                              address.map((address) => (
                                <Col lg={4} key={address._id} className="mb-3">
                                  <Form.Check
                                    type="radio"
                                    name="shippingOption"
                                    label={
                                      <>
                                        <strong>{address.houseName}</strong>
                                        <br />
                                        <small className="text-muted">
                                          {address.street}, {address.city}
                                        </small>
                                        <br />
                                        <small className="text-muted">{address.phone}</small>
                                      </>
                                    }
                                    checked={selectedAddress === address._id}
                                    onChange={() => handleAddressChange(address._id)}
                                    className="border rounded-3 p-3"
                                  />
                                </Col>
                              ))
                            ) : (
                              <p className="text-muted">No saved addresses found. Please add one.</p>
                            )}
                          </Row>

                          <div className="float-end">
                            <Button variant="" className="border me-2 button-custom" onClick={() => { navigate(`/account/edit-address/${id}`) }}>
                              Edit
                            </Button>
                            <Button variant="success" className="shadow-0 border button-custom" onClick={() => { navigate('/account/add-address') }}>
                              Add New
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                  <Row className="mt-5">
                    <Col md={6}>
                      <Form.Control
                        type="text"
                        placeholder="Enter Coupon Code"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        disabled={applied}
                      />
                    </Col>
                    <Col md={2}>
                      {applied ? (
                        <Button variant="danger" onClick={handleRemoveCoupon}>
                          Remove
                        </Button>
                      ) : (
                        <Button variant="success" onClick={handleApplyCoupon}>
                          Apply
                        </Button>
                      )}
                    </Col>
                  </Row>

                  <Row className="mt-2">
                    <Col>
                      <span>Get a coupon.</span>
                      <Button variant="link" onClick={() => setCModal(true)}>
                        Show Available Coupons
                      </Button>
                    </Col>
                  </Row>
                  <Suspense fallback={<div>Loading modal...</div>}>
                    <CouponModal show={cModal} handleClose={() => setCModal(false)} />
                  </Suspense>
                  <Row>
                    <Col lg={7}>

                      <Card className="shadow-sm mb-5 mt-5" style={{ borderRadius: "16px" }}>
                        <Card.Body className="p-4">
                          <h5 className="card-title mb-3">Payment Method</h5>
                          <hr className="my-4" />
                          <Form>
                            <Row className="g-3">

                              <Col md={4}>
                                <div
                                  className={`rounded border p-3 d-flex align-items-center justify-content-between ${selectedPayment === "Cash On Delivery" ? "border-primary" : ""}`}
                                  onClick={() => setSelectedPayment("Cash On Delivery")}
                                  style={{ cursor: "pointer" }}
                                >
                                  <Form.Check
                                    type="radio"
                                    name="paymentMethod"
                                    id="cashondelivery"
                                    checked={selectedPayment === "Cash On Delivery"}
                                    onChange={() => handlePaymentMethod("Cash On Delivery")}
                                  />

                                  <span>Cash On Delivery</span>
                                </div>
                              </Col>

                              {/* Debit Card */}
                              <Col md={4}>
                                <div
                                  className={`rounded border p-3 d-flex align-items-center justify-content-between ${selectedPayment === "Wallet" ? "border-primary" : ""}`}
                                  onClick={() => setSelectedPayment("Wallet")}
                                  style={{ cursor: "pointer" }}
                                >
                                  <Form.Check
                                    type="radio"
                                    name="paymentMethod"
                                    id="debitCard"
                                    checked={selectedPayment === "Wallet"}
                                    onChange={() => handlePaymentMethod("Wallet")}
                                  />
                                  <BsWallet2 size={32} className="text-body" />
                                  <span>Wallet</span>
                                </div>
                              </Col>

                              {/* PayPal */}
                              <Col md={4}>
                                <div
                                  className={`rounded border p-3 d-flex align-items-center justify-content-between ${selectedPayment === "Razorpay" ? "border-primary" : ""}`}
                                  onClick={() => setSelectedPayment("Razorpay")}
                                  style={{ cursor: "pointer" }}
                                >
                                  <Form.Check
                                    type="radio"
                                    name="paymentMethod"
                                    id="razorpay"
                                    checked={selectedPayment === "Razorpay"}
                                    onChange={() => handlePaymentMethod("Razorpay")}
                                  />
                                  <SiRazorpay size={32} className="text-body" />
                                  <span>Razorpay</span>
                                </div>
                              </Col>
                            </Row>
                          </Form>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Row>

              </Card.Body>
            </Card>
          </Col>

        </Row>
      </Container>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Your Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Your total order amount is <strong>₹{total.toFixed(2)}</strong></p>
          <p>Do you want to place the order?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={() => handlePlaceOrder(("", "", "", "Pending"))}>
            Place Order at ₹{total.toFixed(2)}
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
};

export default Checkout;
