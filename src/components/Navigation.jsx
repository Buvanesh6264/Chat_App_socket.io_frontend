import { Navbar, Nav, Container, Button, Dropdown, Badge } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redex/saga/store';
import { FaUser, FaSignOutAlt, FaComments, FaBell } from 'react-icons/fa';
import { useEffect, useState } from 'react';

const Navigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  useEffect(() => {
    const hideOnPages = ['/login', '/register'];
    setIsHidden(hideOnPages.includes(location.pathname));
    
    if (hideOnPages.includes(location.pathname)) {
      document.body.style.paddingTop = '0';
    } else {
      document.body.style.paddingTop = scrolled ? '60px' : '72px';
    }
  }, [location.pathname, scrolled]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (isHidden) {
    return null;
  }

  return (
    <Navbar 
      bg="dark" 
      variant="dark" 
      expand="lg" 
      fixed="top"
      className={`border-bottom border-secondary transition-all ${scrolled ? 'navbar-scrolled' : ''}`}
      style={{ 
        backgroundColor: scrolled ? 'rgba(10, 10, 10, 0.95)' : '#0a0a0a',
        padding: scrolled ? '0.3rem 0' : '0.5rem 0',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.5)' : 'none',
        zIndex: 1030
      }}
    >
      <Container fluid className="px-3 px-lg-4 mx-auto" style={{ maxWidth: '1400px' }}>
        <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center">
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle me-2"
               style={{ 
                 width: '36px', 
                 height: '36px', 
                 background: 'linear-gradient(135deg, #00d4ff 0%, #0095ff 100%)',
                 color: '#0a0a0a',
                 fontSize: '18px',
                 fontWeight: 'bold'
               }}>
            C
          </div>
          <div className="d-flex flex-column">
            <span style={{ color: '#00d4ff', fontSize: '1.5rem', lineHeight: '1.2' }}>Chat</span>
            <span style={{ color: '#fff', fontSize: '1.5rem', lineHeight: '1.2' }}>App</span>
          </div>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" 
                      className="border-0"
                      style={{ color: '#00d4ff' }}>
          <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
        </Navbar.Toggle>
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center gap-3">
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/" className="d-flex align-items-center gap-2 text-light fw-medium">
                  <FaComments className="text-primary" />
                  <span>Chat</span>
                </Nav.Link>
                
                <Nav.Link className="position-relative d-flex align-items-center gap-2 text-light">
                  <FaBell className="text-warning" />
                  <span>Notifications</span>
                  <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle" 
                         style={{ fontSize: '0.6rem', padding: '2px 5px' }}>
                    3
                  </Badge>
                </Nav.Link>
                
                <Dropdown align="end">
                  <Dropdown.Toggle 
                    variant="dark" 
                    id="dropdown-basic"
                    className="d-flex align-items-center gap-2 border-0 bg-transparent"
                    style={{ color: '#fff' }}
                  >
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle"
                         style={{ 
                           width: '32px', 
                           height: '32px', 
                           background: 'linear-gradient(135deg, #00d4ff 0%, #0095ff 100%)',
                           color: '#0a0a0a',
                           fontSize: '14px',
                           fontWeight: 'bold'
                         }}>
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="d-flex flex-column align-items-start">
                      <span className="small text-light fw-medium">{user?.name || 'User'}</span>
                      <span className="x-small text-secondary" style={{ fontSize: '0.7rem' }}>
                        {user?.email || ''}
                      </span>
                    </div>
                  </Dropdown.Toggle>
                  
                  <Dropdown.Menu className="bg-dark border-secondary mt-2" 
                                style={{ minWidth: '200px' }}>
                    <Dropdown.Header className="text-light small">
                      Signed in as<br/>
                      <strong>{user?.name || 'user'}</strong>
                    </Dropdown.Header>
                    <Dropdown.Divider className="border-secondary" />
                    <Dropdown.Item 
                      as={Link}
                      to="/profile"
                      className="text-light d-flex align-items-center gap-2 py-2"
                    >
                      <FaUser className="text-primary" />
                      Profile
                    </Dropdown.Item>
                    <Dropdown.Divider className="border-secondary" />
                    <Dropdown.Item 
                      className="text-danger d-flex align-items-center gap-2 py-2"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt />
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Button 
                  as={Link} 
                  to="/login" 
                  variant="outline-primary"
                  className="px-4 py-2"
                  style={{
                    borderColor: '#00d4ff',
                    color: '#00d4ff',
                    background: 'transparent',
                    borderRadius: '10px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(0, 212, 255, 0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Login
                </Button>
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="primary"
                  className="px-4 py-2"
                  style={{ 
                    background: 'linear-gradient(135deg, #00d4ff 0%, #0095ff 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 10px 25px rgba(0, 212, 255, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Register
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;