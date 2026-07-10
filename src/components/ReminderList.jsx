import { useState } from 'react';
import { PartyPopper, Check } from 'lucide-react';

export function ReminderList({ reminders, onComplete }) {
  const [completingIds, setCompletingIds] = useState([]);

  const handleComplete = (id, title) => {
    if (completingIds.includes(id)) return;
    
    setCompletingIds(prev => [...prev, id]);
    
    // Add a slight delay so the user can see the checkmark animation
    setTimeout(() => {
      onComplete(id, title);
      setCompletingIds(prev => prev.filter(cId => cId !== id));
    }, 400);
  };

  if (reminders.length === 0) {
    return (
      <div className="empty-state">
        <PartyPopper size={48} className="empty-state-icon" />
        <p>すべてのタスクが完了しました！</p>
        <span className="empty-state-sub">今日も一日お疲れ様です✨</span>
      </div>
    );
  }

  return (
    <ul className="reminder-list">
      {reminders.map(reminder => {
        const isCompleting = completingIds.includes(reminder.id);
        return (
          <li key={reminder.id} className={`reminder-item ${isCompleting ? 'completing' : ''}`}>
            <button 
              className={`reminder-checkbox ${isCompleting ? 'checked' : ''}`} 
              onClick={() => handleComplete(reminder.id, reminder.title)}
              aria-label="Complete task"
              disabled={isCompleting}
            >
              <div className="checkbox-inner">
                {isCompleting && <Check size={16} strokeWidth={3} className="check-icon-anim" />}
              </div>
            </button>
            <span className="reminder-title">{reminder.title}</span>
          </li>
        );
      })}
    </ul>
  );
}
