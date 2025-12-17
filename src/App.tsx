import { Routes, Route, Link, useLocation } from 'react-router-dom';
import HomeView from './components/HomeView';
import HowItWorks from './components/HowItWorks';
import About from './components/About';
import Donate from './components/Donate';
import ListenView from './components/ListenView';

export default function App() {
  const location = useLocation();

  const NavLink = ({ to, label }: { to: string, label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to}
        className={`transition-colors ${isActive ? 'text-indigo-600 font-semibold' : 'hover:text-indigo-600'}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Navigation / Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:bg-indigo-700 transition-colors">
                A
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">AudioPDF</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-500">
              <NavLink to="/" label="Converter" />
              <NavLink to="/how-it-works" label="How it works" />
              <NavLink to="/about" label="About" />
              
              {/* Pricing with Tooltip */}
              <div className="group relative">
                <button className="hover:text-indigo-600 transition-colors cursor-default">Pricing</button>
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Coming Soon
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
              </div>

              <Link 
                to="/donate"
                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition-colors"
              >
                Donate
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 relative overflow-hidden">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-indigo-50 to-transparent -z-10 pointer-events-none" />
        
        <div className="w-full max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/about" element={<About />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/listen" element={<ListenView />} />
          </Routes>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} AudioPDF. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <Link to="/about" className="hover:text-indigo-600">About</Link>
            <Link to="/donate" className="hover:text-indigo-600">Donate</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}