import React, { useState, useMemo, useEffect, useRef } from 'react';
import { actions } from './data/actions';
import { 
  Sparkles, RefreshCw, CheckCircle2, Zap, Smile, Settings, 
  Plus, Trash2, ArrowLeft, X, Edit3, Clock, ChevronRight, LayoutGrid, Heart
} from 'lucide-react';

const defaultMoods = [
  { id: '集中', label: '集中', icon: '🎯' },
  { id: 'リラックス', label: 'リラックス', icon: '🌿' },
  { id: '運動', label: '運動', icon: '🏃' },
  { id: 'クリエイティブ', label: 'クリエイティブ', icon: '🎨' },
];

function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard', 'result', 'settings'
  const [selectedMood, setSelectedMood] = useState('リラックス');
  const [recommendation, setRecommendation] = useState(null);
  const [isRerolling, setIsRerolling] = useState(false);
  const [editingAction, setEditingAction] = useState(null);
  const [editingMood, setEditingMood] = useState(null);
  const [isTestMode, setIsTestMode] = useState(() => {
    return localStorage.getItem('mooyd_test_mode') === 'true';
  });
  const [dailyRerolls, setDailyRerolls] = useState(() => {
    const saved = localStorage.getItem('mooyd_daily_rerolls');
    const today = new Date().toLocaleDateString();
    const data = saved ? JSON.parse(saved) : {};
    return data[today] || 0;
  });
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('mooyd_muted') === 'true';
  });
  const [dailyStats, setDailyStats] = useState(() => {
    const saved = localStorage.getItem('mooyd_daily_stats');
    return saved ? JSON.parse(saved) : {};
  });
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  // Unified actions state
  const [userActions, setUserActions] = useState(() => {
    const saved = localStorage.getItem('mooyd_user_actions');
    return saved ? JSON.parse(saved) : actions;
  });

  // Unified moods state
  const [userMoods, setUserMoods] = useState(() => {
    const saved = localStorage.getItem('mooyd_user_moods');
    return saved ? JSON.parse(saved) : defaultMoods;
  });

  // History state
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('mooyd_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist all data
  useEffect(() => {
    localStorage.setItem('mooyd_user_actions', JSON.stringify(userActions));
  }, [userActions]);

  useEffect(() => {
    localStorage.setItem('mooyd_user_moods', JSON.stringify(userMoods));
  }, [userMoods]);

  useEffect(() => {
    localStorage.setItem('mooyd_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('mooyd_muted', isMuted);
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem('mooyd_test_mode', isTestMode);
  }, [isTestMode]);

  useEffect(() => {
    const today = new Date().toLocaleDateString();
    localStorage.setItem('mooyd_daily_rerolls', JSON.stringify({ [today]: dailyRerolls }));
  }, [dailyRerolls]);


  useEffect(() => {
    localStorage.setItem('mooyd_daily_stats', JSON.stringify(dailyStats));
  }, [dailyStats]);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      if (window.navigator.vibrate) {
        window.navigator.vibrate([200, 100, 200]);
      }
      playSound('success');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const allActions = useMemo(() => {
    if (isTestMode) {
      return [
        { id: 't1', name: 'テスト用アクション (5分)', mood: userMoods.map(m => m.id), duration: 5 },
        { id: 't2', name: 'テスト用アクション (10分)', mood: userMoods.map(m => m.id), duration: 10 },
        { id: 't3', name: 'テスト用アクション (15分)', mood: userMoods.map(m => m.id), duration: 15 },
      ];
    }
    return userActions;
  }, [userActions, isTestMode, userMoods]);

  // Sound Effect Helper
  const playSound = (type) => {
    if (isMuted) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1);
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
    } catch (e) { console.error(e); }
  };

  const getWeightedRandom = (pool) => {
    if (pool.length === 0) return null;
    const totalWeight = pool.reduce((sum, a) => sum + (a.weight || 1.0), 0);
    let random = Math.random() * totalWeight;
    for (const action of pool) {
      random -= (action.weight || 1.0);
      if (random <= 0) return action;
    }
    return pool[0];
  };

  const handleSync = () => {
    playSound('click');
    const pool = allActions.filter(a => a.mood.includes(selectedMood));
    const random = getWeightedRandom(pool);
    setRecommendation(random);
    setTimeLeft((random?.duration || 0) * 60);
    setIsTimerRunning(false);
    setView('result');
    setTimeout(() => playSound('success'), 500);
  };

  const handleReroll = () => {
    if (!isTestMode && dailyRerolls >= 3) {
      alert('1日の引き直し制限（3回）に達しました。');
      return;
    }
    playSound('click');
    setIsRerolling(true);
    setTimeout(() => {
      const pool = allActions.filter(a => a.mood.includes(selectedMood) && a.id !== recommendation?.id);
      const random = getWeightedRandom(pool);
      setRecommendation(random);
      setTimeLeft((random?.duration || 0) * 60);
      setIsTimerRunning(false);
      setIsRerolling(false);
      if (!isTestMode) setDailyRerolls(prev => prev + 1);
      playSound('success');
    }, 400);
  };

  const handleDone = (rating) => {
    playSound('click');
    const today = new Date().toLocaleDateString();
    const newEntry = {
      id: Date.now(),
      name: recommendation.name,
      mood: selectedMood,
      rating: rating,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setHistory([newEntry, ...history].slice(0, 5));
    const ratingMultipliers = { '🥉': 0.5, '🥈': 1.1, '🥇': 1.5 };
    const multiplier = ratingMultipliers[rating] || 1;

    setUserActions(userActions.map(a => {
      if (a.id === recommendation.id) {
        const currentWeight = a.weight || 1.0;
        const newWeight = Math.min(Math.max(currentWeight * multiplier, 0.1), 5.0);
        return { ...a, weight: newWeight };
      }
      return a;
    }));

    setDailyStats(prev => ({
      ...prev,
      [today]: (prev[today] || 0) + 1
    }));
    setView('dashboard');
    setIsTimerRunning(false);
    setTimeLeft(0);
  };


  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="w-full max-w-[440px] pt-4 sm:pt-0">
        {view === 'dashboard' ? (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-7 sm:p-9 shadow-2xl shadow-slate-200/60 border border-white/50 animate-in fade-in zoom-in-95 duration-700">
              <div className="flex items-center justify-between mb-10">
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


              <div className="mb-10">
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 px-1">Current Mood</label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {userMoods.map((mood) => (
                    <button
                      key={mood.id}
                      onClick={() => { playSound('click'); setSelectedMood(mood.id); }}
                      className={`relative overflow-hidden py-4 px-3 rounded-3xl text-sm font-semibold transition-all duration-300 border-2
                        ${selectedMood === mood.id 
                          ? 'bg-cyan-500 border-cyan-500 text-white shadow-xl shadow-cyan-200 -translate-y-1' 
                          : 'bg-white border-slate-100 text-slate-500 hover:border-cyan-200 hover:bg-slate-50 active:scale-95'}
                      `}
                    >
                      <div className="flex flex-col items-center gap-1.5 relative z-10">
                        <span className="text-2xl">{mood.icon}</span>
                        <span className="truncate w-full px-1">{mood.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleSync} className="w-full bg-slate-900 text-white rounded-[2rem] py-5 px-6 font-bold text-lg flex items-center justify-center gap-3 shadow-2xl shadow-slate-300 hover:bg-cyan-600 transition-all duration-500 group">
                <Sparkles size={22} className="group-hover:rotate-12 transition-transform" />
                今を同期する
              </button>
            </div>

            <ProductivityChart data={dailyStats} />

            {history.length > 0 && (
              <div className="bg-white/40 backdrop-blur-lg rounded-[2rem] p-6 border border-white/50 animate-in slide-in-from-bottom-4 duration-1000">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" />
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Activity</h3>
                  </div>
                  <button onClick={() => { if(confirm('履歴を削除しますか？')) setHistory([]); }} className="text-[10px] font-bold text-slate-300 hover:text-red-400 uppercase tracking-widest transition-colors">Clear</button>
                </div>
                <div className="space-y-2">
                  {history.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-white/60 rounded-3xl border border-white/50 group hover:bg-white/90 transition-all duration-500 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-cyan-50 rounded-2xl flex items-center justify-center shadow-inner">
                          {item.rating ? <span className="text-xl">{item.rating}</span> : <CheckCircle2 size={20} className="text-cyan-600" />}
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
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : view === 'result' ? (
          <div className={`flex flex-col items-center transition-all duration-500 ${isRerolling ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="bg-white rounded-[3rem] p-10 sm:p-12 shadow-2xl shadow-slate-200 border border-slate-100 text-center w-full animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-[2.5rem] flex items-center justify-center text-cyan-600 mx-auto mb-8 shadow-inner">
                <Zap size={40} fill="currentColor" className="opacity-80" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 leading-tight mb-8">{recommendation?.name}</h2>
              
              {recommendation?.duration > 0 && (
                <div className="mb-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="text-5xl font-light text-slate-800 tabular-nums mb-4">
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </div>
                  <button 
                    onClick={() => { playSound('click'); setIsTimerRunning(!isTimerRunning); }}
                    className={`px-8 py-2.5 rounded-2xl text-xs font-bold border transition-all tracking-widest ${isTimerRunning ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white text-cyan-600 border-cyan-100 shadow-sm'}`}
                  >
                    {isTimerRunning ? 'PAUSE' : 'START TIMER'}
                  </button>
                </div>
              )}

              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">How was it?</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { rating: 1, icon: '🥉', label: 'まあまあ' },
                      { rating: 2, icon: '🥈', label: 'いい感じ' },
                      { rating: 3, icon: '🥇', label: '最高！' }
                    ].map((item) => (
                      <button 
                        key={item.rating}
                        onClick={() => handleDone(item.icon)}
                        className="bg-white border border-slate-100 rounded-[2rem] p-5 hover:border-cyan-500 hover:bg-cyan-50 transition-all group shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col items-center gap-2"
                      >
                        <span className="text-3xl group-hover:scale-125 transition-transform">{item.icon}</span>
                        <span className="text-[10px] font-bold text-slate-400 tracking-tight">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={handleReroll} disabled={isRerolling} className="w-full bg-transparent text-slate-400 rounded-3xl py-4 px-8 font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group">
                  <RefreshCw size={20} className={`${isRerolling ? 'animate-spin' : 'group-hover:rotate-180 transition-transform'}`} /> 他の提案を見る
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-7 sm:p-9 shadow-2xl shadow-slate-200/60 border border-white/50 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between mb-10">
              <button onClick={() => { playSound('click'); setView('dashboard'); setEditingAction(null); setEditingMood(null); }} className="p-3 bg-white rounded-2xl text-slate-400 border border-slate-100 shadow-sm"><ArrowLeft size={20} /></button>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Settings</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => { playSound('click'); setIsTestMode(!isTestMode); }} 
                  className={`p-3 rounded-2xl border shadow-sm transition-all ${isTestMode ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-white text-slate-400 border-slate-100'}`}
                  title="Test Mode"
                >
                  <Sparkles size={20} fill={isTestMode ? "currentColor" : "none"} />
                </button>
                <button onClick={() => { playSound('click'); setIsMuted(!isMuted); }} className={`p-3 rounded-2xl border shadow-sm ${isMuted ? 'bg-red-50 text-red-400 border-red-100' : 'bg-white text-slate-400 border-slate-100'}`}>{isMuted ? <X size={20} /> : <Smile size={20} />}</button>
              </div>
            </div>

            <div className="space-y-12">
              {/* Mood Management */}
              <section>
                <div className="flex items-center justify-between mb-6 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-cyan-500 rounded-full"></div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Manage Moods</h3>
                  </div>
                </div>
                <AddMoodForm 
                  initialData={editingMood}
                  onAdd={(newMood) => setUserMoods([...userMoods, newMood])}
                  onUpdate={(updatedMood) => {
                    setUserMoods(userMoods.map(m => m.id === updatedMood.id ? updatedMood : m));
                    setEditingMood(null);
                  }}
                  onCancel={() => setEditingMood(null)}
                />
                {!editingMood && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {userMoods.map(mood => (
                      <div key={mood.id} className="flex items-center gap-2 bg-white border border-slate-100 px-3 py-2 rounded-2xl shadow-sm group">
                        <span className="text-lg">{mood.icon}</span>
                        <span className="text-xs font-bold text-slate-700">{mood.label}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingMood(mood)} className="text-slate-300 hover:text-cyan-500"><Edit3 size={12} /></button>
                          <button onClick={() => {
                            setUserMoods(userMoods.filter(m => m.id !== mood.id));
                            setUserActions(userActions.map(a => ({
                              ...a,
                              mood: a.mood.filter(m => m !== mood.id)
                            })));
                          }} className="text-slate-300 hover:text-red-400"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Action Management */}
              {!editingMood && (
                <section>
                  <div className="flex items-center justify-between mb-6 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-cyan-500 rounded-full"></div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Manage Actions</h3>
                    </div>
                    <button onClick={() => { if(confirm('全てリセットしますか？')) { setUserActions(actions); setUserMoods(defaultMoods); } }} className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] text-slate-400 font-bold uppercase">Reset All</button>
                  </div>
                  <AddActionForm 
                    moods={userMoods}
                    initialData={editingAction}
                    onAdd={(newAction) => setUserActions([newAction, ...userActions])}
                    onUpdate={(updatedAction) => {
                      setUserActions(userActions.map(a => a.id === updatedAction.id ? updatedAction : a));
                      setEditingAction(null);
                    }}
                    onCancel={() => setEditingAction(null)}
                  />
                  {!editingAction && (
                    <div className="space-y-3 mt-6 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                      {userActions.map(action => (
                        <div key={action.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 group hover:border-cyan-200 transition-all">
                          <div>
                            <p className="font-semibold text-slate-700 text-sm">{action.name}</p>
                            <div className="flex gap-1 mt-1">
                              {action.mood.map(m => (
                                <span key={m} className="text-[9px] bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded-full font-bold">{m}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingAction(action)} className="p-2 text-slate-300 hover:text-cyan-500"><Edit3 size={16} /></button>
                            <button onClick={() => setUserActions(userActions.filter(a => a.id !== action.id))} className="p-2 text-slate-300 hover:text-red-400"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AddMoodForm({ onAdd, onUpdate, initialData, onCancel }) {
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('✨');

  useEffect(() => {
    if (initialData) { setLabel(initialData.label); setIcon(initialData.icon); }
    else { setLabel(''); setIcon('✨'); }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!label) return;
    if (initialData) onUpdate({ ...initialData, label, icon });
    else onAdd({ id: label, label, icon });
    setLabel(''); setIcon('✨');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input type="text" value={icon} onChange={e => setIcon(e.target.value)} className="w-12 bg-white border border-slate-100 rounded-xl p-2 text-center" placeholder="Icon" />
      <input type="text" value={label} onChange={e => setLabel(e.target.value)} className="flex-1 bg-white border border-slate-100 rounded-xl px-4 text-sm" placeholder="Mood Name (e.g. Focus)" />
      <button type="submit" className="bg-cyan-500 text-white p-2 rounded-xl"><Plus size={20} /></button>
      {initialData && <button type="button" onClick={onCancel} className="bg-slate-100 text-slate-400 p-2 rounded-xl"><X size={20} /></button>}
    </form>
  );
}

function AddActionForm({ onAdd, onUpdate, initialData, onCancel, moods }) {
  const [name, setName] = useState('');
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (initialData) { setName(initialData.name); setSelectedMoods(initialData.mood); setDuration(initialData.duration || 0); }
    else { setName(''); setSelectedMoods([]); setDuration(0); }
  }, [initialData]);

  const toggleMood = (mood) => {
    if (selectedMoods.includes(mood)) setSelectedMoods(selectedMoods.filter(m => m !== mood));
    else setSelectedMoods([...selectedMoods, mood]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || selectedMoods.length === 0) return;
    const data = { id: initialData?.id || Date.now(), name, mood: selectedMoods, duration };
    if (initialData) onUpdate(data); else onAdd(data);
    setName(''); setSelectedMoods([]); setDuration(0);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
      <div className="mb-4">
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Action Name" className="w-full bg-white border border-slate-100 rounded-xl py-2 px-4 text-sm" />
      </div>
      <div className="mb-6">
        <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest px-1">Duration</label>
        <div className="flex gap-2">
          {[0, 5, 10, 15].map(d => (
            <button key={d} type="button" onClick={() => setDuration(d)} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${duration === d ? 'bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-100' : 'bg-white border-slate-100 text-slate-400 hover:border-cyan-100'}`}>
              {d === 0 ? 'None' : `${d}m`}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-6">
        {moods.map(mood => (
          <button key={mood.id} type="button" onClick={() => toggleMood(mood.id)} className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${selectedMoods.includes(mood.id) ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>{mood.label}</button>
        ))}
      </div>
      <button type="submit" className="w-full bg-cyan-500 text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2"><Plus size={16} /> {initialData ? 'Update' : 'Add'}</button>
    </form>
  );
}

function ProductivityChart({ data }) {
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString();
  });

  const values = last7Days.map(date => data[date] || 0);
  const maxVal = Math.max(...values, 5); 
  
  const width = 300;
  const height = 100;
  const padding = 20;

  const points = values.map((val, i) => {
    const x = padding + (i * (width - 2 * padding) / (values.length - 1));
    const y = height - padding - (val / maxVal * (height - 2 * padding));
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white/40 backdrop-blur-lg rounded-[2.5rem] p-8 border border-white/50 animate-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center gap-2 mb-8 px-2">
        <LayoutGrid size={16} className="text-slate-400" />
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Activity Flow</h3>
      </div>
      <div className="relative h-[100px] w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`M ${padding},${height-padding} L ${points} L ${width-padding},${height-padding} Z`}
            fill="url(#lineGradient)"
          />
          <polyline
            fill="none"
            stroke="#0891b2"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
          {values.map((val, i) => {
             const x = padding + (i * (width - 2 * padding) / (values.length - 1));
             const y = height - padding - (val / maxVal * (height - 2 * padding));
             return (
               <g key={i}>
                 <circle cx={x} cy={y} r="5" fill="#0891b2" className="drop-shadow-md" />
                 {val > 0 && <text x={x} y={y - 12} textAnchor="middle" className="text-[10px] font-bold fill-cyan-600">{val}</text>}
               </g>
             );
          })}
        </svg>
      </div>
      <div className="flex justify-between mt-4 px-2">
        {last7Days.map((date, i) => {
          const [month, day] = date.split('/').slice(1, 3);
          return (
            <span key={i} className={`text-[8px] font-bold uppercase tracking-tighter ${i === 6 ? 'text-cyan-500' : 'text-slate-300'}`}>
              {i === 6 ? 'Today' : `${month}/${day}`}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default App;
