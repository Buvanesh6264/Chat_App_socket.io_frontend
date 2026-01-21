import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRoute = ({ children, restricted = false }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isAuthenticated && restricted) {
    const from = location.state?.from || "/";
    return <Navigate to={from} replace />;
  }

  return children;
};

export default PublicRoute;