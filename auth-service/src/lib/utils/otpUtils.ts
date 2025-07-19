
// Generate a 6-digit OTP code
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validate OTP format
export function isValidOTP(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

// Format phone number for display
export function formatPhoneForDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

// Mask email for display
export function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  if (!domain) return email;
  const maskedUsername = username.length > 2 
    ? `${username.slice(0, 2)}${'*'.repeat(username.length - 2)}`
    : username;
  return `${maskedUsername}@${domain}`;
}

// Mock API functions (replace with real API calls later)
export async function sendEmailOTP(email: string): Promise<{ success: boolean; message: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock success response
  return {
    success: true,
    message: `Verification code sent to ${maskEmail(email)}`
  };
}

export async function sendPhoneOTP(phone: string): Promise<{ success: boolean; message: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock success response
  return {
    success: true,
    message: `Verification code sent to ${formatPhoneForDisplay(phone)}`
  };
}

export async function verifyEmailOTP(email: string, otp: string): Promise<{ success: boolean; message: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock verification (accept "123456" as valid for testing)
  if (otp === "123456") {
    return {
      success: true,
      message: "Email verified successfully!"
    };
  }
  
  return {
    success: false,
    message: "Invalid verification code. Please try again."
  };
}

export async function verifyPhoneOTP(phone: string, otp: string): Promise<{ success: boolean; message: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock verification (accept "123456" as valid for testing)
  if (otp === "123456") {
    return {
      success: true,
      message: "Phone number verified successfully!"
    };
  }
  
  return {
    success: false,
    message: "Invalid verification code. Please try again."
  };
}
