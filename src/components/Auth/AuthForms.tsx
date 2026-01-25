import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { SpinnerIcon, EyeIcon, EyeSlashIcon } from '../Icons';
import { verifyEmailCode, forgotPassword, resetPassword } from '../../api/api';

export function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { handleLogin } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await handleLogin(email, password);
      navigate(from);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string' && detail.toLowerCase().includes('verify')) {
        setError("Your email is not verified. Please check your inbox for a code.");
      } else {
        setError(detail || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await forgotPassword(resetEmail);
      setIsResetting(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await resetPassword(resetEmail, resetCode, newPassword);
      setIsForgotPassword(false);
      setIsResetting(false);
      setResetEmail('');
      setResetCode('');
      setNewPassword('');
      setError(null);
      // Optionally, auto-login or show success
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not reset password');
    } finally {
      setLoading(false);
    }
  };

  if (isForgotPassword) {
    if (isResetting) {
      return (
        <div className="max-w-md w-full mx-auto bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 animate-fade-in-up">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 text-center tracking-tight uppercase">Reset Password</h2>
          <p className="text-center text-slate-400 text-xs mb-8 font-bold uppercase leading-relaxed">Enter the code sent to your email and your new password</p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-bold animate-shake text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleResetSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Reset Code</label>
              <input 
                type="text" required value={resetCode} onChange={e => setResetCode(e.target.value)}
                className="w-full p-5 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50 font-black text-center text-3xl tracking-[0.5em] text-slate-900"
                placeholder="00000"
                maxLength={5}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
              <div className="relative">
                <input 
                  type={showNewPassword ? "text" : "password"} required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full p-4 pr-14 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50 font-bold text-slate-900"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors p-2"
                >
                  {showNewPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button 
              disabled={loading}
              className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] flex justify-center items-center gap-2"
            >
              {loading ? <SpinnerIcon className="w-5 h-5" /> : 'Reset Password'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-400 font-bold uppercase tracking-wide">
            <button onClick={() => { setIsResetting(false); setError(null); }} className="text-indigo-600 hover:underline">Back</button>
          </p>
        </div>
      );
    } else {
      return (
        <div className="max-w-md w-full mx-auto bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 animate-fade-in-up">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 text-center tracking-tight uppercase">Forgot Password</h2>
          <p className="text-center text-slate-400 text-xs mb-8 font-bold uppercase leading-relaxed">Enter your email to receive a reset code</p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-bold animate-shake text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleForgotSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input 
                type="email" required value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                className="w-full p-4 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50 font-bold text-slate-900"
                placeholder="you@example.com"
              />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] flex justify-center items-center gap-2"
            >
              {loading ? <SpinnerIcon className="w-5 h-5" /> : 'Send Reset Code'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-400 font-bold uppercase tracking-wide">
            <button onClick={() => { setIsForgotPassword(false); setError(null); }} className="text-indigo-600 hover:underline">Back to Sign In</button>
          </p>
        </div>
      );
    }
  }

  return (
    <div className="max-w-md w-full mx-auto bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 animate-fade-in-up">
      <h2 className="text-3xl font-black text-slate-900 mb-2 text-center tracking-tight uppercase">Welcome Back</h2>
      <p className="text-center text-slate-400 text-sm mb-8 font-bold tracking-widest uppercase">Sign in to your library</p>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-bold animate-shake">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
          <input 
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full p-4 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50 font-bold text-slate-900"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full p-4 pr-14 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50 font-bold text-slate-900"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors p-2"
            >
              {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <p className="mt-4 text-right text-sm text-slate-400 font-bold uppercase tracking-wide">
        <button onClick={() => setIsForgotPassword(true)} className="text-indigo-600 hover:underline">Forgot Password?</button>
      </p>
        <button 
          disabled={loading}
          className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] flex justify-center items-center gap-2"
        >
          {loading ? <SpinnerIcon className="w-5 h-5" /> : 'Sign In'}
        </button>
      </form>
      <p className="mt-10 text-center text-sm text-slate-400 font-bold uppercase tracking-wide">
        New here? <button onClick={() => navigate('/signup', { state: { from } })} className="text-indigo-600 hover:underline">Create Account</button>
      </p>
    </div>
  );
}

export function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { handleRegister, handleLogin } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await handleRegister(email, password);
      setIsVerifying(true);
      setMessage("A verification code has been sent to your email.");
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await verifyEmailCode(email, code);
      // Success - login
      await handleLogin(email, password);
      navigate(from);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="max-w-md w-full mx-auto bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 animate-fade-in-up">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2 text-center tracking-tight uppercase">Verify Email</h2>
        <p className="text-center text-slate-400 text-xs mb-8 font-bold uppercase leading-relaxed">{message}</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-bold animate-shake text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleVerifySubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Verification Code</label>
            <input 
              type="text" required value={code} onChange={e => setCode(e.target.value)}
              className="w-full p-5 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50 font-black text-center text-3xl tracking-[0.5em] text-slate-900"
              placeholder="00000"
              maxLength={5}
            />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] flex justify-center items-center gap-2"
          >
            {loading ? <SpinnerIcon className="w-5 h-5" /> : 'Confirm Code'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 animate-fade-in-up">
      <h2 className="text-3xl font-black text-slate-900 mb-2 text-center tracking-tight uppercase">Join Narrio</h2>
      <p className="text-center text-slate-400 text-sm mb-8 font-bold tracking-widest uppercase italic">Get 10 free credits instantly 🎁</p>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-bold animate-shake text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleRegisterSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
          <input 
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full p-4 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50 font-bold text-slate-900"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full p-4 pr-14 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50 font-bold text-slate-900"
              placeholder="Create a strong password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors p-2"
            >
              {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <button 
          disabled={loading}
          className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] flex justify-center items-center gap-2"
        >
          {loading ? <SpinnerIcon className="w-5 h-5" /> : 'Claim Credits & Join'}
        </button>
      </form>
      <p className="mt-10 text-center text-sm text-slate-400 font-bold uppercase tracking-wide">
        Member already? <button onClick={() => navigate('/signin', { state: { from } })} className="text-indigo-600 hover:underline">Sign In</button>
      </p>
    </div>
  );
}