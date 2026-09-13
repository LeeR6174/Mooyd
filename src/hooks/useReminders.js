import { useState, useEffect } from 'react';

export function useReminders(addCoins) {
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('mooyd_reminders');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'やりたいことを1つ登録してみる', completed: false }
    ];
  });

  useEffect(() => {
    localStorage.setItem('mooyd_reminders', JSON.stringify(reminders));
  }, [reminders]);

  const addReminder = (title) => {
    if (!title.trim()) return;
    const newReminder = {
      id: Date.now().toString(),
      title: title.trim(),
      completed: false
    };
    setReminders(prev => [newReminder, ...prev]);
  };

  const toggleComplete = (id) => {
    setReminders(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !item.completed;
        if (nextState && typeof addCoins === 'function') {
          addCoins(10); // Reward coins when checking off a task
        }
        return { ...item, completed: nextState };
      }
      return item;
    }));
  };

  const deleteReminder = (id) => {
    setReminders(prev => prev.filter(item => item.id !== id));
  };

  return {
    reminders,
    addReminder,
    toggleComplete,
    deleteReminder,
    setReminders
  };
}
