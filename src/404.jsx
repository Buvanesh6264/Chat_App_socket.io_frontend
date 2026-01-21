import { Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaExclamationTriangle, FaHome } from 'react-icons/fa';
import './pages/AuthStyles.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card-wrapper">
        <Card className="auth-card animate__animated animate__fadeInUp">
          <Card.Body className="text-center p-5">
            <div className="mb-4">
              <div className="mb-4">
                <FaExclamationTriangle 
                  size={80} 
                  className="text-warning mb-3 animate__animated animate__pulse animate__infinite"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(255,193,7,0.5))' }}
                />
              </div>
              <h1 className="display-1 fw-bold text-light mb-3" 
                  style={{ textShadow: '0 0 20px rgba(0,212,255,0.3)' }}>
                404
              </h1>
              <h2 className="mb-4 fw-bold" style={{ 
                color: '#00d4ff',
                fontSize: '2rem',
                letterSpacing: '1px'
              }}>
                Page Not Found
              </h2>
              <p className="text-secondary mb-4 fs-5">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>

            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mt-5">
              <Button
                variant="outline-primary"
                onClick={() => navigate(-1)}
                className="d-flex align-items-center justify-content-center gap-2 px-4 py-3"
                style={{
                  borderColor: '#00d4ff',
                  color: '#00d4ff',
                  background: 'rgba(0, 212, 255, 0.1)',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(0, 212, 255, 0.2)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(0, 212, 255, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <FaArrowLeft />
                Go Back
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate('/')}
                className="d-flex align-items-center justify-content-center gap-2 px-4 py-3"
                style={{ 
                  backgroundColor: '#00d4ff', 
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#00a8cc';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 30px rgba(0, 212, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#00d4ff';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <FaHome />
                Go to Home
              </Button>
            </div>

            <div className="mt-5 pt-4 border-top border-secondary">
              <p className="text-muted small mb-0">
                If you believe this is an error, please contact support
              </p>
            </div>
          </Card.Body>
        </Card>

        <div className="floating-circle circle-1"></div>
        <div className="floating-circle circle-2"></div>
        <div className="floating-circle circle-3"></div>
      </div>
    </div>
  );
};

export default NotFound;