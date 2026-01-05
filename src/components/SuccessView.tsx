import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, XIcon, TelegramIcon, WhatsAppIcon } from './Icons';

interface SuccessViewProps {
  onReset: () => void;
  onContinue: () => void;
}

export default function SuccessView({ onReset, onContinue }: SuccessViewProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl p-10 md:p-16 max-w-2xl w-full text-center border border-slate-100 animate-fade-in-up">
      <div className="w-24 h-24 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
        <CheckCircleIcon className="w-12 h-12 text-green-500" />
      </div>
      
      <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
        Conversion Complete!
      </h2>
      
      <p className="text-lg text-slate-500 mb-12 leading-relaxed max-w-md mx-auto">
        Your PDF has been successfully narrated. You can now access the interactive player in your library.
      </p>

      {/* <div className="bg-indigo-50/50 rounded-[2rem] p-8 mb-12 text-left border border-indigo-100 flex items-center gap-6">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
          <MailIcon className="w-7 h-7 text-indigo-600" />
        </div>
        <div>
          <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-1">Backup Access</h4>
          <p className="text-sm text-slate-600">
            A secure link has also been sent to <strong>{email}</strong> for offline listening.
          </p>
        </div>
      </div> */}

      <div className="flex flex-col gap-4 mb-12">
        <button
          onClick={() => navigate('/my-library')}
          className="flex items-center justify-center gap-3 py-5 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.15em] rounded-2xl shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1 active:scale-95 text-sm"
        >
          Open My Library
        </button>
        
        <div className="flex gap-4">
          <button
            onClick={onContinue}
            className="flex-1 py-4 px-6 bg-white border-2 border-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all text-sm"
          >
            Same PDF (Retry Range)
          </button>
          <button
            onClick={onReset}
            className="flex-1 py-4 px-6 bg-white border-2 border-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all text-sm"
          >
            New Document
          </button>
        </div>
      </div>

      <div className="pt-10 border-t border-slate-50">
        <h4 className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-[0.3em]">Join the Community</h4>
        <div className="flex justify-center gap-6">
          <a href="https://x.com/promisepro138" target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all transform hover:scale-110">
            <XIcon className="w-5 h-5" />
          </a>
          <a href="https://t.me/placeholder" target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:bg-sky-500 hover:text-white transition-all transform hover:scale-110">
            <TelegramIcon className="w-5 h-5" />
          </a>
          <a href="https://chat.whatsapp.com/placeholder" target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:bg-green-500 hover:text-white transition-all transform hover:scale-110">
            <WhatsAppIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}