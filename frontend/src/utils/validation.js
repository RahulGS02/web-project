// Comprehensive validation utilities for RAJINI PHARMA

/**
 * Validate Indian phone number
 * Accepts: 10 digits starting with 6-9
 * Formats: 9876543210, +919876543210, 919876543210
 */
export const validateIndianPhone = (phone) => {
  if (!phone) {
    return { valid: false, message: 'Phone number is required' };
  }

  // Remove all spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Remove +91 or 91 prefix if present
  let number = cleaned;
  if (number.startsWith('+91')) {
    number = number.substring(3);
  } else if (number.startsWith('91') && number.length === 12) {
    number = number.substring(2);
  }

  // Check if it's exactly 10 digits
  if (!/^\d{10}$/.test(number)) {
    return { valid: false, message: 'Phone number must be 10 digits' };
  }

  // Check if it starts with 6, 7, 8, or 9 (valid Indian mobile prefixes)
  if (!/^[6-9]/.test(number)) {
    return { valid: false, message: 'Phone number must start with 6, 7, 8, or 9' };
  }

  return { valid: true, cleaned: number, formatted: `+91${number}` };
};

/**
 * Validate email address
 */
export const validateEmail = (email) => {
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }

  // Check for common typos
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (domain && domain.includes('..')) {
    return { valid: false, message: 'Email contains invalid characters' };
  }

  return { valid: true, cleaned: email.toLowerCase().trim() };
};

/**
 * Validate name
 */
export const validateName = (name) => {
  if (!name) {
    return { valid: false, message: 'Name is required' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters' };
  }

  if (trimmed.length > 100) {
    return { valid: false, message: 'Name must be less than 100 characters' };
  }

  // Allow letters, spaces, dots, and hyphens only
  if (!/^[a-zA-Z\s.\-]+$/.test(trimmed)) {
    return { valid: false, message: 'Name can only contain letters, spaces, dots, and hyphens' };
  }

  // Check for at least one letter
  if (!/[a-zA-Z]/.test(trimmed)) {
    return { valid: false, message: 'Name must contain at least one letter' };
  }

  return { valid: true, cleaned: trimmed };
};

/**
 * Validate password
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }

  if (password.length > 50) {
    return { valid: false, message: 'Password must be less than 50 characters' };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (!@#$%^&* etc.)' };
  }

  return { valid: true };
};

/**
 * Validate address
 */
export const validateAddress = (address) => {
  if (!address) {
    return { valid: false, message: 'Address is required' };
  }

  const trimmed = address.trim();

  if (trimmed.length < 10) {
    return { valid: false, message: 'Address must be at least 10 characters' };
  }

  if (trimmed.length > 500) {
    return { valid: false, message: 'Address must be less than 500 characters' };
  }

  return { valid: true, cleaned: trimmed };
};

