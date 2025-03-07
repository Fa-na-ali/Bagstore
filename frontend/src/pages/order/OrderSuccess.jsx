import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form, Image,Modal } from "react-bootstrap";
import { FaTrash, FaCcMastercard, FaCcVisa, FaCcPaypal } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useProfileQuery } from "../../redux/api/usersApiSlice";
import { saveShippingAddress } from "../../redux/features/cart/cartSlice";
import { GiReceiveMoney } from "react-icons/gi";
import { BsWallet2 } from "react-icons/bs";


const OrderSuccess = () => {
    const cart = useSelector((state) => state.cart);
    const { cartItems } = cart;
    const {shippingAddress} = cart
    const imageBaseUrl = "http://localhost:5004/uploads/";
    return (

        <>
            <section className="h-100 h-custom" style={{ backgroundColor: "#eee" }}>
                <Container className="py-5 h-100">
                    <Row className="d-flex justify-content-center align-items-center h-100">
                        <Col>
                            <Card>
                                <Card.Body className="p-4">
                                    <Row>
                                        <h2 className="">Thank You for your Order</h2>
                                        <h3>Your Order has been placed successfully</h3>
                                        <p>We will notify you when your items have been shipped</p>
                                        <hr />
                                        <h2>Order Summary</h2>

                                        
                                    </Row>

                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

        </>
    )
}

export default OrderSuccess