import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12; // Industry standard for secure hashing

/**
 * Hash a plain-text password using bcrypt
 * @param {string} plainTextPassword - User's password input
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (plainTextPassword) => {
  if (!plainTextPassword || typeof plainTextPassword !== 'string') {
    const error = new Error('Invalid password provided');
    error.statusCode = 400;
    throw error;
  }
  
  try {
    const hash = await bcrypt.hash(plainTextPassword, SALT_ROUNDS);
    console.log('Password hashed successfully');
    return hash;
  } catch (error) {
    console.error('Password hashing failed:', error);
    const hashError = new Error('Password hashing failed');
    hashError.statusCode = 500;
    throw hashError;
  }
};

/**
 * Validate password against stored hash using bcrypt
 * @param {string} plainTextPassword - User's password input
 * @param {string} storedHash - Hash from database
 * @returns {Promise<boolean>} True if password matches
 */
export const validatePassword = async (plainTextPassword, storedHash) => {
  if (!plainTextPassword || !storedHash) {
    return false;
  }
  
  try {
    const isMatch = await bcrypt.compare(plainTextPassword, storedHash);
    
    // For security, do not log authentication outcome details
    // console.log('Password validation attempted');
    
    return isMatch;
  } catch (error) {
    console.error('Password validation error:', error);
    return false;
  }
};

export default {
  hashPassword,
  validatePassword,
};
