import { useState, useEffect } from 'react';
import { initiatePayment, getPriceQuote } from '../api/payments.api';
import { SpinnerIcon, CheckCircleIcon } from '../components/Icons';
import type { PriceQuote } from '../types';
import { useUser } from '../context/UserContext';

interface PricingPlan {
  id: string;
  name: string;
  credits: number;
  description: string;
  features: string[];
  popular?: boolean;
  badge?: string;
}

const PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 50,
    description: 'Perfect for students and quick tasks.',
    features: [
      '50 Credits For Quick Documents Processing',
      '4 page range per Quick Documents processing & reset after 2 hour',
      '50 pages max processed per full document processing request',
      'Standard Processing Speed',
      'High Quality Voices',
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    credits: 120,
    description: 'Best value for heavy document users.',
    features: [
      '120 Credits For Quick Documents Processing',
      '4 page range per Quick Documents processing & reset after 30 minutes',
      '200 pages max processed per full document processing request',
      'High Quality Voices',
      'Priority Support'
    ],
    popular: true,
    badge: 'Most Popular'
  },
  {
    id: 'mastery',
    name: 'Mastery',
    credits: 500,
    description: 'Our most powerful plan for ultimate efficiency.',
    features: [
      '500 Credits For Quick Documents Processing',
      '4 page range per Quick Documents processing & reset after each processing completed',
      'Unlimited pages processed per full document processing request',
      'High Quality Voices',
      'Priority Support'
    ],
    badge: 'Best Value'
  }
];

const PLAN_STRENGTH: Record<string, number> = {
  'starter': 1,
  'professional': 2,
  'mastery': 3
};

export default function StoreView() {
  const { user } = useUser();
  const isNigeria = navigator.language.includes("NG");
  const [currency, setCurrency] = useState(isNigeria ? "NGN" : "USD");
  const [quotes, setQuotes] = useState<Record<string, PriceQuote>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [isQuoting, setIsQuoting] = useState(true);

  useEffect(() => {
    const fetchAllQuotes = async () => {
      setIsQuoting(true);
      try {
        const results = await Promise.all(
          PLANS.map(p => getPriceQuote(p.id, currency, user?.id))
        );
        const newQuotes: Record<string, PriceQuote> = {};
        results.forEach((q, i) => {
          newQuotes[PLANS[i].id] = q;
        });
        setQuotes(newQuotes);
      } catch (err) {
        console.error("Failed to fetch pricing quotes", err);
      } finally {
        setIsQuoting(false);
      }
    };

    fetchAllQuotes();
  }, [currency, user?.id]);

  const handlePurchase = async (planId: string) => {
    setLoading(planId);
    try {
      const { authorization_url } = await initiatePayment(planId);
      window.location.href = authorization_url;
    } catch (err) {
      alert('Unable to start payment. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-24 px-4 overflow-hidden">
      {/* Header Section */}
      <section className="text-center space-y-4 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none uppercase">
          Subscription <span className="text-indigo-600">Plans</span>
        </h1>
        <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
          Unlock the full power of Narrio. Choose a monthly subscription that fits your document needs.
        </p>
      </section>

      {/* Currency Switcher */}
      <div className="flex justify-center animate-fade-in-up">
        <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-100 flex gap-2">
          <button
            onClick={() => setCurrency("NGN")}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${currency === "NGN" ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Naira (₦)
          </button>
          <button
            onClick={() => setCurrency("USD")}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${currency === "USD" ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Dollar ($)
          </button>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-8 animate-fade-in-up">
        {PLANS.map((plan) => {
          const isActive = user?.active_plan_id === plan.id;
          const userPlanLevel = user?.active_plan_id ? PLAN_STRENGTH[user.active_plan_id] || 0 : 0;
          const currentPlanLevel = PLAN_STRENGTH[plan.id] || 0;
          const isLowerPlan = user?.active_plan_id && !isActive && currentPlanLevel < userPlanLevel;
          const isUpgrade = quotes[plan.id]?.is_upgrade;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col p-8 md:p-12 rounded-[3rem] bg-white border-2 transition-all duration-300 ${isActive ? 'border-emerald-500 shadow-2xl scale-105 z-10' :
                isLowerPlan ? 'border-slate-50 opacity-60 grayscale-[0.5]' :
                  plan.popular ? 'border-indigo-600 shadow-2xl' : 'border-slate-100 shadow-xl'
                }`}
            >
              {(plan.badge || isActive || isLowerPlan) && (
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2.5 rounded-full shadow-lg ${isActive ? 'bg-emerald-500 shadow-emerald-100' :
                  isLowerPlan ? 'bg-slate-300 shadow-slate-50' :
                    plan.id === 'mastery' ? 'bg-slate-900 shadow-slate-100' : 'bg-indigo-600 shadow-indigo-100'}`}>
                  {isActive ? 'Current Plan' : isLowerPlan ? 'Basic Tier' : plan.badge}
                </div>
              )}

              <div className="mb-10 text-center md:text-left">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">{plan.name}</h3>
                <div className="flex items-baseline justify-center md:justify-start gap-2 mb-2">
                  <span className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">
                    {isQuoting ? (
                      <span className="inline-block w-24 h-12 bg-slate-100 animate-pulse rounded-xl" />
                    ) : (
                      quotes[plan.id]?.display || '—'
                    )}
                  </span>
                  <span className="text-slate-400 font-bold text-xs uppercase">/ Month</span>
                </div>
                {isUpgrade && <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-2 italic">Special Upgrade Price ✨</p>}
                <p className="text-slate-500 font-medium leading-relaxed">{plan.description}</p>
              </div>

              <div className="flex-grow space-y-5 mb-12">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50 pb-2">What's included</p>
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircleIcon className={`w-5 h-5 ${isActive ? 'text-emerald-500' : isLowerPlan ? 'text-slate-300' : 'text-indigo-500'}`} />
                    <span className="text-slate-600 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePurchase(plan.id)}
                disabled={!!loading || isQuoting || isActive || !!isLowerPlan}
                className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all text-sm shadow-xl flex items-center justify-center gap-3 ${loading === plan.id ? 'bg-indigo-100 text-indigo-600' :
                  isActive ? 'bg-emerald-500 text-white cursor-default' :
                    isLowerPlan ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                      plan.popular ? 'bg-indigo-600 text-white hover:bg-slate-900 shadow-indigo-100' :
                        'bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-100'
                  } active:scale-[0.98]`}
              >
                {loading === plan.id ? (
                  <SpinnerIcon className="w-5 h-5" />
                ) : (
                  isActive ? 'Active Subscription' : isLowerPlan ? 'Higher Plan Active' : isUpgrade ? 'Upgrade Now' : 'Subscribe Now'
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom Legal/Info */}
      <div className="text-center pt-8 border-t border-slate-100">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] max-w-2xl mx-auto leading-loose">
          Billed monthly • Secure transactions via Paystack •
          {currency === "USD" ? " Rates converted at current bank rate • " : " Standard regional pricing • "}
          For enterprise or custom volume requirements, please contact our support team.
        </p>
      </div>
    </div>
  );
}