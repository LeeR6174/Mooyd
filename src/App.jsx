import React, { useState, useMemo, useEffect, useRef } from 'react';
import { actions } from './data/actions';
import { 
  Sparkles, RefreshCw, CheckCircle2, Zap, Smile, Settings, 
  Plus, Trash2, ArrowLeft, X, Edit3, Clock, ChevronRight 
} from 'lucide-react';

const moods = [
  { id: '集中', label: '集中', icon: '🎯' },
  { id: 'リラックス', label: 'リラックス', icon: '🌿' },
  { id: '運動', label: '運動', icon: '🏃' },
  { id: 'ぼーっと', label: 'ぼーっと', icon: '☁️' },
  { id: 'クリエイティブ', label: 'クリエイティブ', icon: '🎨' },
];

function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard', 'result', 'settings'
  const [energy, setEnergy] = useState(50);
  const [selectedMood, setSelectedMood] = useState('リラックス');
  const [recommendation, setRecommendation] = useState(null);
  const [isRerolling, setIsRerolling] = useState(false);
  const [editingAction, setEditingAction] = useState(null);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('mooyd_muted') === 'true';
  });
  
  // Unified actions state (Initial + Custom)
  const [userActions, setUserActions] = useState(() => {
    const saved = localStorage.getItem('mooyd_user_actions');
    return saved ? JSON.parse(saved) : actions; // Use default actions if empty
  });

  // History state
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('mooyd_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist all actions
  useEffect(() => {
    localStorage.setItem('mooyd_user_actions', JSON.stringify(userActions));
  }, [userActions]);

  // Persist history
  useEffect(() => {
    localStorage.setItem('mooyd_history', JSON.stringify(history));
  }, [history]);

  // Persist muted state
  useEffect(() => {
    localStorage.setItem('mooyd_muted', isMuted);
  }, [isMuted]);

  const allActions = useMemo(() => userActions, [userActions]);

  // Sound Effect Helper
  const playSound = (type) => {
    if (isMuted) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    if (type === 'success') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1); // C6
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    } else if (type === 'click') {
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    }
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  };

  const handleSync = () => {
    playSound('click');
    // Energy-based filtering: 
    // Logic: If action has energy range [min, max], check if current energy is within it.
    // Standard heuristic: high energy (>70) allows anything, low energy (<30) restricts high-effort actions.
    const filtered = allActions.filter(a => {
      const moodMatch = a.mood.includes(selectedMood);
      const energyRange = a.energy || [0, 100];
      const energyMatch = energy >= energyRange[0] && energy <= energyRange[1];
      return moodMatch && energyMatch;
    });

    const pool = filtered.length > 0 ? filtered : allActions.filter(a => a.mood.includes(selectedMood));
    const random = pool[Math.floor(Math.random() * pool.length)];
    setRecommendation(random);
    setView('result');
    setTimeout(() => playSound('success'), 500);
  };

  const handleReroll = () => {
    playSound('click');
    setIsRerolling(true);
    setTimeout(() => {
      const filtered = allActions.filter(a => {
        const moodMatch = a.mood.includes(selectedMood);
        const energyRange = a.energy || [0, 100];
        const energyMatch = energy >= energyRange[0] && energy <= energyRange[1];
        return moodMatch && energyMatch && a.id !== recommendation?.id;
      });
      const pool = filtered.length > 0 ? filtered : allActions.filter(a => a.mood.includes(selectedMood) && a.id !== recommendation?.id);
      const random = pool[Math.floor(Math.random() * pool.length)];
      setRecommendation(random);
      setIsRerolling(false);
      playSound('success');
    }, 400);
  };

  const handleDone = () => {
    playSound('click');
    const newEntry = {
      id: Date.now(),
      name: recommendation.name,
      mood: selectedMood,
      energy: energy,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setHistory([newEntry, ...history].slice(0, 5)); // Keep last 5
    setView('dashboard');
  };

  const getEnergyIcon = () => {
    if (energy > 80) return <Zap className="text-amber-400" size={20} fill="currentColor" />;
    if (energy > 40) return <Zap className="text-cyan-400" size={20} />;
    return <Zap className="text-slate-300" size={20} />;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-lg">
        {view === 'dashboard' ? (
          <div className="space-y-6">
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
                <button 
                  onClick={() => { playSound('click'); setView('settings'); }}
                  className="p-3 bg-white rounded-2xl text-slate-400 hover:text-cyan-500 hover:bg-cyan-50 transition-all border border-slate-100 shadow-sm"
                >
                  <Settings size={20} />
                </button>
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
                      onClick={() => { playSound('click'); setSelectedMood(mood.id); }}
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

            {/* History Section */}
            {history.length > 0 && (
              <div className="bg-white/40 backdrop-blur-lg rounded-[2rem] p-6 border border-white/50 animate-in slide-in-from-bottom-4 duration-1000">
                <div className="flex items-center gap-2 mb-4 px-2">
                  <Clock size={16} className="text-slate-400" />
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Activity</h3>
                </div>
                <div className="space-y-2">
                  {history.map((item) => (
                <div className="flex items-center justify-between p-4 bg-white/60 rounded-3xl border border-white/50 group hover:bg-white/90 transition-all duration-500 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 text-xs font-bold shadow-inner">
                          {item.energy}%
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{item.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{item.timestamp}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                            <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">{item.mood}</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-cyan-50 group-hover:text-cyan-400 transition-colors">
                        <CheckCircle2 size={14} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : view === 'result' ? (
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
        ) : (
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-slate-200/60 border border-white/50 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between mb-10">
              <button 
                onClick={() => { playSound('click'); setView('dashboard'); setEditingAction(null); }}
                className="p-3 bg-white rounded-2xl text-slate-400 hover:text-slate-600 transition-all border border-slate-100 shadow-sm"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">{editingAction ? 'Edit Action' : 'Manage Actions'}</h2>
              <button 
                onClick={() => { playSound('click'); setIsMuted(!isMuted); }}
                className={`p-3 rounded-2xl transition-all border shadow-sm ${isMuted ? 'bg-red-50 text-red-400 border-red-100' : 'bg-white text-slate-400 border-slate-100'}`}
              >
                {isMuted ? <X size={20} /> : <Smile size={20} />}
              </button>
            </div>

            {/* Add/Edit Action Form */}
            <div className="relative">
              <AddActionForm 
                initialData={editingAction}
                onAdd={(newAction) => { playSound('success'); setUserActions([newAction, ...userActions]); }}
                onUpdate={(updatedAction) => {
                  playSound('success');
                  setUserActions(userActions.map(a => a.id === updatedAction.id ? updatedAction : a));
                  setEditingAction(null);
                }}
                onCancel={() => { playSound('click'); setEditingAction(null); }}
              />
            </div>

            {/* Actions List */}
            {!editingAction && (
              <div className="mt-12">
                <div className="flex items-center justify-between mb-6 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-cyan-500 rounded-full"></div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Action List</h3>
                  </div>
                  <button 
                    onClick={() => { if(confirm('初期状態に戻しますか？')) setUserActions(actions); }}
                    className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] text-slate-400 hover:text-red-400 hover:bg-red-50 font-bold uppercase transition-all"
                  >
                    Reset
                  </button>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {userActions.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                      <p className="text-slate-400 text-sm">アクションがありません</p>
                    </div>
                  ) : (
                    userActions.map((action) => (
                      <div key={action.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm group hover:border-cyan-200 transition-all">
                        <div>
                          <p className="font-semibold text-slate-700">{action.name}</p>
                          <div className="flex gap-1 mt-1">
                            {action.mood.map(m => (
                              <span key={m} className="text-[10px] bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded-full font-bold">{m}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { playSound('click'); setEditingAction(action); }}
                            className="p-2 text-slate-300 hover:text-cyan-500 hover:bg-cyan-50 rounded-lg transition-all"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={() => { playSound('click'); setUserActions(userActions.filter(a => a.id !== action.id)); }}
                            className="p-2 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AddActionForm({ onAdd, onUpdate, initialData, onCancel }) {
  const [name, setName] = useState('');
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [energyRange, setEnergyRange] = useState([0, 100]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSelectedMoods(initialData.mood);
      setEnergyRange(initialData.energy || [0, 100]);
    } else {
      setName('');
      setSelectedMoods([]);
      setEnergyRange([0, 100]);
    }
  }, [initialData]);

  const toggleMood = (mood) => {
    if (selectedMoods.includes(mood)) {
      setSelectedMoods(selectedMoods.filter(m => m !== mood));
    } else {
      setSelectedMoods([...selectedMoods, mood]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || selectedMoods.length === 0) return;
    
    if (initialData) {
      onUpdate({
        ...initialData,
        name,
        mood: selectedMoods,
        energy: energyRange,
      });
    } else {
      onAdd({
        id: Date.now(),
        name,
        mood: selectedMoods,
        energy: energyRange,
      });
    }
    
    setName('');
    setSelectedMoods([]);
    setEnergyRange([0, 100]);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 shadow-inner">
      <div className="mb-6">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">アクション名</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: スクワット10回"
          className="w-full bg-white border border-slate-100 rounded-2xl py-3 px-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all shadow-sm"
        />
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-3 px-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">推奨エネルギー範囲</label>
          <span className="text-[10px] font-bold text-cyan-600">{energyRange[0]}% - {energyRange[1]}%</span>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <p className="text-[9px] text-slate-400 mb-1 text-center">Min</p>
            <input 
              type="range" min="0" max="100" value={energyRange[0]} 
              onChange={(e) => setEnergyRange([Math.min(parseInt(e.target.value), energyRange[1]), energyRange[1]])}
              className="w-full h-1"
            />
          </div>
          <div className="flex-1">
            <p className="text-[9px] text-slate-400 mb-1 text-center">Max</p>
            <input 
              type="range" min="0" max="100" value={energyRange[1]} 
              onChange={(e) => setEnergyRange([energyRange[0], Math.max(parseInt(e.target.value), energyRange[0])])}
              className="w-full h-1"
            />
          </div>
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">対応する気分（複数選択可）</label>
        <div className="flex flex-wrap gap-2">
          {moods.map((mood) => (
            <button
              key={mood.id}
              type="button"
              onClick={() => toggleMood(mood.id)}
              className={`
                px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border
                ${selectedMoods.includes(mood.id) 
                  ? 'bg-cyan-500 border-cyan-500 text-white shadow-md' 
                  : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}
              `}
            >
              {mood.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {initialData && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-white border border-slate-100 text-slate-400 rounded-2xl py-3 font-bold text-sm hover:bg-slate-50 transition-all"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          disabled={!name || selectedMoods.length === 0}
          className={`flex-[2] bg-cyan-500 text-white rounded-2xl py-3 font-bold text-sm flex items-center justify-center gap-2 hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-100`}
        >
          {initialData ? <CheckCircle2 size={18} /> : <Plus size={18} />}
          {initialData ? '保存する' : '追加する'}
        </button>
      </div>
    </form>
  );
}

export default App;
