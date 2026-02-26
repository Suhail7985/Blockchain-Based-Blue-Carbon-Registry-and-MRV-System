import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { FiMail, FiCheckCircle, FiLoader, FiShield, FiRefreshCw } from 'react-icons/fi';

export default function VerifyEmail() {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

    const location = useLocation();
    const navigate = useNavigate();
    const { verifyEmail, resendOTP } = useAuth();

    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/register');
            return;
        }

        // Countdown timer for OTP
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [email, navigate]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        const result = await verifyEmail(email, otp);

        if (result.success) {
            toast.success('Email verified successfully! You can now log in.');
            navigate('/login');
        } else {
            toast.error(result.error || 'Invalid OTP. Please try again.');
        }
        setLoading(false);
    };

    const handleResend = async () => {
        if (resending) return;
        setResending(true);
        const result = await resendOTP(email);

        if (result.success) {
            toast.success('A new OTP has been sent to your email.');
            setTimeLeft(600); // Reset timer to 10 minutes
            setOtp('');
        } else {
            toast.error(result.error || 'Failed to resend OTP.');
        }
        setResending(false);
    };

    if (!email) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full relative z-10"
            >
                <div className="glass rounded-3xl shadow-2xl p-8 border border-white/40 bg-white/60 backdrop-blur-xl text-center">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-blue-500 mb-6 shadow-xl"
                    >
                        <FiShield className="text-white" size={40} />
                    </motion.div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
                    <p className="text-gray-600 mb-8">
                        We've sent a 6-digit verification code to <br />
                        <span className="font-semibold text-gray-800">{email}</span>
                    </p>

                    <form onSubmit={handleVerify} className="space-y-6">
                        <div>
                            <label htmlFor="otp" className="sr-only">Enter OTP</label>
                            <input
                                id="otp"
                                name="otp"
                                type="text"
                                maxLength="6"
                                required
                                className="w-full text-center tracking-[1em] text-3xl font-bold px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white/80 backdrop-blur-sm"
                                placeholder="------"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Numeric only
                            />
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            whileHover={{ scale: (loading || otp.length !== 6) ? 1 : 1.02 }}
                            whileTap={{ scale: (loading || otp.length !== 6) ? 1 : 0.98 }}
                            className={`w-full font-bold py-4 px-8 rounded-xl shadow-lg transition-all flex items-center justify-center ${(loading || otp.length !== 6)
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:shadow-xl'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <FiLoader className="mr-2 animate-spin" size={20} />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <FiCheckCircle className="mr-2" size={20} />
                                    Verify Email
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col items-center justify-center space-y-4">
                        <div className={`font-mono font-medium ${timeLeft === 0 ? 'text-red-500' : 'text-gray-600'}`}>
                            Code expires in: {formatTime(timeLeft)}
                        </div>

                        <p className="text-sm text-gray-600">
                            Didn't receive the code?{' '}
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resending}
                                className="font-semibold text-green-600 hover:text-green-700 transition-colors inline-flex items-center disabled:opacity-50"
                            >
                                {resending ? <FiLoader className="animate-spin mr-1" /> : <FiRefreshCw className="mr-1" />}
                                Resend OTP
                            </button>
                        </p>

                        <Link to="/register" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                            Return to Registration
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
