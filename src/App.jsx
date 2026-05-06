import React, { useState, useMemo } from 'react';
import { actions } from './data/actions';
import { Sparkles, RefreshCw, CheckCircle2, Zap, Smile } from 'lucide-react';

const moods = [
  { id: '集中', label: '集中', icon: '🎯' },
  { id: 'リラックス', label: 'リラックス', icon: '🌿' },
  { id: '運動', label: '運動', icon: '🏃' },
  { id: 'ぼーっと', label: 'ぼーっと', icon: '☁️' },
  { id: 'クリエイティブ', label: 'クリエイティブ', icon: '🎨' },
];

function App() {
  const [view, setView] = useState('dashboard');
  const [energy, setEnergy] = useState(50);
  const [selectedMood, setSelectedMood] = useState('リラックス');
  const [recommendation, setRecommendation] = useState(null);
  const [isRerolling, setIsRerolling] = useState(false);

  const getEnergyIcon = () => {
    if (energy > 80) return <Zap className="text-amber-400" size={20} fill="currentColor" />;
    if (energy > 40) return <Zap className="text-cyan-400" size={20} />;
    return <Zap className="text-slate-300" size={20} />;
  };

  const handleSync = () => {
    // Simple gacha logic: filter by mood, then random pick
    const filtered = actions.filter(a => a.mood.includes(selectedMood));
    const pool = filtered.length > 0 ? filtered : actions;
    const random = pool[Math.floor(Math.random() * pool.length)];
    setRecommendation(random);
    setView('result');
  };

  const handleReroll = () => {
    setIsRerolling(true);
    setTimeout(() => {
      const filtered = actions.filter(a => a.mood.includes(selectedMood) && a.id !== recommendation?.id);
      const pool = filtered.length > 0 ? filtered : actions;
      const random = pool[Math.floor(Math.random() * pool.length)];
      setRecommendation(random);
      setIsRerolling(false);
    }, 400);
  };

  const handleDone = () => {
    setView('dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-lg">
        {view === 'dashboard' ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-slate-200/60 border border-white/50 animate-in fade-in zoom-in-95 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-cyan-200">
                  <Smile size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Mooyd</h1>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Personal Sync</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Status</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs font-semibold text-slate-500">Online</span>
                </div>
              </div>
            </div>

            {/* Energy Input */}
            <div className="mb-12 group">
              <div className="flex justify-between items-end mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-cyan-50 transition-colors">
                    {getEnergyIcon()}
                  </div>
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Energy</label>
                </div>
                <span className="text-4xl font-light text-slate-800 tabular-nums">
                  {energy}<span className="text-lg text-cyan-500 font-medium ml-0.5">%</span>
                </span>
              </div>
              <div className="relative h-8 flex items-center">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={energy} 
                  onChange={(e) => setEnergy(parseInt(e.target.value))}
                  className="w-full relative z-10"
                />
                <div className="absolute inset-x-0 h-2 bg-slate-100 rounded-full"></div>
                <div 
                  className="absolute left-0 h-2 bg-gradient-to-r from-cyan-300 to-cyan-500 rounded-full transition-all duration-300"
                  style={{ width: `${energy}%` }}
                ></div>
              </div>
            </div>

            {/* Mood Grid */}
            <div className="mb-12">
              <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 px-1">Current Mood</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`
                      relative overflow-hidden py-4 px-4 rounded-3xl text-sm font-semibold transition-all duration-300 border-2
                      ${selectedMood === mood.id 
                        ? 'bg-cyan-500 border-cyan-500 text-white shadow-xl shadow-cyan-200 -translate-y-1' 
                        : 'bg-white border-slate-100 text-slate-500 hover:border-cyan-200 hover:bg-slate-50 active:scale-95'}
                    `}
                  >
                    <div className="flex flex-col items-center gap-2 relative z-10">
                      <span className="text-2xl">{mood.icon}</span>
                      <span>{mood.label}</span>
                    </div>
                    {selectedMood === mood.id && (
                      <div className="absolute top-0 right-0 p-1">
                        <CheckCircle2 size={14} className="text-white/80" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sync Button */}
            <button
              onClick={handleSync}
              className="w-full bg-slate-900 text-white rounded-[2rem] py-5 px-6 font-bold text-lg flex items-center justify-center gap-3 shadow-2xl shadow-slate-300 hover:bg-cyan-600 hover:shadow-cyan-200 hover:-translate-y-1 active:scale-[0.98] transition-all duration-500 group"
            >
              <Sparkles size={22} className="group-hover:rotate-12 transition-transform" />
              今を同期する
            </button>
          </div>
        ) : (
          <div className={`flex flex-col items-center transition-all duration-500 ${isRerolling ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-slate-200 border border-slate-100 text-center w-full animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-[2.5rem] flex items-center justify-center text-cyan-600 mx-auto mb-10 shadow-inner">
                <Zap size={40} fill="currentColor" className="opacity-80" />
              </div>
              
              <div className="mb-12">
                <p className="text-xs font-bold text-cyan-500 uppercase tracking-[0.3em] mb-4">Perfect Action for You</p>
                <h2 className="text-4xl font-bold text-slate-800 leading-tight">
                  {recommendation?.name}
                </h2>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={handleDone}
                  className="w-full bg-slate-900 text-white rounded-3xl py-5 px-8 font-bold text-lg flex items-center justify-center gap-3 hover:bg-cyan-600 shadow-xl shadow-slate-200 transition-all duration-300 active:scale-95 group"
                >
                  <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform" />
                  完了する
                </button>
                
                <button
                  onClick={handleReroll}
                  disabled={isRerolling}
                  className="w-full bg-transparent text-slate-400 rounded-3xl py-4 px-8 font-semibold hover:bg-slate-50 hover:text-slate-600 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  <RefreshCw size={20} className={`${isRerolling ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                  他の提案を見る
                </button>
              </div>
            </div>
            
            <div className="mt-10 flex items-center gap-2 px-6 py-2 bg-white rounded-full shadow-sm border border-slate-100 animate-bounce">
              <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">New</span>
              <p className="text-slate-400 text-[11px] font-medium tracking-wide">
                今の気分に合わせて最適化されました
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
