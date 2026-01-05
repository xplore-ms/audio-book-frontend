import React from 'react';
import { Link } from 'react-router-dom';
import { UploadIcon, FileIcon, CheckCircleIcon, MailIcon } from './Icons';

export default function HowItWorks() {
  const steps = [
    {
      title: "Upload Your PDF",
      description: "Select any PDF document you want to listen to. Our system accepts academic papers, books, reports, and more.",
      icon: <UploadIcon className="w-8 h-8 text-white" />,
      color: "bg-indigo-500"
    },
    {
      title: "AI Processing",
      description: "We use advanced AI to extract text, clean up headers/footers, and prepare the content for natural speech synthesis.",
      icon: <FileIcon className="w-8 h-8 text-white" />,
      color: "bg-blue-500"
    },
    {
      title: "Audio Generation",
      description: "The text is converted into high-quality, lifelike audio using premium neural voices.",
      icon: <CheckCircleIcon className="w-8 h-8 text-white" />,
      color: "bg-purple-500"
    },
    {
      title: "Delivery via Email",
      description: "Once complete, we send a secure link to your email to stream or download your audiobook.",
      icon: <MailIcon className="w-8 h-8 text-white" />,
      color: "bg-green-500"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-down">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">How It Works</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          From a static document to an immersive audio experience in four simple steps.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {steps.map((step, index) => (
          <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 ${step.color}`} />
            
            <div className={`${step.color} w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-100`}>
              {step.icon}
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
            <p className="text-slate-600 leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-indigo-50 rounded-2xl p-8 text-center border border-indigo-100">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Ready to try it?</h3>
        <p className="text-slate-600 mb-6">Convert your first document for free today.</p>
        <Link 
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}