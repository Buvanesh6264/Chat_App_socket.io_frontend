import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redex/saga/store';
import { FaUser, FaSignOutAlt, FaComments, FaBell, FaHome } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import './Navigation.css';

const Navigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const hideOnPages = ['/login', '/register'];
    setIsHidden(hideOnPages.includes(location.pathname));
    
    if (!hideOnPages.includes(location.pathname)) {
      document.body.style.paddingTop = scrolled ? '50px' : '60px';
    } else {
      document.body.style.paddingTop = '0';
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
      className={`mini-navbar ${scrolled ? 'navbar-scrolled' : ''}`}
    >
      <Container fluid className="px-3 px-lg-4" style={{ maxWidth: '1400px' }}>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <div className="nav-logo me-2">
            <span className="logo-text">C</span>
          </div>
          <span className="brand-text">ChatApp</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center gap-2">
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/" className="nav-icon-link" title="Home">
                  <FaHome className="nav-icon" />
                </Nav.Link>
                
                <Nav.Link as={Link} to="/chat" className="nav-icon-link" title="Chat">
                  <FaComments className="nav-icon" />
                </Nav.Link>
                
                <Nav.Link className="nav-icon-link position-relative" title="Notifications">
                  <FaBell className="nav-icon" />
                  <span className="notification-badge">3</span>
                </Nav.Link>
                
                <Dropdown align="end">
                  <Dropdown.Toggle 
                    variant="dark" 
                    id="dropdown-basic"
                    className="user-dropdown"
                  >
                    <div className="user-avatar-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </Dropdown.Toggle>
                  
                  <Dropdown.Menu className="bg-dark border-secondary mt-2">
                    <div className="dropdown-user-info p-3">
                      <div className="user-avatar-md mb-2">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="text-center">
                        <div className="fw-bold text-light">{user?.name}</div>
                        <small className="text-secondary">{user?.email}</small>
                      </div>
                    </div>
                    <Dropdown.Divider className="border-secondary" />
                    <Dropdown.Item 
                      as={Link}
                      to="/profile"
                      className="dropdown-item-custom"
                    >
                      <FaUser className="me-2" />
                      Profile
                    </Dropdown.Item>
                    <Dropdown.Item 
                      className="dropdown-item-custom text-danger"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt className="me-2" />
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
                  className="nav-btn"
                >
                  Login
                </Button>
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="primary"
                  className="nav-btn register-btn"
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