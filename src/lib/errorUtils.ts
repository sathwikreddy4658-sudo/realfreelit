/**
 * Error handling utility to prevent information leakage
 * Maps technical errors to user-friendly messages
 */

export const sanitizeError = (error: any): string => {
  // Log detailed error only in development mode
  if (import.meta.env.DEV) {
    console.error('Error details:', error);
  }

  // Map common error codes to user-friendly messages
  if (error?.message) {
    const errorMsg = error.message.toLowerCase();
    
    // Authentication errors
    if (errorMsg.includes('invalid login credentials') || 
        errorMsg.includes('invalid email or password')) {
      return 'Invalid email or password. Please try again.';
    }
    
    if (errorMsg.includes('email already registered') || 
        errorMsg.includes('user already registered')) {
      return 'An account with this email already exists.';
    }
    
    if (errorMsg.includes('email not confirmed')) {
      return 'Please verify your email address to continue.';
    }
    
    // Database/network errors
    if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    // Permission errors
    if (errorMsg.includes('permission') || errorMsg.includes('unauthorized')) {
      return 'You do not have permission to perform this action.';
    }
    
    // Stock/inventory errors
    if (errorMsg.includes('insufficient stock') || errorMsg.includes('stock')) {
      return 'Some items are out of stock. Please update your cart.';
    }
    
    // Validation errors (these are already user-friendly)
    if (errorMsg.includes('validation') || errorMsg.includes('invalid')) {
      return error.message;
    }
  }
  
  // Default generic error message
  return 'An error occurred. Please try again later.';
};
