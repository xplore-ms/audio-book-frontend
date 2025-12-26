import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { SpinnerIcon } from '../Icons';

export function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleLogin } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await handleLogin(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100 animate-fade-in-up">
      <h2 className="text-3xl font-black text-slate-900 mb-6 text-center tracking-tight">Welcome Back</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium animate-shake">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
          <input 
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50 font-medium"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
          <input 
            type="password" required value={password} onChange={e => setPassword(e.target.value)}
            className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50 font-medium"
            placeholder="••••••••"
          />
        </div>
        <button 
          disabled={loading}
          className="w-full bg-indigo-600 text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] flex justify-center items-center gap-2"
        >
          {loading ? <SpinnerIcon className="w-5 h-5" /> : 'Sign In'}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-slate-500">
        Don't have an account? <button onClick={() => navigate('/signup')} className="text-indigo-600 font-bold hover:underline">Join Free</button>
      </p>
    </div>
  );
}

export function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleRegister, handleLogin } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await handleRegister(email, password);
      // Auto-login after successful registration
      await handleLogin(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100 animate-fade-in-up">
      <h2 className="text-3xl font-black text-slate-900 mb-2 text-center tracking-tight">Create Account</h2>
      <p className="text-center text-slate-500 text-sm mb-8 font-medium">Get 10 free credits on sign up! 🎁</p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium animate-shake">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
          <input 
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50 font-medium"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
          <input 
            type="password" required value={password} onChange={e => setPassword(e.target.value)}
            className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50 font-medium"
            placeholder="Create a strong password"
          />
        </div>
        <button 
          disabled={loading}
          className="w-full bg-indigo-600 text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] flex justify-center items-center gap-2"
        >
          {loading ? <SpinnerIcon className="w-5 h-5" /> : 'Claim 10 Credits & Join'}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-slate-500">
        Already a member? <button onClick={() => navigate('/signin')} className="text-indigo-600 font-bold hover:underline">Sign In</button>
      </p>
    </div>
  );
}