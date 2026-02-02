import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyPayment } from '../api/payments.api';
import { useUser } from '../context/UserContext';
import { SpinnerIcon } from './Icons';

export default function VerifyPayment() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const [error, setError] = useState<string | null>(null);

  const reference = params.get('reference');

  useEffect(() => {
    if (!reference) {
      setError('Invalid payment reference.');
      return;
    }

    const verify = async () => {
      try {
        await verifyPayment(reference);
        // Sync the credits locally
        await refreshUser();
        // Short delay for better UX before jumping back to home
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } catch (err) {
        setError('Payment verification failed. If you were charged, please contact support.');
      }
    };

    verify();
  }, [reference, navigate, refreshUser]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 animate-fade-in">
      {!error ? (
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
             <SpinnerIcon className="w-16 h-16 text-indigo-600" />
             <div className="absolute inset-0 w-16 h-16 bg-indigo-600/10 animate-ping rounded-full" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight uppercase">Processing Payment</h2>
            <p className="text-slate-500 font-medium animate-pulse">Confirming your transaction with Paystack...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-red-100 max-w-md w-full">
           <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           </div>
           <h2 className="text-xl font-black text-slate-900 mb-4">{error}</h2>
           <button
            onClick={() => navigate('/store')}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-indigo-100"
          >
            Back to Store
          </button>
        </div>
      )}
    </div>
  );
}