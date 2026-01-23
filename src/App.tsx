import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import HomeView from './components/HomeView';
import HowItWorks from './components/HowItWorks';
import StoreView from './components/StoreView';
import LibraryView from './components/LibraryViewNew';
import MyLibraryView from './components/MyLibraryViewNew';
import ConfigureJobView from './components/ConfigureJobView';
import { SignIn, SignUp } from './components/Auth/AuthForms';
import { XIcon, TelegramIcon, WhatsAppIcon } from './components/Icons';
import { useUser } from './context/UserContext';
import VerifyPayment from './components/VerifyPayment';
import AudiobookPagesView from './components/AudiobookPagesView';
import AudiobookPlayerView from './components/AudiobookPlayerView';

export default function App() {
  const location = useLocation();
  const { user, logout } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const NavLink = ({ to, label, className = "" }: { to: string, label: string, className?: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`transition-all duration-200 ${isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-indigo-600 font-medium'} ${className}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[60]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <img src="/logo.png" alt="Narrio Logo" height={80} width={80} />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8 text-sm uppercase tracking-widest">
              <NavLink to="/" label="Converter" />
              {user && <NavLink to="/my-library" label="My Library" />}
              <NavLink to="/library" label="Public Library" />
              <NavLink to="/how-it-works" label="How it works" />
              <NavLink to="/store" label="Get Credits" />
              
              <div className="h-6 w-px bg-slate-200 mx-2" />

              {user ? (
                <div className="flex items-center gap-6">
                   <Link to="/store" className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-2xl hover:bg-indigo-100 transition-all font-black">
                    <span>{user.credits}</span>
                    <span className="text-[10px] opacity-60">Credits</span>
                  </Link>
                  <button onClick={logout} className="text-slate-400 hover:text-red-600 font-bold transition-colors">Logout</button>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <Link to="/signin" className="text-slate-600 hover:text-indigo-600 font-bold">Sign In</Link>
                  <Link to="/signup" className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all font-black shadow-xl shadow-slate-100">Join Free</Link>
                </div>
              )}
            </div>

            {/* Mobile Actions Container */}
            <div className="md:hidden flex items-center gap-2">
              {user ? (
                <Link to="/store" className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-black border border-indigo-100">
                  {user.credits} CR
                </Link>
              ) : (
                <Link 
                  to="/signup" 
                  className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all"
                >
                  Join Free
                </Link>
              )}
              
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2.5 rounded-xl transition-all ${isMenuOpen ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}
                aria-label="Toggle Menu"
              >
                {isMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-50 transition-all duration-500 md:hidden ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
        <div className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-500 ease-out flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          {/* Menu Content - Scrollable */}
          <div className="flex-grow overflow-y-auto px-8 pt-24 pb-10">
            <div className="space-y-6">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Main Navigation</p>
              <NavLink to="/" label="Converter" className="block text-3xl tracking-tighter" />
              {user && <NavLink to="/my-library" label="My Library" className="block text-3xl tracking-tighter" />}
              <NavLink to="/library" label="Public Archive" className="block text-3xl tracking-tighter" />
              <NavLink to="/how-it-works" label="How it works" className="block text-3xl tracking-tighter" />
              <NavLink to="/store" label="Get Credits" className="block text-3xl tracking-tighter" />
            </div>

            <div className="mt-12 pt-10 border-t border-slate-50">
              {user ? (
                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">User Session</p>
                    <p className="text-slate-900 font-black truncate text-lg mb-4">{user.email}</p>
                    <div className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-slate-50">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Balance</span>
                        <span className="text-indigo-600 font-black">{user.credits} Credits</span>
                      </div>
                      <Link to="/store" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Add More</Link>
                    </div>
                  </div>
                  <button 
                    onClick={logout} 
                    className="w-full py-5 text-center text-red-500 font-black uppercase tracking-widest text-xs bg-red-50/50 hover:bg-red-50 rounded-2xl transition-all border border-red-100"
                  >
                    Logout Account
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Getting Started</p>
                  <Link 
                    to="/signup" 
                    className="block w-full py-6 bg-indigo-600 text-white text-center font-black uppercase tracking-widest rounded-3xl shadow-2xl shadow-indigo-100 active:scale-95 transition-all text-sm"
                  >
                    Join Free & Claim 10 Credits
                  </Link>
                  <Link 
                    to="/signin" 
                    className="block w-full py-6 bg-slate-50 text-slate-600 text-center font-black uppercase tracking-widest rounded-3xl active:scale-95 transition-all text-sm border border-slate-100"
                  >
                    Sign In to Library
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-8 border-t border-slate-50 bg-slate-50/50">
             <div className="flex justify-center gap-6">
              <a href="https://x.com/promisepro138" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-slate-900 transition-colors"><XIcon className="w-5 h-5" /></a>
              <a href="https://t.me/placeholder" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-sky-500 transition-colors"><TelegramIcon className="w-5 h-5" /></a>
              <a href="https://chat.whatsapp.com/placeholder" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-green-500 transition-colors"><WhatsAppIcon className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow flex flex-col p-4 md:p-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10" />
        <div className="w-full max-w-7xl mx-auto py-6 md:py-10">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/library" element={<LibraryView />} />
            <Route path="/my-library" element={<MyLibraryView />} />
            <Route path="/public-library/:jobId" element={<AudiobookPagesView mode='public'/>} />
            {/* <Route path="/my-library/:jobId" element={<AudiobookPagesView mode='private' />} /> */}
            <Route path="/my-library/:jobId" element={<AudiobookPlayerView mode='private' />} />
            <Route path="/configure/:jobId" element={<ConfigureJobView />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/payment/verify" element={<VerifyPayment />} />
            <Route path="/store" element={<StoreView />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 pt-16 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm text-slate-500">
          <div className="col-span-1 md:col-span-2">
             <div className="flex items-center gap-3 mb-6">
              <Link to="/" className="flex items-center gap-2 group shrink-0">
              <img src="/logo.png" alt="Narrio Logo" height={80} width={80} />
              </Link>
            </div>
            <p className="max-w-xs leading-relaxed font-medium">Transforming complex documents into immersive audio experiences. Professional quality, neural synthesis.</p>
          </div>
          <div>
            <h5 className="font-black text-slate-900 mb-6 uppercase tracking-[0.2em] text-[10px] text-indigo-600">Explore</h5>
            <ul className="space-y-3 font-bold">
              <li><Link to="/library" className="hover:text-indigo-600 transition-colors">Public Archive</Link></li>
              <li><Link to="/store" className="hover:text-indigo-600 transition-colors">Credit Packages</Link></li>
              <li><Link to="/how-it-works" className="hover:text-indigo-600 transition-colors">How it works</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-black text-slate-900 mb-6 uppercase tracking-[0.2em] text-[10px] text-indigo-600">Connect</h5>
            <div className="flex gap-4">
              <a href="https://x.com/promisepro138" target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl hover:bg-slate-900 hover:text-white transition-all transform hover:-translate-y-1"><XIcon className="w-4 h-4" /></a>
              <a href="https://t.me/placeholder" target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl hover:bg-sky-500 hover:text-white transition-all transform hover:-translate-y-1"><TelegramIcon className="w-4 h-4" /></a>
              <a href="https://chat.whatsapp.com/placeholder" target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl hover:bg-green-500 hover:text-white transition-all transform hover:-translate-y-1"><WhatsAppIcon className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-50 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">&copy; {new Date().getFullYear()} Narrio Voice • All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}