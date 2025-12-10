
export default function Donate() {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in-down text-center">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-6">Support Our Work</h1>
      
      <p className="text-xl text-slate-600 mb-10 leading-relaxed">
        AudioPDF is currently free to use. Server costs for AI processing and storage are paid out of pocket. 
        If this tool has saved you time, please consider buying us a coffee!
      </p>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-indigo-100 max-w-md mx-auto relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500" />
        
        <div className="mb-6">
          <span className="text-6xl">☕</span>
        </div>
        
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Buy us a Coffee</h3>
        <p className="text-slate-500 mb-8">Help keep the servers running.</p>

        <div className="space-y-4">
          <button className="w-full py-3 px-4 bg-[#FFDD00] hover:bg-[#FFEA00] text-black font-bold rounded-xl transition-transform active:scale-95 shadow-sm">
            Donate $5
          </button>
          <button className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition-colors">
            Donate Other Amount
          </button>
        </div>
        
        <p className="mt-6 text-xs text-slate-400">
          Secure payments processed via Stripe.
        </p>
      </div>

      <div className="mt-12 text-slate-500 text-sm">
        <p>Not ready to donate? No problem!</p>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('nav-home'))}
          className="text-indigo-600 hover:underline mt-2 font-medium"
        >
          Go back to converter
        </button>
      </div>
    </div>
  );
}