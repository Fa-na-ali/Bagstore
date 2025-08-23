import { useRetryPaymentMutation, useVerifyRetryPaymentMutation } from '../redux/api/usersApiSlice';
import { Button, } from "react-bootstrap";
import Swal from 'sweetalert2';
import { useNavigate } from "react-router";
import PropTypes from 'prop-types';

const RetryButton = ({ orderId }) => {

    const [retryPayment] = useRetryPaymentMutation();
    const [verifyRetryPayment] = useVerifyRetryPaymentMutation();
    const navigate = useNavigate()

    //retry payment
    const handleRetryPayment = async (orderId) => {
        try {
            const { data } = await retryPayment(orderId);
            if (data.status === "success") {
                initiateRazorpay(data, orderId);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Payment Error",
                    text: "Failed to create retry payment order.",
                });
            }
        } catch {
            Swal.fire({
                icon: "error",
                title: "Payment Error",
                text: "An error occurred while retrying payment.",
            });
        }
    };

    //initiating payment
    const initiateRazorpay = (order, orderId) => {
        const options = {
            key: order.order.key,
            amount: order.order.amount,
            currency: "INR",
            order_id: order.order.id,
            handler: async function (response) {
                try {
                    const verifyData = {
                        razorpay_order_id: order.order.id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        orderId
                    };

                    const result = await verifyRetryPayment(verifyData);
                    if (result.data.status === "success") {
                        Swal.fire({
                            icon: "success",
                            title: "Payment Successful",
                            text: "Retry payment completed!",
                        })
                        navigate(`/order-success?id=${orderId}`)
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Payment Failed",
                            text: "Verification failed.",
                        });
                    }
                } catch {
                    Swal.fire({
                        icon: "error",
                        title: "Payment Error",
                        text: "An error occurred while verifying payment.",
                    });
                }
            },
            theme: { color: "#3399cc" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };


    return (
        <>

            <Button variant="success" className="shadow-0 border button-custom" onClick={() => { handleRetryPayment(orderId) }}>
                Retry Payment
            </Button>

        </>
    )
}

RetryButton.propTypes = {
    orderId:PropTypes.string.isRequired,
}

export default RetryButton