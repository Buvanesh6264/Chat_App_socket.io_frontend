import { useState, useEffect } from "react";
import {
  Form,
  Button,
  Card,
  Container,
  Row,
  Col,
  Alert,
} from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearError } from "../../redex/saga/store";
import "../AuthStyles.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [validationError, setValidationError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth,
  );

  const from = location.state?.from || "/";

  useEffect(() => {
    dispatch(clearError());
    setValidationError("");

    if (isAuthenticated) {
      navigate(from);
    }
  }, [dispatch, isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Clear errors when user starts typing
    if (error) {
      dispatch(clearError());
    }
    if (validationError) {
      setValidationError("");
    }
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match");
      return false;
    }

    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(formData.password)) {
      setValidationError(
        "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character",
      );
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const { confirmPassword, ...userData } = formData;
    dispatch(registerUser(userData));
  };

  return (
    <div className="auth-container">
      <div className="auth-card-wrapper">
        <Card className="auth-card animate__animated animate__fadeInUp">
          <Card.Body>
            <div className="text-center mb-4">
              <h2 className="fw-bold" style={{ color: "#fff" }}>
                Create <span style={{ color: "#00d4ff" }}>Account</span>
              </h2>
              <p className="text-secondary">Join our community today</p>
            </div>

            {(error || validationError) && (
              <Alert
                variant="danger"
                dismissible
                onClose={() => {
                  dispatch(clearError());
                  setValidationError("");
                }}
                className="animate__animated animate__shakeX"
              >
                {error || validationError}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Create a strong password"
                  disabled={loading}
                />
                <Form.Text>
                  Must contain uppercase, lowercase, number, and special
                  character
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your password"
                  disabled={loading}
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100 mb-3 auth-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="text-center mt-4">
                <p className="text-secondary mb-2">Already have an account?</p>
                <Link
                  to="/login"
                  className="text-decoration-none fw-bold"
                  style={{ color: "#00d4ff" }}
                >
                  Sign In
                </Link>
              </div>
            </Form>
          </Card.Body>
        </Card>

        <div className="floating-circle circle-1"></div>
        <div className="floating-circle circle-2"></div>
        <div className="floating-circle circle-3"></div>
      </div>
    </div>
  );
};

export default Register;
