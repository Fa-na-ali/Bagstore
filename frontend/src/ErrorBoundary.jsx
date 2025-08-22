import React from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ERROR_MESSAGE } from "./constants/messageConstants";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        toast.error(ERROR_MESSAGE);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="d-flex align-items-center justify-content-center vh-100">
                    <div className="text-center">
                        <h1 className="display-1 fw-bold">404</h1>
                        <p className="fs-3">
                            <span className="text-danger">Oops!</span> Page not found.
                        </p>
                        <p className="lead">
                            The page you’re looking for doesn’t exist.
                        </p>
                        <Link to="/" className="btn btn-primary">
                            Go Home
                        </Link>

                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
