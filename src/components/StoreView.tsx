import { useUser } from '../context/UserContext';
import { XIcon, TelegramIcon, WhatsAppIcon, CheckCircleIcon } from './Icons';

export default function StoreView() {
  const { user, addCredits, claimSocial } = useUser();

  const packages = [
    { amount: 50, price: 500, label: 'Standard' },
    { amount: 150, price: 1200, label: 'Popular', highlight: true },
    { amount: 500, price: 3500, label: 'Professional' },
  ];

  const handlePaystack = (amount: number) => {
    // Simulated Paystack logic
    alert(`Redirecting to Paystack for NGN ${amount}...`);
    // In a real app, use the Paystack Pop library here
    addCredits(amount);
  };

  const EarnCard = ({ platform, icon: Icon, link, title, credits }: any) => {
    const isClaimed = user?.socialsClaimed[platform as keyof typeof user.socialsClaimed];
    
    return (
      <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${isClaimed ? 'bg-slate-100' : 'bg-indigo-50'}`}>
            <Icon className={`w-6 h-6 ${isClaimed ? 'text-slate-400' : 'text-indigo-600'}`} />
          </div>
          <div>
            <p className="font-bold text-slate-900">{title}</p>
            <p className="text-xs text-slate-500">Earn {credits} credits</p>
          </div>
        </div>
        <button 
          onClick={() => {
            window.open(link, '_blank');
            claimSocial(platform);
          }}
          disabled={isClaimed}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isClaimed ? 'bg-green-50 text-green-600 cursor-default' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
        >
          {isClaimed ? <CheckCircleIcon className="w-4 h-4" /> : 'Join'}
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <section className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Credit Store</h1>
        <p className="text-slate-600">Power your audiobook conversions with credits.</p>
      </section>

      {/* Buy Credits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg, i) => (
          <div key={i} className={`bg-white rounded-2xl p-6 border-2 transition-all hover:shadow-xl ${pkg.highlight ? 'border-indigo-600 scale-105 shadow-md' : 'border-slate-100'}`}>
            {pkg.highlight && <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-1 rounded-full absolute -top-3 left-1/2 -translate-x-1/2 uppercase tracking-widest">Best Value</span>}
            <h3 className="text-xl font-bold text-slate-900 mb-1">{pkg.amount} Credits</h3>
            <p className="text-3xl font-extrabold text-indigo-600 mb-4">₦{pkg.price}</p>
            <ul className="text-sm text-slate-500 space-y-2 mb-8 text-left">
              <li>✓ Permanent credits</li>
              <li>✓ Standard & Full Review</li>
              <li>✓ Priority Processing</li>
            </ul>
            <button 
              onClick={() => handlePaystack(pkg.amount)}
              className={`w-full py-3 rounded-xl font-bold transition-colors ${pkg.highlight ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
            >
              Buy with Paystack
            </button>
          </div>
        ))}
      </div>

      {/* Earn Credits */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Earn Free Credits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <EarnCard 
            platform="x" title="Follow on X" credits={5} 
            link="https://x.com/promisepro138" icon={XIcon} 
          />
          <EarnCard 
            platform="telegram" title="Telegram Group" credits={5} 
            link="https://t.me/placeholder" icon={TelegramIcon} 
          />
          <EarnCard 
            platform="whatsapp" title="WhatsApp Comm." credits={5} 
            link="https://chat.whatsapp.com/placeholder" icon={WhatsAppIcon} 
          />
        </div>
      </section>
    </div>
  );
}