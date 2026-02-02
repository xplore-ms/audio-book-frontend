import { Link } from 'react-router-dom';
import { XIcon, TelegramIcon, WhatsAppIcon } from '../Icons';

export default function Footer() {
  return (
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
  );
}
