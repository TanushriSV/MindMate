import { useState, FormEvent, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Facebook, User } from 'lucide-react';
import { IMAGES } from '../../constants';

interface SignInProps {
  onSignIn: (user: { id: string; name: string; email: string; avatar: string; joinDate: number; token?: string }) => void;
  onBack: () => void;
}

export default function SignIn({ onSignIn, onBack }: SignInProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // 1. Initialize Google Sign-In if SDK is loaded
    const initGoogle = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (clientId && window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredential,
          auto_select: false,
        });
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          initGoogle();
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    // 2. Initialize Facebook SDK if loaded (avoiding double-initialization runtime error)
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
    if (!appId) return;

    const initFB = () => {
      try {
        FB.init({
          appId: appId,
          cookie: true,
          xfbml: false,
          version: 'v20.0'
        });
      } catch (e) {
        console.warn("FB SDK initialization warning: ", e);
      }
    };

    if (typeof FB !== 'undefined') {
      initFB();
    } else {
      window.fbAsyncInit = initFB;
    }
  }, []);

  const handleGoogleCredential = async (response: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const credential = response.credential;
      
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Google token validation failed on server.");
      }

      const verifiedUser = await res.json();
      setIsLoading(false);
      onSignIn(verifiedUser);
    } catch (e: any) {
      setIsLoading(false);
      setError(e.message || 'Google sign-in cryptographic verification failed.');
    }
  };

  const handleGoogleClick = () => {
    const googleId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleId || googleId === 'dummy-google-client-id' || googleId === '') {
      // Direct simulation signup with secure backend token generation for quick iframe preview convenience
      setIsLoading(true);
      setError(null);
      setTimeout(async () => {
        const nameVal = "Google Seeker";
        const emailVal = "google.user@example.com";
        const idVal = 'google_simulated_user';
        
        try {
          const res = await fetch("/api/auth/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: idVal,
              name: nameVal,
              email: emailVal,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(nameVal)}&background=4285F4&color=fff`
            })
          });
          if (!res.ok) {
            throw new Error("Local sandbox token signing failed.");
          }
          const serverUser = await res.json();
          setIsLoading(false);
          onSignIn(serverUser);
        } catch (err: any) {
          setIsLoading(false);
          setError("Failed to generate secure preview token: " + err.message);
        }
      }, 800);
      return;
    }

    if (!window.google?.accounts?.id) {
      setError('Google SDK not loaded yet. Please wait a moment.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      window.google.accounts.id.prompt((notification) => {
        setIsLoading(false);
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setError('Google One Tap popup skipped inside sandbox iframe. Connect keys to bypass.');
        }
      });
    } catch (err) {
      setIsLoading(false);
      setError('Failed to prompt Google Sign-In.');
    }
  };

  const handleFacebookClick = () => {
    const fbId = import.meta.env.VITE_FACEBOOK_APP_ID;
    if (!fbId || fbId === 'dummy-fb-app-id' || fbId === '') {
      // Direct simulation signup with secure backend token generation for quick iframe preview convenience
      setIsLoading(true);
      setError(null);
      setTimeout(async () => {
        const nameVal = "Facebook Seeker";
        const emailVal = "facebook.user@example.com";
        const idVal = 'facebook_simulated_user';

        try {
          const res = await fetch("/api/auth/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: idVal,
              name: nameVal,
              email: emailVal,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(nameVal)}&background=1877F2&color=fff`
            })
          });
          if (!res.ok) {
            throw new Error("Local sandbox token signing failed.");
          }
          const serverUser = await res.json();
          setIsLoading(false);
          onSignIn(serverUser);
        } catch (err: any) {
          setIsLoading(false);
          setError("Failed to generate secure preview token: " + err.message);
        }
      }, 800);
      return;
    }

    if (typeof FB === 'undefined') {
      setError('Facebook SDK not loaded. Please wait a moment.');
      return;
    }

    setIsLoading(true);
    setError(null);
    FB.login(
      async (response: any) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          try {
            const res = await fetch("/api/auth/facebook", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accessToken }),
            });
            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.error || "Facebook login verification failed on server");
            }
            const verifiedUser = await res.json();
            setIsLoading(false);
            onSignIn(verifiedUser);
          } catch (e: any) {
            setIsLoading(false);
            setError(e.message || 'Facebook login verification failed. Please try again.');
          }
        } else {
          setIsLoading(false);
          setError('Facebook sign-in was cancelled or failed.');
        }
      },
      { scope: 'public_profile,email' }
    );
  };

  const handleForgotPassword = async () => {
    setError(null);
    const emailTrim = email.trim();
    if (!emailTrim) {
      setError("Please enter your email address to request a password reset.");
      return;
    }
    if (!emailTrim.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTrim }),
      });
      setIsLoading(false);
      if (res.ok) {
        setError("Success! Password reset instructions sent to: " + emailTrim);
      } else {
        throw new Error("Failed to submit request.");
      }
    } catch (err: any) {
      setIsLoading(false);
      setError("Failed to log password reset: " + err.message);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailTrim = email.trim();
    const passwordTrim = password;
    const nameTrim = name.trim();

    if (isSignUp && !nameTrim) {
      setError("Please fill in your name.");
      return;
    }
    if (!emailTrim) {
      setError("Please fill in your email address.");
      return;
    }
    if (!emailTrim.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }
    if (passwordTrim.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      try {
        const finalName = isSignUp 
          ? nameTrim 
          : emailTrim.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const id = `email_${btoa(emailTrim)}`;
        
        const res = await fetch("/api/auth/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            name: finalName,
            email: emailTrim,
            password: passwordTrim,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=6750A4&color=fff`
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Session authentication failed.");
        }

        const serverUser = await res.json();
        setIsLoading(false);
        onSignIn(serverUser);
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || "Sign in session verification failed. Please try again.");
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-16 bg-background">
      <div className="w-full max-w-[1140px] grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        {/* Left Side: Desktop Only Illustration */}
        <div className="md:col-span-6 space-y-8 hidden md:block">
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold text-primary tracking-tight">Your sanctuary for mental clarity.</h1>
            <p className="text-xl text-on-surface-variant max-w-md font-medium leading-relaxed">Join a community dedicated to mindful growth and emotional well-being.</p>
          </div>
          <div className="relative w-full aspect-square rounded-3xl overflow-hidden calm-shadow">
            <img className="w-full h-full object-cover" src={IMAGES.homeIllustration} alt="Meditation" />
            <div className="absolute inset-0 bg-primary/10" />
          </div>
        </div>

        {/* Right Side: Sign In Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-6 flex justify-center"
        >
          <div className="w-full max-w-[480px] bg-white rounded-3xl calm-shadow p-8 md:p-12 space-y-8 border border-surface-variant/30">
            <div className="text-center md:text-left space-y-2">
              <h2 className="text-3xl font-bold text-on-surface">{isSignUp ? "Create an account" : "Welcome back"}</h2>
              <p className="text-sm font-medium text-on-surface-variant">{isSignUp ? "Join our mindful community today" : "Please enter your details to continue"}</p>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              {isSignUp && (
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-bold text-on-surface ml-1 underline decoration-primary/20 decoration-2 underline-offset-4 cursor-pointer">
                    Full name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
                    <input 
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-14 pl-12 pr-6 rounded-2xl bg-surface-container-low border-2 border-transparent focus:border-primary/30 focus:bg-white outline-none transition-all font-medium text-on-surface placeholder:text-outline/50" 
                      placeholder="e.g. Alex Seeker" 
                      type="text"
                      disabled={isLoading}
                      required={isSignUp}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-bold text-on-surface ml-1 underline decoration-primary/20 decoration-2 underline-offset-4 cursor-pointer">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
                  <input 
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 pl-12 pr-6 rounded-2xl bg-surface-container-low border-2 border-transparent focus:border-primary/30 focus:bg-white outline-none transition-all font-medium text-on-surface placeholder:text-outline/50" 
                    placeholder="e.g. alex@example.com" 
                    type="email"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-bold text-on-surface ml-1 underline decoration-primary/20 decoration-2 underline-offset-4 cursor-pointer">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
                  <input 
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 pl-12 pr-12 rounded-2xl bg-surface-container-low border-2 border-transparent focus:border-primary/30 focus:bg-white outline-none transition-all font-medium text-on-surface placeholder:text-outline/50" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                    disabled={isLoading}
                    required
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors cursor-pointer" 
                    type="button"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-start px-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input className="w-5 h-5 rounded-lg border-2 border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 bg-surface-container-low cursor-pointer transition-all" type="checkbox" />
                  <span className="text-xs font-bold text-on-surface-variant group-hover:text-on-surface transition-colors">Remember me</span>
                </label>
              </div>

              {error && (
                <p className="text-sm font-semibold text-error text-center bg-error/5 py-2.5 px-4 rounded-xl border border-error/10 animate-fade-in">
                  {error}
                </p>
              )}

              <button 
                className="w-full h-14 bg-primary text-white rounded-2xl font-bold calm-shadow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isSignUp ? "Create account" : "Sign in"}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-outline-variant/20"></div></div>
              <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest"><span className="bg-white px-4 text-outline">Or continue with</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleGoogleClick}
                className="flex items-center justify-center gap-3 h-14 rounded-2xl bg-surface-container-low border-2 border-transparent hover:border-primary/20 transition-all active:scale-95 cursor-pointer"
              >
                <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfvw3Qit4vnRMeZXQFH9o1yf4QT-hsW5tZHdc3_30LjJ8qxugVX9j5W3uWL3NSPUO36GkqYAL0xtpHr-IDrs9H67DjIbJmorMk6mYqLjFV6NCObzw1Qggq-D3aNDE5ZrgtLk4MREuXK56GFgFhT4Slpbl1ElO75K7zj_RrC-MDzTUkdYb_hClRr2urxw7fMQEemqQhDpiPlvXzVr-7XdcHkygvheZk-yVDItsxIApQClM3OI6FID63Epvg9wHi9rDBHrUs7FuPhhGm"/>
                <span className="text-sm font-bold text-on-surface">Google</span>
              </button>
              <button 
                onClick={handleFacebookClick}
                className="flex items-center justify-center gap-3 h-14 rounded-2xl bg-surface-container-low border-2 border-transparent hover:border-primary/20 transition-all active:scale-95 cursor-pointer"
              >
                <Facebook className="text-[#1877F2]" size={20} fill="currentColor" />
                <span className="text-sm font-bold text-on-surface">Facebook</span>
              </button>
            </div>

            <p className="text-center text-sm font-medium text-on-surface-variant pt-4">
              {isSignUp ? (
                <>
                  Already have an account? <button type="button" onClick={() => { setIsSignUp(false); setError(null); }} className="text-primary font-bold hover:underline cursor-pointer">Sign in here</button>
                </>
              ) : (
                <>
                  Don't have an account? <button type="button" onClick={() => { setIsSignUp(true); setError(null); }} className="text-primary font-bold hover:underline cursor-pointer">Sign up for free</button>
                </>
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
