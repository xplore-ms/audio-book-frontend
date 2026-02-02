import React from 'react';
import Header from './Header';
import Footer from './Footer';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />
      <main className="flex-grow flex flex-col p-4 md:p-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10" />
        <div className="w-full max-w-7xl mx-auto py-6 md:py-10">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
