import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Async thunks
export const fetchUsers = createAsyncThunk(
  'chat/fetchUsers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const searchUsers = createAsyncThunk(
  'chat/searchUsers',
  async (searchTerm, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_URL}/api/users/?search=${searchTerm}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createChat = createAsyncThunk(
  'chat/createChat',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(`${API_URL}/api/chats`, {
        firstId: auth.user.id,
        secondId: userId
      }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (chatId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_URL}/api/message/${chatId}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return { chatId, messages: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, text }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(`${API_URL}/api/message`, {
        chatId,
        senderId: auth.user.id,
        text
      }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Chat slice
const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    users: [],
    filteredUsers: [],
    messages: [],
    selectedUser: null,
    currentChat: null,
    searchTerm: '',
    loading: false,
    error: null,
    onlineUsers: [],
    isTyping: false,
    typingUser: null
  },
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
      state.searchTerm = ''; // Clear search when user is selected
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      // Filter users based on search term
      if (action.payload.trim() === '') {
        state.filteredUsers = state.users;
      } else {
        const term = action.payload.toLowerCase();
        state.filteredUsers = state.users.filter(user =>
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
        );
      }
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setTyping: (state, action) => {
      state.isTyping = action.payload.isTyping;
      state.typingUser = action.payload.userId;
    },
    clearChat: (state) => {
      state.selectedUser = null;
      state.currentChat = null;
      state.messages = [];
      state.searchTerm = '';
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch users
    builder.addCase(fetchUsers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.loading = false;
      const currentUserId = action.meta.arg?.currentUserId;
      if (currentUserId) {
        state.users = action.payload.filter(user => user._id !== currentUserId);
      } else {
        state.users = action.payload;
      }
      state.filteredUsers = state.users;
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Search users
    builder.addCase(searchUsers.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(searchUsers.fulfilled, (state, action) => {
      state.loading = false;
      const currentUserId = action.meta.arg?.currentUserId;
      if (currentUserId) {
        state.filteredUsers = action.payload.filter(user => user._id !== currentUserId);
      } else {
        state.filteredUsers = action.payload;
      }
    });

    // Create chat
    builder.addCase(createChat.fulfilled, (state, action) => {
      state.currentChat = action.payload;
    });

    // Fetch messages
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.messages = action.payload.messages;
      if (action.payload.chatId === state.currentChat?._id) {
        state.messages = action.payload.messages;
      }
    });

    // Send message
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      // Message is already added via socket, but we can update status if needed
      const index = state.messages.findIndex(msg => 
        msg._id === action.payload._id || msg.tempId === action.payload.tempId
      );
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    });
  }
});

export const { 
  setSelectedUser, 
  setSearchTerm, 
  addMessage, 
  setMessages,
  setOnlineUsers,
  setTyping,
  clearChat,
  clearError
} = chatSlice.actions;

export default chatSlice.reducer;