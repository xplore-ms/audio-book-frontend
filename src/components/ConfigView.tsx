import React, { useState, useEffect, useRef } from 'react';
import { FileIcon } from './Icons';
import { useVoices } from '../features/voices/hooks/useVoices';
import { useUser } from '../context/UserContext';
import { getVoiceSignedUrl } from '../api/voices.api';

interface ConfigViewProps {
  numPages: number;
  onConfirm: (startPage: number, isFull: boolean, endPage?: number, voiceId?: string) => void;
  onLowCredits: (required: number) => void;
  isLoading: boolean;
  initialStartPage?: number;
}

export default function ConfigView({ numPages, onConfirm, onLowCredits, isLoading, initialStartPage = 1 }: ConfigViewProps) {
  const [startPage, setStartPage] = useState<number | ''>(initialStartPage);
  const [endPage, setEndPage] = useState<number | ''>(Math.min(initialStartPage + 3, numPages));
  const [isFullReview, setIsFullReview] = useState(false);
  const { user } = useUser();
  const MAX_STANDARD_PAGES = 4;
  const PLAN_LIMITS: Record<string, number> = {
    starter: 50,
    professional: 200,
    mastery: 5000,
  };
  const DEFAULT_LIMIT = 5;
  const userLimit = user?.active_plan_id ? (PLAN_LIMITS[user.active_plan_id] || DEFAULT_LIMIT) : DEFAULT_LIMIT;
  const isOverLimit = numPages > userLimit;
  const { data: voices = [], isLoading: voicesLoading } = useVoices();
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [previewed, setPreviewed] = useState<Record<string, boolean>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (voices.length > 0 && !selectedVoiceId) {
      setSelectedVoiceId(voices[0].id);
    }
  }, [voices, selectedVoiceId]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  useEffect(() => {
    if (!isFullReview) {
      if (startPage === '' || endPage === '') return;

      const currentRange = endPage - startPage + 1;
      if (currentRange > MAX_STANDARD_PAGES) {
        setEndPage(startPage + MAX_STANDARD_PAGES - 1);
      } else if (endPage < startPage) {
        setEndPage(startPage);
      }
    }
  }, [startPage]);

  const handleStartChange = (val: string) => {
    if (val === '') {
      setStartPage('');
      return;
    }
    const num = parseInt(val);
    if (isNaN(num)) return;
    const clamped = Math.max(1, Math.min(num, numPages));
    setStartPage(clamped);
  };

  const handleEndChange = (val: string) => {
    if (val === '') {
      setEndPage('');
      return;
    }
    if (startPage === '') {
      const num = parseInt(val);
      setEndPage(num);
      return;
    }
    const num = parseInt(val);
    if (isNaN(num)) return;
    let clamped = Math.max(startPage, Math.min(num, numPages));
    if (clamped - startPage + 1 > MAX_STANDARD_PAGES) {
      clamped = startPage + MAX_STANDARD_PAGES - 1;
    }
    setEndPage(clamped);
  };

  const startNum = startPage === '' ? 0 : startPage;
  const endNum = endPage === '' ? -1 : endPage;
  const effectivePageCount = endNum - startNum + 1;
  const creditCost = (isFullReview || startPage === '') ? 0 : effectivePageCount;

  const hasEnoughCredits = user && user.credits >= creditCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startPage === '' || endPage === '') return;
    if (user && user.credits < creditCost) {
      onLowCredits(creditCost);
      return;
    }
    if (isFullReview && !user?.active_plan_id) {
      alert("Full document processing is a premium feature. Please subscribe to a plan to continue.");
      return;
    }
    if (isFullReview && isOverLimit) {
      alert(`Your current plan allows up to ${userLimit} pages for full document processing. This document has ${numPages} pages. Please upgrade or select a smaller range.`);
      return;
    }
    // Pass the selected voice via DOM/form or handle in parent if needed later
    onConfirm(startPage, isFullReview, isFullReview ? numPages : endPage, selectedVoiceId || undefined);
  };

  const handlePlayPreview = async (voiceId: string) => {
    // stop existing
    if (playingId === voiceId) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    setPreviewLoadingId(voiceId);
    try {
      const url = await getVoiceSignedUrl(voiceId);
      if (!url) throw new Error('No URL');

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      audioRef.current.pause();
      audioRef.current.src = url;
      audioRef.current.onended = () => setPlayingId(null);
      await audioRef.current.play();
      setPlayingId(voiceId);
      setPreviewed(prev => ({ ...prev, [voiceId]: true }));
    } catch (e) {
      console.error('Preview failed', e);
    } finally {
      setPreviewLoadingId(null);
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto p-1 animate-fade-in-up">
      <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-8 md:p-12 border border-white/50 relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />

        {/* Document Info Bar */}
        <div className="flex items-center gap-6 mb-10 relative">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <FileIcon className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center border-4 border-white shadow-sm">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Document Ready</h3>
            <p className="text-2xl font-black text-slate-900 truncate leading-none">
              {numPages} <span className="text-slate-400 font-bold uppercase text-[11px] tracking-widest ml-1">Pages Detected</span>
            </p>
          </div>
        </div>

        {/* Voice Selector Section */}
        <div className="mb-10 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Narrator Voice</h4>
            {playingId && (
              <div className="flex gap-0.5 items-end h-3">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-0.5 bg-indigo-500 animate-pulse" style={{ height: `${Math.random() * 100}%` }} />)}
              </div>
            )}
          </div>

          <div className="relative group">
            <button
              type="button"
              onClick={() => setDropdownOpen(o => !o)}
              className="w-full flex items-center justify-between p-5 bg-slate-50/50 hover:bg-white rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all shadow-sm hover:shadow-md group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-inner">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </div>
                <div className="min-w-0 text-left">
                  <div className="text-sm font-black text-slate-900 truncate">
                    {voices.find(v => v.id === selectedVoiceId)?.display_name || voices[0]?.display_name || "Select Voice"}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {(voices.find(v => v.id === selectedVoiceId)?.language_codes || ['English']).join(', ')} • {voices.find(v => v.id === selectedVoiceId)?.ssml_gender || 'Neutral'}
                  </div>
                </div>
              </div>
              <div className={`p-2 rounded-xl transition-colors ${dropdownOpen ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-100 p-3 z-50 max-h-[320px] overflow-auto animate-in fade-in slide-in-from-top-4 duration-300">
                {voicesLoading ? (
                  <div className="p-8 text-center text-slate-400 font-black uppercase text-[10px] tracking-widest animate-pulse">Gathering Narrators...</div>
                ) : (
                  voices.map(v => (
                    <div key={v.id}
                      className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer mb-1 ${selectedVoiceId === v.id ? 'bg-indigo-50 border border-indigo-100 shadow-sm' : 'hover:bg-slate-50 border border-transparent'}`}
                      onClick={() => setSelectedVoiceId(v.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-2 h-2 rounded-full transition-colors ${selectedVoiceId === v.id ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                        <div className="min-w-0">
                          <div className="text-sm font-black text-slate-900 truncate">{v.display_name}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{(v.language_codes || []).join(', ')}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handlePlayPreview(v.id); }}
                          className={`p-2 rounded-xl transition-all ${playingId === v.id ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 shadow-sm'}`}
                        >
                          {previewLoadingId === v.id ? (
                            <div className="w-4 h-4 border-2 border-indigo-500 border-t-white rounded-full animate-spin" />
                          ) : playingId === v.id ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          )}
                        </button>
                        {selectedVoiceId !== v.id && previewed[v.id] && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSelectedVoiceId(v.id); setDropdownOpen(false); }}
                            className="px-3 py-2 text-[9px] font-black uppercase bg-emerald-500 text-white rounded-xl shadow-sm hover:bg-emerald-600 transition-colors"
                          >
                            Use
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Processing Mode Selection */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <button
            type="button"
            onClick={() => setIsFullReview(false)}
            className={`group relative flex flex-col p-6 rounded-[2rem] border-2 transition-all duration-300 text-left ${!isFullReview ? 'bg-indigo-600 border-indigo-600 shadow-2xl shadow-indigo-100 scale-[1.02]' : 'bg-slate-50 border-slate-100 hover:border-indigo-100'}`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-all ${!isFullReview ? 'bg-white/20 text-white' : 'bg-white text-slate-400 shadow-sm group-hover:text-indigo-600'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
            </div>
            {/* Removed Quick Range recommendation badge */}
            <h5 className={`text-xs font-black uppercase tracking-widest mb-1 ${!isFullReview ? 'text-white' : 'text-slate-900'}`}>Quick Range</h5>
            <p className={`text-[10px] leading-relaxed font-medium ${!isFullReview ? 'text-indigo-100' : 'text-slate-500'}`}>Process up to 4 specific pages instantly.</p>
          </button>

          <button
            type="button"
            onClick={() => setIsFullReview(true)}
            className={`group relative flex flex-col p-6 rounded-[2rem] border-2 transition-all duration-300 text-left ${isFullReview ? 'bg-slate-900 border-slate-900 shadow-2xl shadow-slate-200 scale-[1.02]' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-all ${isFullReview ? 'bg-white/10 text-white' : 'bg-white text-slate-400 shadow-sm group-hover:text-slate-900'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div className={`absolute top-4 right-4 text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${isFullReview ? 'bg-white/10 text-white' : 'bg-emerald-100 text-emerald-700'}`}>Recommended</div>
            <h5 className={`text-xs font-black uppercase tracking-widest mb-1 ${isFullReview ? 'text-white' : 'text-slate-900'}`}>Full Document</h5>
            <p className={`text-[10px] leading-relaxed font-medium ${isFullReview ? 'text-slate-400' : 'text-slate-500'}`}>Complete coverage • <span className="text-emerald-500 font-black">No Credits Used</span></p>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {!isFullReview ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
              <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <div className="flex-1 text-center">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Start Page</p>
                  <input
                    type="number"
                    value={startPage}
                    onChange={e => handleStartChange(e.target.value)}
                    className="w-full text-center text-4xl font-black rounded-2xl border-none bg-transparent py-2 text-indigo-600 outline-none focus:ring-0 tabular-nums"
                  />
                </div>
                <div className="h-12 w-px bg-slate-200" />
                <div className="flex-1 text-center">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">End Page</p>
                  <input
                    type="number"
                    value={endPage}
                    onChange={e => handleEndChange(e.target.value)}
                    className="w-full text-center text-4xl font-black rounded-2xl border-none bg-transparent py-2 text-indigo-600 outline-none focus:ring-0 tabular-nums"
                  />
                </div>
              </div>
              <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Quick processing is limited to <span className="text-indigo-600">4 pages</span> per run
              </p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-6">
              <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-16 h-16 text-amber-900" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                </div>

                <h6 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-4">Manual Review Protocol</h6>
                <ul className="space-y-3">
                  {[
                    "Standard processing ensures the highest audio quality.",
                    "Full document narration is FREE for subscribers.",
                    "Review typically begins within 5 minutes.",
                    "You'll receive an email as soon as narration starts."
                  ].map((text, i) => (
                    <li key={i} className="flex gap-3 text-[11px] text-amber-800/80 font-medium">
                      <span className="text-amber-500 flex-shrink-0">•</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {!user?.active_plan_id ? (
                <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-[2rem] flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1">Subscription Required</p>
                    <p className="text-[11px] text-indigo-600 leading-tight">Full document analysis is only available on paid plans.</p>
                  </div>
                </div>
              ) : isOverLimit ? (
                <div className="p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-red-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-red-900 uppercase tracking-widest mb-1">Limit Reached</p>
                    <p className="text-[11px] text-red-600 leading-tight">Your {user?.active_plan_id} plan limit is {userLimit} pages. This document has {numPages} pages.</p>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Pricing Summary */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative shadow-2xl overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[60px] group-hover:bg-indigo-500/30 transition-colors" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Total Estimated Fee</p>
                <p className="text-4xl font-black tabular-nums">
                  {isFullReview ? (
                    <span className="text-emerald-400">FREE</span>
                  ) : (
                    <>
                      {creditCost} <span className="text-xs text-indigo-400">CREDITS</span>
                    </>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Your Balance</p>
                <p className={`text-xl font-black tabular-nums ${!hasEnoughCredits ? 'text-red-400' : 'text-emerald-400'}`}>
                  {user?.credits || 0} <span className="text-[10px] opacity-50">CR</span>
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || (isFullReview && (isOverLimit || !user?.active_plan_id)) || (!isFullReview && !hasEnoughCredits)}
            className={`group w-full py-6 rounded-3xl font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden text-xs shadow-2xl ${isFullReview
              ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
              } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700" />
            <div className="flex items-center justify-center gap-3">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Preparing Documents...</span>
                </>
              ) : (
                <>
                  <span>{isFullReview ? 'Request Full Production' : 'Begin Quick Narration'}</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </div>
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          Narrio uses high-fidelity neural narration engines
        </p>
      </div>
    </div>
  );
}