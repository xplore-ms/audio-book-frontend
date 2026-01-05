import { useState } from 'react';
import { initiatePayment } from '../api/api';
import { SpinnerIcon } from './Icons';

export default function StoreView() {
  const [credits, setCredits] = useState<number | string>(100);
  const [loading, setLoading] = useState(false);

  const numericCredits = typeof credits === 'string' ? parseInt(credits) || 0 : credits;
  
  // Logic matching backend: 5 Naira per credit, 2.5 Naira if >= 500
  const isDiscounted = numericCredits >= 500;
  const pricePerCredit = isDiscounted ? 2.5 : 5;
  const totalPrice = numericCredits * pricePerCredit;

  const handlePaystack = async () => {
    if (numericCredits <= 0) {
      alert("Please enter a valid credit amount.");
      return;
    }

    setLoading(true);
    try {
      const { authorization_url } = await initiatePayment(numericCredits);
      // Redirect to Paystack
      window.location.href = authorization_url;
    } catch (err) {
      alert('Unable to start payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setAmount = (val: number) => setCredits(val);

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-24 px-4">
      {/* Header */}
      <section className="text-center animate-fade-in-up">
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight leading-none uppercase">
          Credit <span className="text-indigo-600">Hub</span>
        </h1>
        <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
          Fuel your document conversions. Flexible pricing that rewards power users.
        </p>
      </section>

      {/* Credit Selection Card */}
      <div className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-16 border border-slate-100 animate-fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Enter Amount of Credits</label>
            <div className="relative mb-8">
              <input 
                type="number"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                className="w-full text-5xl font-black text-slate-900 bg-slate-50 border-none rounded-3xl p-8 pr-20 focus:ring-4 focus:ring-indigo-100 transition-all outline-none tabular-nums"
                placeholder="100"
              />
              <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xl uppercase tracking-widest">CR</span>
            </div>

            <div className="flex flex-wrap gap-3">
              {[50, 100, 250, 500, 1000].map(amt => (
                <button 
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${numericCredits === amt ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-indigo-50/50 rounded-[2.5rem] p-10 border border-indigo-100 flex flex-col justify-center text-center relative overflow-hidden">
            {isDiscounted && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-bounce shadow-lg">
                50% OFF Applied
              </div>
            )}
            
            <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Total Price</p>
            <div className="flex items-center justify-center gap-1 mb-8">
               <span className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">₦{totalPrice.toLocaleString()}</span>
            </div>

            <div className="space-y-4 mb-8">
               <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                  <span className="text-slate-400">Rate</span>
                  <span className={`${isDiscounted ? 'text-green-600' : 'text-slate-900'}`}>
                    ₦{pricePerCredit} / credit
                  </span>
               </div>
               <div className="h-px bg-indigo-100" />
               <div className="text-xs text-indigo-900/60 font-medium italic">
                 Standard cost: ₦5 per credit.
               </div>
            </div>

            <button
              onClick={handlePaystack}
              disabled={loading || numericCredits <= 0}
              className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest transition-all text-sm shadow-xl flex items-center justify-center gap-3 ${loading ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white hover:bg-indigo-600 active:scale-95 shadow-indigo-100'}`}
            >
              {loading ? <SpinnerIcon className="w-5 h-5" /> : 'Checkout Securely'}
            </button>
          </div>
        </div>
      </div>

      {/* Discount Banner */}
      <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100 flex items-center gap-6 animate-fade-in-up">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
           <svg className="w-8 h-8 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1.193.98l1.19-.164zM11.193 6H13a1 1 0 10-1.193-.98l-.193.164z" clipRule="evenodd" /><path d="M9 11H4v5a2 2 0 002 2h3V11zM11 18h3a2 2 0 002-2v-5h-5v7z" /></svg>
        </div>
        <div>
          <h4 className="text-lg font-black text-amber-900 uppercase tracking-tight">Power User Discount</h4>
          <p className="text-amber-800/70 text-sm font-medium">Buying 500 credits or more? We cut the price in half! Get each credit for only <span className="font-black">₦2.5</span> instead of ₦5.</p>
        </div>
      </div>

      <div className="text-center pt-8 border-t border-slate-100">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Secure payments processed by Paystack • No hidden fees</p>
      </div>
    </div>
  );
}