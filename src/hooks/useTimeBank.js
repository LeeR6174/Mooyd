import { useState, useEffect, useRef, useCallback } from 'react';

// Play an alarm sound using the Web Audio API
const playAlarm = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
  osc.frequency.setValueAtTime(440, ctx.currentTime + 0.4);
  osc.frequency.setValueAtTime(880, ctx.currentTime + 0.6);
  osc.frequency.setValueAtTime(440, ctx.currentTime + 0.8);
  osc.frequency.setValueAtTime(880, ctx.currentTime + 1.0);

  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 1.5);
};

export function useTimeBank() {
  const [bankedTime, setBankedTime] = useState(() => {
    const saved = localStorage.getItem('timeBank_bankedTime');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('timeBank_coins');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('timeBank_records');
    return saved ? JSON.parse(saved) : [];
  });

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('timeBank_profile');
    return saved ? JSON.parse(saved) : {
      title: 'Beginner',
      icon: '👤',
      theme: 'default',
      unlocked: ['title_Beginner', 'icon_👤', 'theme_default']
    };
  });

  const [studyActive, setStudyActive] = useState(false);
  const [studyElapsed, setStudyElapsed] = useState(0);
  const [entertainActive, setEntertainActive] = useState(false);

  const wakeLockRef = useRef(null);

  // Allow requesting notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Save banked time to local storage
  useEffect(() => {
    localStorage.setItem('timeBank_bankedTime', bankedTime.toString());
  }, [bankedTime]);

  useEffect(() => {
    localStorage.setItem('timeBank_coins', coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem('timeBank_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('timeBank_profile', JSON.stringify(profile));
  }, [profile]);

  const triggerAlarm = useCallback(() => {
    playAlarm();
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Time Bank', {
        body: '娯楽の時間が終了しました！',
        icon: '/icon-512.png',
      });
    }
  }, []);

  // Study timer effect
  useEffect(() => {
    let interval = null;
    let lastTick = Date.now();
    if (studyActive) {
      interval = setInterval(() => {
        const now = Date.now();
        const delta = Math.floor((now - lastTick) / 1000);
        if (delta > 0) {
          setStudyElapsed(prev => prev + delta);
          setBankedTime(prev => prev + delta); // Real-time increment
          setCoins(prev => prev + delta); // Add coins
          lastTick += delta * 1000;
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [studyActive]);

  // Entertain timer effect
  useEffect(() => {
    let interval = null;
    let lastTick = Date.now();
    if (entertainActive) {
      interval = setInterval(() => {
        const now = Date.now();
        const delta = Math.floor((now - lastTick) / 1000);
        if (delta > 0) {
          setBankedTime(prev => {
            const newTime = prev - delta;
            if (newTime <= 0) {
              setEntertainActive(false);
              if (wakeLockRef.current) {
                wakeLockRef.current.release().catch(() => {});
                wakeLockRef.current = null;
              }
              triggerAlarm();
              return 0;
            }
            return newTime;
          });
          lastTick += delta * 1000;
        }
      }, 1000);
    } else {
      clearInterval(interval);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    }
    return () => clearInterval(interval);
  }, [entertainActive, triggerAlarm]);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch (err) {
      console.warn('Wake Lock error:', err);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
  };

  const startStudy = () => {
    if (!studyActive) {
      if (entertainActive) setEntertainActive(false);
      setStudyActive(true);
      requestWakeLock();
    }
  };

  const pauseStudy = () => {
    if (studyActive) {
      setStudyActive(false);
      releaseWakeLock();
    }
  };

  const stopStudy = () => {
    if (studyElapsed > 0) {
      setRecords(prev => [...prev, {
        id: Date.now(),
        date: new Date().toISOString(),
        duration: studyElapsed
      }]);
    }
    setStudyActive(false);
    setStudyElapsed(0);
    releaseWakeLock();
  };

  const startEntertain = () => {
    if (!entertainActive) {
      if (bankedTime <= 0) return;
      if (studyActive) pauseStudy();
      
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        ctx.resume();
      }

      const shortcutUrl = `shortcuts://run-shortcut?name=${encodeURIComponent('タイマーセット')}&input=${bankedTime}`;
      window.location.href = shortcutUrl;

      requestWakeLock();
      setEntertainActive(true);
    }
  };

  const pauseEntertain = () => {
    if (entertainActive) {
      setEntertainActive(false);
      releaseWakeLock();
    }
  };

  const stopEntertain = () => {
    setEntertainActive(false);
    releaseWakeLock();
  };

  const buyItem = (item) => {
    if (coins >= item.price && !profile.unlocked.includes(item.id)) {
      setCoins(prev => prev - item.price);
      setProfile(prev => ({
        ...prev,
        unlocked: [...prev.unlocked, item.id]
      }));
      return true; // Success
    }
    return false; // Failed
  };

  const equipItem = (type, value) => {
    setProfile(prev => ({
      ...prev,
      [type]: value
    }));
  };

  return {
    bankedTime,
    coins,
    records,
    profile,
    studyActive,
    studyElapsed,
    entertainActive,
    startStudy,
    pauseStudy,
    stopStudy,
    startEntertain,
    pauseEntertain,
    stopEntertain,
    buyItem,
    equipItem,
  };
}

