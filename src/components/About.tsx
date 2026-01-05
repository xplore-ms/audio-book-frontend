import React from 'react';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in-down">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">About AudioPDF</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute bottom-0 left-0 p-8">
            <h2 className="text-3xl font-bold text-white">Our Mission</h2>
          </div>
        </div>
        
        <div className="p-8 space-y-6 text-slate-700 leading-relaxed text-lg">
          <p>
            At AudioPDF, we believe that information should be accessible to everyone, regardless of how they consume it. In a fast-paced world, finding time to sit down and read a 50-page PDF can be challenging.
          </p>
          <p>
            We built this tool to bridge the gap between visual documents and auditory learning. Whether you are a student trying to review notes while commuting, a professional catching up on reports during a workout, or someone who simply prefers listening over reading, AudioPDF is designed for you.
          </p>
          <p>
            Our technology leverages the latest advancements in AI and Text-to-Speech synthesis to ensure that your audiobooks sound natural, engaging, and accurate.
          </p>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="p-6">
          <div className="text-3xl font-bold text-indigo-600 mb-2">10k+</div>
          <div className="text-slate-600 font-medium">Pages Converted</div>
        </div>
        <div className="p-6">
          <div className="text-3xl font-bold text-indigo-600 mb-2">99%</div>
          <div className="text-slate-600 font-medium">Uptime</div>
        </div>
        <div className="p-6">
          <div className="text-3xl font-bold text-indigo-600 mb-2">Free</div>
          <div className="text-slate-600 font-medium">To Start</div>
        </div>
      </div>
    </div>
  );
}