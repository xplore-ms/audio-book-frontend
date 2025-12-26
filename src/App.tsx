import { Routes, Route, Link, useLocation } from 'react-router-dom';
import HomeView from './components/HomeView';
import HowItWorks from './components/HowItWorks';
import StoreView from './components/StoreView';
import LibraryView from './components/LibraryView';
import MyLibraryView from './components/MyLibraryView';
import PlayerView from './components/PlayerView';
import { SignIn, SignUp } from './components/Auth/AuthForms';
import { XIcon, TelegramIcon, WhatsAppIcon } from './components/Icons';
import { useUser } from './context/UserContext';

export default function App() {
  const location = useLocation();
  const { user, logout } = useUser();

  const NavLink = ({ to, label }: { to: string, label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className={`transition-colors ${isActive ? 'text-indigo-600 font-semibold' : 'hover:text-indigo-600'}`}>
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">N</div>
              <span className="text-xl font-bold text-slate-900">Narrio Voice</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-500">
              <NavLink to="/" label="Converter" />
              {user && <NavLink to="/my-library" label="My Library" />}
              <NavLink to="/library" label="Public Library" />
              <NavLink to="/how-it-works" label="How it works" />
              <NavLink to="/store" label="Get Credits" />
              
              <div className="h-4 w-px bg-slate-200 mx-1" />

              {user ? (
                <div className="flex items-center gap-6">
                   <Link to="/store" className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">
                    <span className="font-bold">{user.credits}</span>
                    <span className="text-[10px] uppercase font-bold opacity-60">Credits</span>
                  </Link>
                  <button onClick={logout} className="hover:text-red-600 transition-colors">Logout</button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/signin" className="hover:text-indigo-600">Sign In</Link>
                  <Link to="/signup" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold">Join Free</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex flex-col p-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10" />
        <div className="w-full max-w-7xl mx-auto py-10">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/library" element={<LibraryView />} />
            <Route path="/my-library" element={<MyLibraryView />} />
            <Route path="/player/:id" element={<PlayerView />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/store" element={<StoreView />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 pt-12 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm text-slate-500">
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-lg font-bold text-slate-900 mb-4">Narrio Voice</h4>
            <p className="max-w-xs leading-relaxed">The professional choice for converting academic and business documents into high-quality audio.</p>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 mb-4 uppercase tracking-widest text-xs text-indigo-600">Resources</h5>
            <ul className="space-y-2">
              <li><Link to="/library" className="hover:text-indigo-600">Audiobook Library</Link></li>
              <li><Link to="/store" className="hover:text-indigo-600">Buy Credits</Link></li>
              <li><Link to="/how-it-works" className="hover:text-indigo-600">Documentation</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 mb-4 uppercase tracking-widest text-xs text-indigo-600">Community</h5>
            <div className="flex gap-4">
              <a href="https://x.com/promisepro138" target="_blank" rel="noreferrer" className="hover:text-indigo-600"><XIcon className="w-5 h-5" /></a>
              <a href="https://t.me/placeholder" target="_blank" rel="noreferrer" className="hover:text-indigo-600"><TelegramIcon className="w-5 h-5" /></a>
              <a href="https://chat.whatsapp.com/placeholder" target="_blank" rel="noreferrer" className="hover:text-indigo-600"><WhatsAppIcon className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}