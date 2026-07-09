import { useState, useEffect } from 'react';

export function useReminders(addCoins) {
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('mooyd_reminders');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'ショートカットの設定をする', completed: false }
    ];
  });

  // Handle incoming rewards from Shortcut via URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reward = params.get('reward');
    const completedId = params.get('completed');

    if (reward) {
      addCoins(parseInt(reward, 10));
      if (completedId) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setReminders(prev => prev.filter(r => r.id !== completedId));
      }
      // Remove query params to prevent double reward on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Optional: Play a sound or show a toast here for the coin reward
    }
  }, [addCoins]);

  useEffect(() => {
    localStorage.setItem('mooyd_reminders', JSON.stringify(reminders));
  }, [reminders]);

  const addReminder = (title) => {
    const newId = Date.now().toString();
    const newReminder = { id: newId, title, completed: false };
    setReminders(prev => [...prev, newReminder]);
    
    // Trigger iOS Shortcut for adding
    const encodedTitle = encodeURIComponent(title);
    window.location.href = `shortcuts://run-shortcut?name=AddMooydTask&input=${encodedTitle}`;
  };

  const completeReminder = (id, title) => {
    // Optimistic UI update
    setReminders(prev => prev.filter(r => r.id !== id));
    
    // Construct the callback URL
    // In dev, this is http://localhost:5173/
    const callbackUrl = encodeURIComponent(`${window.location.origin}${window.location.pathname}?reward=10&completed=${id}`);
    const encodedTitle = encodeURIComponent(title);
    
    // x-callback-url allows returning to the app
    window.location.href = `shortcuts://x-callback-url/run-shortcut?name=CompleteMooydTask&input=${encodedTitle}&x-success=${callbackUrl}`;
  };

  return {
    reminders,
    addReminder,
    completeReminder,
    setReminders
  };
}
