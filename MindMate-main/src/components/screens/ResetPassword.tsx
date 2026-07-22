import { API_BASE_URL } from '@/src/apiConfig';
import { useState, FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { IMAGES } from '../../constants';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token || !email) {
      toastError("Invalid or missing password reset link info.");
      return;
    }

    if (newPassword.length < 6) {
      toastError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toastError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(API_BASE_URL + "/api/auth/reset-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email,
          newPassword,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok) {
        toastSuccess("Your password has been reset successfully. You can now sign in.");
        navigate('/signin');
      } else {
        toastError(data.error || "Failed to reset password. The link may have expired.");
      }
    } catch (err: any) {
      setIsLoading(false);
      toastError("Password reset failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-16 bg-background font-sans" id="reset-password-screen">
      <div className="w-full max-w-[1140px] grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        {/* Left Side: Illustration similar to SignIn */}
        <div className="md:col-span-6 space-y-8 hidden md:block">
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold text-primary tracking-tight">Regain your path.</h1>
            <p className="text-xl text-on-surface-variant max-w-md font-medium leading-relaxed">Let's restore your access to MindMate so you can continue your mindful journey.</p>
          </div>
          <div className="relative w-full aspect-square rounded-3xl overflow-hidden calm-shadow">
            <img className="w-full h-full object-cover" src={IMAGES?.homeIllustration || ""} alt="Restoring peace" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-primary/10" />
          </div>
        </div>

        {/* Right Side: Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-6 flex justify-center"
        >
          <div className="w-full max-w-[480px] bg-white rounded-3xl calm-shadow p-8 md:p-12 space-y-8 border border-surface-variant/30" id="reset-password-card">
            <div className="text-center md:text-left space-y-2">
              <h2 className="text-3xl font-bold text-on-surface">Reset your password</h2>
              {email ? (
                <p className="text-sm font-medium text-on-surface-variant">Resetting password for: <span className="text-primary font-semibold">{email}</span></p>
              ) : (
                <p className="text-sm font-medium text-on-surface-variant">Please choose a brand new secure password</p>
              )}
            </div>

            {!token || !email ? (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-orange-700 text-sm font-medium leading-relaxed">
                Missing password reset link details. Please click the reset link exactly as logged or sent.
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit} id="reset-password-form">
                {/* New Password */}
                <div className="space-y-2">
                  <label htmlFor="new-password" className="block text-sm font-bold text-on-surface ml-1 underline decoration-primary/20 decoration-2 underline-offset-4 cursor-pointer">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
                    <input 
                      id="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-14 pl-12 pr-12 rounded-2xl bg-surface-container-low border-2 border-transparent focus:border-primary/30 focus:bg-white outline-none transition-all font-medium text-on-surface placeholder:text-outline/50" 
                      placeholder="••••••••" 
                      type={showPassword ? 'text' : 'password'}
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="block text-sm font-bold text-on-surface ml-1 underline decoration-primary/20 decoration-2 underline-offset-4 cursor-pointer">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
                    <input 
                      id="confirm-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-14 pl-12 pr-12 rounded-2xl bg-surface-container-low border-2 border-transparent focus:border-primary/30 focus:bg-white outline-none transition-all font-medium text-on-surface placeholder:text-outline/50" 
                      placeholder="••••••••" 
                      type={showConfirmPassword ? 'text' : 'password'}
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full h-14 bg-primary hover:bg-opacity-90 disabled:bg-outline/30 text-on-primary font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-md cursor-pointer hover:shadow-lg disabled:cursor-not-allowed text-base"
                  id="reset-password-submit"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Update Password</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/signin')}
                className="text-sm font-bold text-primary hover:underline cursor-pointer"
                id="reset-password-back-backto-signin"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
