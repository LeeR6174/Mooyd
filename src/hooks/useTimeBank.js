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

  const toggleStudy = () => {
    if (!studyActive) {
      if (entertainActive) setEntertainActive(false);
      setStudyElapsed(0);
      setStudyActive(true);
      requestWakeLock(); // Keep screen on during study
    } else {
      setStudyActive(false);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    }
  };

  const toggleEntertain = () => {
    if (!entertainActive) {
      if (bankedTime <= 0) return;
      if (studyActive) setStudyActive(false);
      
      // Initialize Audio Context on user interaction
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        ctx.resume();
      }

      // iOSショートカット連携 (提案2)
      // 「タイマーセット」という名前のショートカットを起動し、秒数を渡す
      const shortcutUrl = `shortcuts://run-shortcut?name=${encodeURIComponent('タイマーセット')}&input=${bankedTime}`;
      window.location.href = shortcutUrl;

      requestWakeLock();

      setEntertainActive(true);
    } else {
      setEntertainActive(false);
    }
  };

  return {
    bankedTime,
    studyActive,
    studyElapsed,
    entertainActive,
    toggleStudy,
    toggleEntertain,
  };
}
