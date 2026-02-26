/**
 * Generate a random 6-digit OTP
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Check if OTP is expired (5 minutes)
 */
export const isOTPExpired = (createdAt) => {
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
  const now = new Date();
  const expiryTime = new Date(createdAt.getTime() + fiveMinutes);
  return now > expiryTime;
};
