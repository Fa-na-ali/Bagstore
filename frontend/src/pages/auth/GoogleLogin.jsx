import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "./googleApi";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { Button } from "react-bootstrap";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";

const GoolgeLogin = (props) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const responseGoogle = async (authResult) => {
        try {
            if (authResult["code"]) {
                console.log("auth", authResult)
                const result = await googleAuth(authResult.code);
                console.log("result from back", result)
                const { _id, email, name, isAdmin, isExist, address,refreshToken } = result?.data?.user;
                const token = result.data?.token;
                
                const obj = { _id, email, name, isAdmin, isExist, address, token ,refreshToken};
                console.log("Dispatching credentials:", obj);

                dispatch(setCredentials(obj));

                if (isAdmin && isExist) {
                    navigate("/admin/dashboard");
                } else if (isExist) {
                    navigate("/");
                }
                else
                    toast.error("You are blocked")
            } else {
                console.log(authResult);
                toast.error("Login Error")
            }
        } catch (e) {
            console.log('Error while Google Login...', e);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: responseGoogle,
        onError: responseGoogle,
        flow: "auth-code",
    });

    return (
        <>

            <div className="pt-1 mb-4">
                <Button variant="danger" className="w-100" size="lg" onClick={googleLogin}>
                    Sign in with Google
                </Button>
            </div>


        </>
    );
};

export default GoolgeLogin;