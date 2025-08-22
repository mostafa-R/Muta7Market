// src/types/auth.js

export const USER_ROLES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  USER: 'user'
};

// Permission constants
export const PERMISSIONS = {
  DASHBOARD_READ: 'dashboard:read',
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  ADMIN_READ: 'admin:read',
  ADMIN_WRITE: 'admin:write',
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write'
};

// Default user object structure
export const DEFAULT_USER = {
  id: '',
  name: '',
  email: '',
  phone: '',
  role: USER_ROLES.USER,
  lastLogin: '',
  profileImage: '',
  isEmailVerified: false
};

// Default form data structures
export const DEFAULT_LOGIN_FORM = {
  email: '',
  password: ''
};

export const DEFAULT_REGISTER_FORM = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: ''
};

export const DEFAULT_RESET_PASSWORD_FORM = {
  email: ''
};

export const DEFAULT_CHANGE_PASSWORD_FORM = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};

// API Response structure helpers
export const createApiResponse = (success, data = null, message = '') => ({
  success,
  data,
  message
});

export const createLoginResponse = (user, token, message = 'Login successful') => ({
  success: true,
  data: { user, token },
  message
});

export const createRegisterResponse = (user, token = null, message = 'Registration successful') => ({
  success: true,
  data: { user, token },
  message
});

export const createApiError = (message, errors = null, statusCode = 400) => ({
  message,
  errors,
  statusCode
});

// JWT Token helpers
export const createJWTPayload = (id, email, role, exp, iat) => ({
  id,
  email,
  role,
  exp,
  iat
});

// Default Auth Context structure
export const DEFAULT_AUTH_CONTEXT = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  checkAuth: () => false,
  updateUser: () => {}
};

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  [USER_ROLES.USER]: [
    PERMISSIONS.DASHBOARD_READ
  ],
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_WRITE,
    PERMISSIONS.ADMIN_READ
  ],
  [USER_ROLES.SUPER_ADMIN]: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_WRITE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.ADMIN_READ,
    PERMISSIONS.ADMIN_WRITE,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_WRITE
  ]
};

// Utility functions for type checking and validation
export const isValidUser = (user) => {
  return user && 
         typeof user.id === 'string' &&
         typeof user.name === 'string' &&
         typeof user.email === 'string' &&
         Object.values(USER_ROLES).includes(user.role);
};

export const isValidLoginForm = (form) => {
  return form &&
         typeof form.email === 'string' &&
         typeof form.password === 'string' &&
         form.email.trim().length > 0 &&
         form.password.trim().length > 0;
};

export const isValidRegisterForm = (form) => {
  return form &&
         typeof form.name === 'string' &&
         typeof form.email === 'string' &&
         typeof form.password === 'string' &&
         typeof form.confirmPassword === 'string' &&
         form.name.trim().length > 0 &&
         form.email.trim().length > 0 &&
         form.password.trim().length > 0 &&
         form.password === form.confirmPassword;
};

export const hasPermission = (userRole, permission) => {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};

export const hasAnyPermission = (userRole, permissions) => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

export const hasAllPermissions = (userRole, permissions) => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

// JWT token utility functions
export const isTokenExpired = (token) => {
  try {
    if (!token) return true;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const decodeToken = (token) => {
  try {
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    return null;
  }
};

// Form validation helpers
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password, minLength = 6) => {
  return password && password.length >= minLength;
};

export const validatePhone = (phone) => {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

// Error handling helpers
export const formatApiError = (error) => {
  if (typeof error === 'string') {
    return { message: error };
  }
  
  if (error && error.message) {
    return {
      message: error.message,
      errors: error.errors || null,
      statusCode: error.statusCode || 400
    };
  }
  
  return { message: 'An unexpected error occurred' };
};

// Local storage helpers
export const saveUserToStorage = (user, remember = false) => {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem('userData', JSON.stringify(user));
};

export const saveTokenToStorage = (token, remember = false) => {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem('accessToken', token);
};

export const getUserFromStorage = () => {
  try {
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    return null;
  }
};

export const getTokenFromStorage = () => {
  return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
};

export const clearAuthStorage = () => {
  localStorage.removeItem('userData');
  localStorage.removeItem('accessToken');
  sessionStorage.removeItem('userData');
  sessionStorage.removeItem('accessToken');
};