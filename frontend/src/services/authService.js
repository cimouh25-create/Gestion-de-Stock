const API_BASE_URL = 'http://10.0.24.23:8000/api';

// Retrieve tokens from localStorage
const getAccessToken = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');

// Store tokens in localStorage
const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

// Clear tokens from localStorage
const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// Store user data
const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Make authenticated API calls
const apiCall = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const accessToken = getAccessToken();
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return await response.json();
  },

  // Login user
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    const data = await response.json();
    
    // Store tokens and user data
    if (data.access && data.refresh) {
      setTokens(data.access, data.refresh);
      if (data.user) {
        setUser(data.user);
      }
    }

    return data;
  },

  // Logout user
  logout: () => {
    clearTokens();
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await apiCall('/users/me/');
    
    if (!response.ok) {
      clearTokens();
      throw new Error('Failed to fetch user profile');
    }

    const user = await response.json();
    setUser(user);
    return user;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await apiCall('/users/update_profile/', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    const data = await response.json();
    if (data.user) {
      setUser(data.user);
    }
    return data;
  },

  // Change password
  changePassword: async (oldPassword, newPassword, newPasswordConfirm) => {
    const response = await apiCall('/users/change_password/', {
      method: 'POST',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return await response.json();
  },

  // Refresh access token
  refreshToken: async () => {
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    if (data.access) {
      localStorage.setItem('access_token', data.access);
    }

    return data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getAccessToken();
  },

  // Get tokens
  getTokens: () => ({
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
  }),

  // Get user from localStorage
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};
