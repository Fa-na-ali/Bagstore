import React, { useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useGetAllCouponsQuery, useGetAllCouponsUserQuery } from "../../redux/api/usersApiSlice";


const CouponModal = ({ show, handleClose }) => {
  const { data, error, isLoading } = useGetAllCouponsUserQuery();
  console.log("couponssssssssss", data)
  const [copySuccess, setCopySuccess] = useState("");

  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopySuccess("Coupon copied to clipboard!");
      setTimeout(() => setCopySuccess(""), 2000);
    }).catch(() => alert("Failed to copy coupon code."));
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Available Coupons</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? (
          <Spinner animation="border" />
        ) : error ? (
          <Alert variant="danger">Failed to load coupons.</Alert>
        ) : data?.coupons?.length === 0 ? (
          <p>No coupons available.</p>
        ) : (
          data?.coupons?.map((coupon) => (
            <div key={coupon._id} className="p-3 border rounded mb-2 d-flex justify-content-between align-items-center">
              <div>
                <strong>{coupon.name}</strong> - {coupon.discount}% off
                <p className="text-muted">{coupon.description}</p>
              </div>
              <Button variant="primary" size="sm" onClick={() => copyCoupon(coupon.coupon_code)}>
                Copy
              </Button>
            </div>
          ))
        )}
        {copySuccess && <Alert variant="success">{copySuccess}</Alert>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CouponModal;
