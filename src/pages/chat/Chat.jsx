import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Button, Form, InputGroup, 
  Spinner, Modal, Badge
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FaPaperPlane, FaSearch, FaPlus, FaEllipsisV, FaTimes,
  FaSmile, FaCheck, FaCheckDouble, FaArrowLeft,
  FaUserFriends, FaComment, FaCircle
} from 'react-icons/fa';
import { IoIosSend } from 'react-icons/io';
import { BsThreeDotsVertical } from 'react-icons/bs';
import EmojiPicker from 'emoji-picker-react';
import socketService from '../../utils/socketService';
import './ChatPage.css';
import {
  fetchUsers,
  searchUsers,
  createChat,
  fetchMessages,
  sendMessage,
  setSelectedUser,
  setSearchTerm,
  addMessage,
  setOnlineUsers,
  setTyping,
  clearChat
} from '../../redex/saga/chatSlice';

const ChatPage = () => {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [chatUsers, setChatUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const messageInputRef = useRef(null);
  const searchInputRef = useRef(null);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Selectors
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);
  const { 
    users, 
    filteredUsers, 
    messages, 
    selectedUser, 
    currentChat, 
    searchTerm,
    loading, 
    error,
    onlineUsers,
    isTyping,
    typingUser
  } = useSelector((state) => state.chat);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize socket and fetch users
  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }

    // Initialize socket
    const socket = socketService.initialize(token);
    
    // Socket event handlers
    const handleNewMessage = (message) => {
      console.log('New message received:', message);
      if (message.chatId === currentChat?._id) {
        dispatch(addMessage(message));
      }
    };

    const handleTypingIndicator = (data) => {
      console.log('Typing indicator:', data);
      if (data.chatId === currentChat?._id && data.userId !== user?.id) {
        dispatch(setTyping({ isTyping: data.isTyping, userId: data.userId }));
        
        if (data.isTyping) {
          setTimeout(() => {
            dispatch(setTyping({ isTyping: false, userId: null }));
          }, 3000);
        }
      }
    };

    const handleUserStatusChange = (data) => {
      console.log('User status change:', data);
      if (data.status === 'online') {
        dispatch(setOnlineUsers([...onlineUsers, data.userId]));
      } else {
        dispatch(setOnlineUsers(onlineUsers.filter(id => id !== data.userId)));
      }
    };

    // Attach event listeners
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      // Authenticate socket with user ID
      if (user?.id) {
        socket.emit('authenticate', user.id);
      }
    });

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleTypingIndicator);
    socket.on('user_online', (data) => {
      dispatch(setOnlineUsers([...onlineUsers, data.userId]));
    });
    socket.on('user_offline', (data) => {
      dispatch(setOnlineUsers(onlineUsers.filter(id => id !== data.userId)));
    });

    // Fetch chat users (only users we have chats with)
    const fetchChatUsers = async () => {
      try {
        // In a real app, you would fetch user's chats first
        // For now, we'll fetch all users and filter later
        await dispatch(fetchUsers()).unwrap();
        
        // Filter out current user
        const filtered = users.filter(u => u._id !== user?.id);
        setChatUsers(filtered);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchChatUsers();

    // Click outside to close emoji picker
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleTypingIndicator);
      socket.off('user_online');
      socket.off('user_offline');
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAuthenticated, token, navigate, dispatch, user?.id, currentChat?._id]);

  // Focus search input when search is opened
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [showSearch]);

  // Filter out current user from users list
  useEffect(() => {
    if (users.length > 0 && user?.id) {
      const filtered = users.filter(u => u._id !== user.id);
      setChatUsers(filtered);
    }
  }, [users, user?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Create chat when user is selected
  const handleCreateChat = async (user) => {
    try {
      console.log('Creating chat with user:', user._id);
      const result = await dispatch(createChat(user._id)).unwrap();
      console.log('Chat created:', result);
      
      // Join chat room via socket
      const socket = socketService.getSocket();
      if (socket) {
        socket.emit('join_chat', result._id);
        console.log('Joined chat room:', result._id);
      }
      
      // Fetch messages for this chat
      await dispatch(fetchMessages(result._id)).unwrap();
      
      // Set selected user
      dispatch(setSelectedUser(user));
      
      // Close search if open
      setShowSearch(false);
      dispatch(setSearchTerm(''));
      
      // On mobile, show chat panel
      if (isMobile) {
        const chatPanel = document.querySelector('.chat-panel');
        if (chatPanel) {
          chatPanel.classList.add('active');
        }
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  // Search functionality
  const handleSearch = useCallback(async () => {
    if (searchTerm.trim()) {
      try {
        await dispatch(searchUsers(searchTerm)).unwrap();
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      // Reset to all users (excluding current user)
      const filtered = users.filter(u => u._id !== user?.id);
      setChatUsers(filtered);
    }
  }, [searchTerm, dispatch, users, user?.id]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const clearSearch = () => {
    dispatch(setSearchTerm(''));
    setShowSearch(false);
    // Reset to all users (excluding current user)
    const filtered = users.filter(u => u._id !== user?.id);
    setChatUsers(filtered);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat || !selectedUser) return;

    console.log('Sending message:', newMessage);

    const tempId = Date.now().toString();
    const messageData = {
      _id: tempId,
      chatId: currentChat._id,
      senderId: user.id,
      text: newMessage,
      type: 'text',
      timestamp: new Date(),
      tempId: tempId,
      read: false,
      senderName: user.name
    };

    // Optimistically add message
    dispatch(addMessage(messageData));

    // Send via socket
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('send_message', {
        chatId: currentChat._id,
        message: newMessage,
        senderId: user.id,
        tempId: tempId
      });
      console.log('Message sent via socket');
    }

    // Also save to database
    try {
      await dispatch(sendMessage({
        chatId: currentChat._id,
        text: newMessage
      })).unwrap();
      console.log('Message saved to database');
    } catch (error) {
      console.error('Error saving message:', error);
    }

    setNewMessage('');
    setShowEmojiPicker(false);
    
    // Clear typing indicator
    if (socket) {
      socket.emit('typing', { 
        chatId: currentChat._id, 
        userId: user.id,
        isTyping: false 
      });
    }
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setNewMessage(value);
    
    const socket = socketService.getSocket();
    if (!socket || !currentChat || !user?.id) return;

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Emit typing start
    if (value.trim()) {
      socket.emit('typing', { 
        chatId: currentChat._id, 
        userId: user.id,
        isTyping: true 
      });
    } else {
      socket.emit('typing', { 
        chatId: currentChat._id, 
        userId: user.id,
        isTyping: false 
      });
    }

    // Set timeout to stop typing indicator
    const timeout = setTimeout(() => {
      if (socket) {
        socket.emit('typing', { 
          chatId: currentChat._id, 
          userId: user.id,
          isTyping: false 
        });
      }
    }, 1000);

    setTypingTimeout(timeout);
  };

  const onEmojiClick = (emojiData) => {
    const input = messageInputRef.current;
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const newText = newMessage.substring(0, start) + emojiData.emoji + newMessage.substring(end);
      setNewMessage(newText);
      
      // Focus back on input and set cursor position
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + emojiData.emoji.length, start + emojiData.emoji.length);
      }, 0);
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const getUserInitial = (name) => {
    return name?.charAt(0)?.toUpperCase() || 'U';
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return 'Now';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      return '';
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = [];
    let currentDate = '';
    
    messages.forEach((message, index) => {
      const date = formatDate(message.timestamp || message.createdAt);
      
      if (date !== currentDate) {
        groups.push({
          type: 'date',
          content: date,
          key: `date-${index}`
        });
        currentDate = date;
      }
      
      groups.push({
        type: 'message',
        content: message,
        key: message._id || message.tempId || `msg-${index}`
      });
    });
    
    return groups;
  };

  const handleBackToUsers = () => {
    if (isMobile) {
      const chatPanel = document.querySelector('.chat-panel');
      if (chatPanel) {
        chatPanel.classList.remove('active');
      }
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="d-flex" style={{ 
      height: '100vh', 
      width: '100vw', 
      backgroundColor: '#0a0a0a',
      overflow: 'hidden'
    }}>
      {/* Left Panel - Users List (30%) */}
      <div className="users-panel">
        {/* User Profile Header - Compact */}
        <div className="compact-header user-profile-header d-flex align-items-center justify-content-between bg-secondary bg-opacity-10 border-bottom border-secondary">
          <div className="d-flex align-items-center">
            <div className="user-avatar me-3">
              <div className="avatar-circle">
                {getUserInitial(user?.name)}
              </div>
              <div className="online-indicator online"></div>
            </div>
            <div>
              <h6 className="mb-0 text-light">{user?.name}</h6>
              <small className="text-success">Online</small>
            </div>
          </div>
          <div className="header-actions d-flex align-items-center">
            <Button 
              variant="link" 
              className="search-button me-2"
              onClick={() => setShowSearch(true)}
              title="Search"
            >
              <FaSearch size={18} />
            </Button>
            <Button 
              variant="dark" 
              size="sm" 
              className="rounded-circle"
              title="New Chat"
            >
              <FaPlus />
            </Button>
            <Button 
              variant="dark" 
              size="sm" 
              className="rounded-circle ms-2"
              title="Menu"
            >
              <BsThreeDotsVertical />
            </Button>
          </div>
        </div>

        {/* Users List */}
        <div className="users-list" style={{ 
          height: 'calc(100vh - 70px)', 
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          <div className="p-3 border-bottom border-secondary">
            <h6 className="text-light mb-0">
              <FaUserFriends className="me-2" />
              Chats ({chatUsers.length})
            </h6>
          </div>
          
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : chatUsers.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">
                <FaComment size={48} className="text-secondary" />
              </div>
              <p className="text-secondary">No chats yet</p>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => setShowSearch(true)}
              >
                <FaSearch className="me-2" />
                Start New Chat
              </Button>
            </div>
          ) : (
            chatUsers.map(u => (
              <div
                key={u._id}
                className={`user-item d-flex align-items-center p-3 border-bottom border-secondary cursor-pointer ${
                  selectedUser?._id === u._id ? 'selected-user' : ''
                }`}
                onClick={() => handleCreateChat(u)}
              >
                <div className="user-avatar position-relative me-3">
                  <div className="avatar-circle">
                    {getUserInitial(u.name)}
                  </div>
                  <div className={`online-indicator ${isUserOnline(u._id) ? 'online' : 'offline'}`}></div>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="mb-0 text-light">{u.name}</h6>
                    <small className="text-secondary">12:30 PM</small>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-secondary text-truncate" style={{ maxWidth: '150px' }}>
                      {isUserOnline(u._id) ? 'Online now' : 'Offline'}
                    </small>
                    <Badge bg="primary" className="rounded-pill">1</Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Chat Area (70%) */}
      <div className={`chat-panel ${selectedUser ? 'active' : ''}`}>
        {selectedUser ? (
          <>
            {/* Chat Header with Back Button for Mobile */}
            <div className="chat-header d-flex align-items-center justify-content-between p-3 bg-secondary bg-opacity-10 border-bottom border-secondary">
              <div className="d-flex align-items-center">
                {isMobile && (
                  <Button 
                    variant="link" 
                    className="me-3 text-light p-0"
                    onClick={handleBackToUsers}
                  >
                    <FaArrowLeft size={20} />
                  </Button>
                )}
                <div className="user-avatar position-relative me-3">
                  <div className="avatar-circle">
                    {getUserInitial(selectedUser.name)}
                  </div>
                  <div className={`online-indicator ${isUserOnline(selectedUser._id) ? 'online' : 'offline'}`}></div>
                </div>
                <div>
                  <h5 className="mb-0 text-light">{selectedUser.name}</h5>
                  <div className="user-status">
                    {isUserOnline(selectedUser._id) ? (
                      <small className="text-success">● Online</small>
                    ) : (
                      <small className="text-secondary">● Offline</small>
                    )}
                    {isTyping && typingUser === selectedUser._id && (
                      <span className="typing-text ms-2">
                        <span className="typing-dots">
                          <span>.</span><span>.</span><span>.</span>
                        </span>
                        typing
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="chat-actions">
                <Button 
                  variant="dark" 
                  className="rounded-circle" 
                  onClick={() => setShowUserInfo(true)}
                  title="User Info"
                >
                  <FaEllipsisV />
                </Button>
              </div>
            </div>

            {/* Messages Container */}
            <div 
              className="messages-container flex-grow-1"
              style={{ 
                overflowY: 'auto', 
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%239C92AC" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E")' 
              }}
            >
              <div className="messages-wrapper p-3">
                {messages.length === 0 ? (
                  <div className="text-center h-100 d-flex flex-column justify-content-center align-items-center">
                    <div className="empty-chart-icon mb-4">
                      <div className="p-4 rounded-circle bg-dark bg-opacity-50 border border-secondary d-inline-flex">
                        <FaPaperPlane size={48} className="text-primary" />
                      </div>
                    </div>
                    <h4 className="text-light mb-3">Start a conversation!</h4>
                    <p className="text-secondary mb-0">
                      Send your first message to {selectedUser.name}
                    </p>
                  </div>
                ) : (
                  <>
                    {groupMessagesByDate().map((item) => {
                      if (item.type === 'date') {
                        return (
                          <div key={item.key} className="date-divider text-center my-3">
                            <Badge bg="dark" className="px-3 py-2">
                              {item.content}
                            </Badge>
                          </div>
                        );
                      }
                      
                      const msg = item.content;
                      const isCurrentUser = msg.senderId === user.id;
                      
                      return (
                        <div
                          key={item.key}
                          className={`message-row mb-3 ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}
                        >
                          <div className={`message-container ${isCurrentUser ? 'current-user' : 'other-user'}`}>
                            <div className={`message-bubble ${isCurrentUser ? 'current-user-bubble' : 'other-user-bubble'}`}>
                              <div className="message-content">{msg.text || msg.content}</div>
                              <div className="message-time d-flex align-items-center gap-1">
                                {formatTime(msg.timestamp || msg.createdAt)}
                                {isCurrentUser && (
                                  <>
                                    {msg.read ? (
                                      <FaCheckDouble className="text-info" size={12} />
                                    ) : (
                                      <FaCheck className="text-secondary" size={12} />
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </div>

            {/* Message Input with Emoji Picker */}
            <div className="message-input p-3 bg-secondary bg-opacity-10">
              {showEmojiPicker && (
                <div 
                  ref={emojiPickerRef}
                  className="emoji-picker-container"
                >
                  <EmojiPicker 
                    onEmojiClick={onEmojiClick}
                    width={350}
                    height={400}
                  />
                </div>
              )}
              
              <Form onSubmit={handleSendMessage}>
                <InputGroup>
                  <Button 
                    type="button"
                    variant="dark" 
                    className="rounded-start-circle"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    title="Emoji"
                  >
                    <FaSmile />
                  </Button>
                  <Form.Control
                    ref={messageInputRef}
                    type="text"
                    placeholder="Type a message"
                    value={newMessage}
                    onChange={handleTyping}
                    className="bg-dark text-light border-0"
                    style={{ borderRadius: '0' }}
                  />
                  <Button 
                    variant="primary" 
                    type="submit"
                    className="send-button rounded-end-circle"
                    disabled={!newMessage.trim()}
                  >
                    <IoIosSend size={20} />
                  </Button>
                </InputGroup>
              </Form>
            </div>
          </>
        ) : (
          <div className="d-flex flex-column justify-content-center align-items-center h-100 bg-chat">
            <div className="welcome-container text-center p-5">
              <div className="welcome-icon mb-4">
                <div className="p-4 rounded-circle bg-dark bg-opacity-50 border border-secondary d-inline-flex">
                  <FaPaperPlane size={64} className="text-primary" />
                </div>
              </div>
              <h1 className="text-light mb-3">
                Welcome, <span className="text-primary">{user?.name}</span>
              </h1>
              <p className="text-secondary mb-4">
                Select a contact from the left to start chatting
              </p>
              <div className="stats d-flex justify-content-center gap-4">
                <div className="stat-item">
                  <h3 className="text-primary">{chatUsers.length}</h3>
                  <small className="text-secondary">Contacts</small>
                </div>
                <div className="stat-item">
                  <h3 className="text-success">
                    {onlineUsers.filter(id => id !== user?.id).length}
                  </h3>
                  <small className="text-secondary">Online</small>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Modal */}
      <Modal 
        show={showSearch} 
        onHide={() => setShowSearch(false)}
        fullscreen
        className="search-overlay-modal"
      >
        <div className="search-overlay">
          <div className="search-header d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center w-100">
              <Button 
                variant="link" 
                className="text-light me-3 p-0"
                onClick={() => setShowSearch(false)}
              >
                <FaArrowLeft size={20} />
              </Button>
              <Form onSubmit={handleSearchSubmit} className="flex-grow-1">
                <InputGroup>
                  <InputGroup.Text className="bg-transparent border-0">
                    <FaSearch className="text-secondary" />
                  </InputGroup.Text>
                  <Form.Control
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => {
                      dispatch(setSearchTerm(e.target.value));
                      handleSearch();
                    }}
                    className="compact-search-input bg-transparent border-0 text-light"
                  />
                  {searchTerm && (
                    <Button
                      variant="link"
                      className="text-secondary"
                      onClick={clearSearch}
                    >
                      <FaTimes />
                    </Button>
                  )}
                </InputGroup>
              </Form>
            </div>
          </div>
          
          <div className="search-content">
            <div className="search-results-container">
              {searchTerm.trim() ? (
                loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-secondary">No users found for "{searchTerm}"</p>
                  </div>
                ) : (
                  <>
                    <div className="p-3 border-bottom border-secondary">
                      <h6 className="text-light mb-0">
                        Search Results ({filteredUsers.length})
                      </h6>
                    </div>
                    {filteredUsers
                      .filter(u => u._id !== user?.id)
                      .map(u => (
                      <div
                        key={u._id}
                        className="search-result-item d-flex align-items-center"
                        onClick={() => handleCreateChat(u)}
                      >
                        <div className="user-avatar position-relative me-3">
                          <div className="avatar-circle">
                            {getUserInitial(u.name)}
                          </div>
                          <div className={`online-indicator ${isUserOnline(u._id) ? 'online' : 'offline'}`}></div>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 text-light">{u.name}</h6>
                          <small className="text-secondary">{u.email}</small>
                        </div>
                        <div className="ms-3">
                          <Badge bg={isUserOnline(u._id) ? "success" : "secondary"}>
                            {isUserOnline(u._id) ? 'Online' : 'Offline'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </>
                )
              ) : (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <FaSearch size={48} className="text-secondary" />
                  </div>
                  <h5 className="text-light mb-2">Search Users</h5>
                  <p className="text-secondary">
                    Type in the search bar above to find users by name or email
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* User Info Modal */}
      <Modal show={showUserInfo} onHide={() => setShowUserInfo(false)} centered>
        <Modal.Header closeButton className="bg-dark border-secondary">
          <Modal.Title className="text-light">User Information</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          {selectedUser && (
            <div className="text-center">
              <div className="avatar-modal mb-4">
                <div className="avatar-circle-lg">
                  {getUserInitial(selectedUser.name)}
                </div>
                <div className={`status-badge ${isUserOnline(selectedUser._id) ? 'online' : 'offline'}`}>
                  {isUserOnline(selectedUser._id) ? 'Online' : 'Offline'}
                </div>
              </div>
              <h4>{selectedUser.name}</h4>
              <p className="text-secondary">{selectedUser.email}</p>
              <div className="user-info mt-4">
                <p className="mb-2"><strong>Status:</strong> {isUserOnline(selectedUser._id) ? 'Online now' : 'Last seen recently'}</p>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ChatPage;