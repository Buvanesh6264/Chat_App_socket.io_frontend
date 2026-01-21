import { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Button, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaPaperPlane } from 'react-icons/fa';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const navigate = useNavigate();
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const newMsg = {
        id: Date.now(),
        text: newMessage,
        sender: user?.name || 'You',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCurrentUser: true
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
      
      setTimeout(() => {
        const reply = {
          id: Date.now() + 1,
          text: `Thanks for your message: "${newMessage}"`,
          sender: 'Bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isCurrentUser: false
        };
        setMessages(prev => [...prev, reply]);
      }, 1000);
    }
  };

  return (
    <div className="chat-container" style={{ width: '100%', padding: '20px' }}>
      <Row className="justify-content-center">
        <Col xs={12} lg={10} xl={8}>
          <Card className="bg-dark text-light border-secondary chat-card">
            <Card.Header className="d-flex justify-content-between align-items-center py-3">
              <div className="d-flex align-items-center">
                <div 
                  className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3"
                  style={{ width: '40px', height: '40px', backgroundColor: '#00d4ff' }}
                >
                  <span className="fw-bold">C</span>
                </div>
                <div>
                  <h5 className="mb-0">
                    <span style={{ color: '#00d4ff' }}>Welcome</span>, {user?.name}
                  </h5>
                  <small className="text-success">● Online</small>
                </div>
              </div>
              <div className="text-secondary">
                <small>{new Date().toLocaleDateString()}</small>
              </div>
            </Card.Header>
            
            <Card.Body 
              className="chat-messages-container"
              style={{ 
                height: '60vh', 
                overflowY: 'auto',
                background: 'linear-gradient(180deg, rgba(15,15,15,1) 0%, rgba(26,26,26,1) 100%)'
              }}
            >
              <div className="chat-messages p-3">
                {messages.length === 0 ? (
                  <div className="text-center text-secondary mt-5">
                    <div className="mb-3">
                      <div className="rounded-circle bg-dark d-inline-flex align-items-center justify-content-center p-4 border border-secondary">
                        <FaPaperPlane size={32} />
                      </div>
                    </div>
                    <h4>Start a conversation!</h4>
                    <p className="mb-0">Send a message to begin chatting</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`message-wrapper mb-3 ${msg.isCurrentUser ? 'text-end' : ''}`}
                    >
                      <div 
                        className={`message-bubble d-inline-block p-3 rounded-3 ${
                          msg.isCurrentUser 
                            ? 'bg-primary text-white' 
                            : 'bg-secondary bg-opacity-25'
                        }`}
                        style={{
                          maxWidth: '70%',
                          borderTopLeftRadius: msg.isCurrentUser ? '20px' : '5px',
                          borderTopRightRadius: msg.isCurrentUser ? '5px' : '20px',
                          borderBottomLeftRadius: '20px',
                          borderBottomRightRadius: '20px',
                          backgroundColor: msg.isCurrentUser ? '#00d4ff' : 'rgba(50, 50, 50, 0.5)'
                        }}
                      >
                        <div className="fw-bold small">{msg.sender}</div>
                        <div className="my-1">{msg.text}</div>
                        <div className="small opacity-75">{msg.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card.Body>
            
            <Card.Footer className="bg-dark border-secondary">
              <Form onSubmit={handleSendMessage}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Type your message here..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="bg-dark text-light border-secondary py-3"
                    style={{ borderRight: 'none' }}
                  />
                  <Button 
                    variant="primary" 
                    type="submit"
                    style={{ 
                      backgroundColor: '#00d4ff', 
                      border: 'none',
                      padding: '0 1.5rem'
                    }}
                  >
                    <FaPaperPlane />
                  </Button>
                </InputGroup>
              </Form>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ChatPage;