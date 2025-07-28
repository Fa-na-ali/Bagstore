import { useLocation, Navigate, Outlet } from "react-router-dom"
import { useSelector } from "react-redux"

const RequireAuth = () => {
    const { userInfo } = useSelector((state) => state.auth)
    const location = useLocation();

    return (
        userInfo
            ? <Outlet />
            : <Navigate to="/login" state={{ from: location }} replace />
    )
}
export default RequireAuth