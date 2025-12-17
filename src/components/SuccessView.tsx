import { CheckCircleIcon, MailIcon } from './Icons';

interface SuccessViewProps {
  email: string;
  onReset: () => void;
  onContinue: () => void;
}

export default function SuccessView({ email, onReset, onContinue }: SuccessViewProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-10 max-w-xl w-full text-center border border-slate-100 animate-fade-in-up">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <MailIcon className="w-10 h-10 text-green-600" />
      </div>
      
      <h2 className="text-3xl font-bold text-slate-900 mb-4">
        It's on the way!
      </h2>
      
      <p className="text-lg text-slate-600 mb-8 leading-relaxed">
        We have finished processing your PDF. The audio files have been merged and sent to:
        <br />
        <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded mt-2 inline-block">
          {email}
        </span>
      </p>

      <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left">
        <div className="flex items-start gap-3">
          <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-slate-900">Check your inbox</h4>
            <p className="text-sm text-slate-500 mt-1">
              Look for an email with the subject "Your converted audiobook is ready". It contains the direct download link.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-all hover:-translate-y-0.5"
        >
          <span>Convert Another Section</span>
          <span className="bg-indigo-500 rounded px-1.5 py-0.5 text-xs text-indigo-100">Same PDF</span>
        </button>
        
        <button
          onClick={onReset}
          className="w-full py-3 px-4 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          Upload New PDF
        </button>
      </div>
    </div>
  );
}