import { useState, useEffect } from 'react';
import { initiatePayment, getPriceQuote } from '../api/payments.api';
import { SpinnerIcon } from '../components/Icons';
import type { PriceQuote } from '../types';

export default function StoreView() {
  const isNigeria = navigator.language.includes("NG");

  const [credits, setCredits] = useState<number | string>(100);
  const [currency, setCurrency] = useState(isNigeria ? "NGN" : "USD");
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [isQuoting, setIsQuoting] = useState(false);

  const numericCredits = typeof credits === 'string' ? parseInt(credits) || 0 : credits;

  // Fetch quote from backend whenever credits or currency changes
  useEffect(() => {
    if (numericCredits <= 0) {
      setQuote(null);
      return;
    }

    const fetchQuote = async () => {
      setIsQuoting(true);
      try {
        const data = await getPriceQuote(numericCredits, currency);
        setQuote(data);
      } catch (err) {
        console.error("Quote fetch failed", err);
      } finally {
        setIsQuoting(false);
      }
    };

    const timeout = setTimeout(fetchQuote, 400); // Debounce typing
    return () => clearTimeout(timeout);
  }, [numericCredits, currency]);

  const handlePaystack = async () => {
    if (numericCredits <= 0) {
      alert("Please enter a valid credit amount.");
      return;
    }

    setLoading(true);
    try {
      const { authorization_url } = await initiatePayment(numericCredits);
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

      {/* Currency Toggle */}
      <div className="flex justify-center animate-fade-in-up">
        <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-100 flex gap-2">
          <button
            onClick={() => setCurrency("NGN")}
            className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all ${currency === "NGN" ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Naira (₦)
          </button>
          <button
            onClick={() => setCurrency("USD")}
            className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all ${currency === "USD" ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Dollar ($)
          </button>
        </div>
      </div>

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
            <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Total Price</p>
            <div className="flex items-center justify-center gap-1 mb-8 min-h-[4rem]">
              {isQuoting ? (
                <SpinnerIcon className="w-8 h-8 text-indigo-600 opacity-30" />
              ) : (
                <span className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">
                  {quote ? quote.display : '—'}
                </span>
              )}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                <span className="text-slate-400">Method</span>
                <span className="text-slate-900">Secure Paystack</span>
              </div>
              <div className="h-px bg-indigo-100" />
              <div className="text-xs text-indigo-900/60 font-medium italic">
                {currency === "USD" ? "USD rate converted at server-set bank rate." : "Standard pricing applies."}
              </div>
            </div>

            <button
              onClick={handlePaystack}
              disabled={loading || isQuoting || numericCredits <= 0}
              className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest transition-all text-sm shadow-xl flex items-center justify-center gap-3 ${loading || isQuoting || numericCredits <= 0 ? 'bg-slate-200 text-slate-400 shadow-none' : 'bg-slate-900 text-white hover:bg-indigo-600 active:scale-95 shadow-indigo-100'}`}
            >
              {loading ? <SpinnerIcon className="w-5 h-5" /> : 'Checkout Securely'}
            </button>
          </div>
        </div>
      </div>
      <div className="text-center pt-8 border-t border-slate-100">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Price determined by server-side quote • Secure transaction handling</p>
      </div>
    </div>
  );
}