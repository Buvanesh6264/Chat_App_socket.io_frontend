import { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../redex/saga/store';
import '../AuthStyles.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const from = location.state?.from || "/";

  useEffect(() => {
    dispatch(clearError());
    
    if (isAuthenticated) {
      navigate(from);
    }
  }, [dispatch, isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  return (
    <div className="auth-container">
      <div className="auth-card-wrapper">
        <Card className="auth-card animate__animated animate__fadeInUp">
          <Card.Body>
            <div className="text-center mb-4">
              <h2 className="fw-bold" style={{ color: '#fff' }}>
                Welcome <span style={{ color: '#00d4ff' }}>Back</span>
              </h2>
              <p className="text-secondary">Sign in to your account</p>
            </div>

            {error && (
              <Alert 
                variant="danger" 
                dismissible 
                onClose={() => dispatch(clearError())}
                className="animate__animated animate__shakeX"
              >
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
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

              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
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
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="text-center mt-4">
                <p className="text-secondary mb-2">
                  Don't have an account?
                </p>
                <Link 
                  to="/register" 
                  className="text-decoration-none fw-bold"
                  style={{ color: '#00d4ff' }}
                >
                  Create Account
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

export default Login;