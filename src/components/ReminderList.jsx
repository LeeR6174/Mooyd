import { PartyPopper, Check, Trash2 } from 'lucide-react';

export function ReminderList({ reminders, onToggleComplete, onDelete }) {
  if (reminders.length === 0) {
    return (
      <div className="empty-state">
        <PartyPopper size={48} className="empty-state-icon" />
        <p>やりたいことリストが空です！</p>
        <span className="empty-state-sub">新しいやりたいことを追加してみましょう✨</span>
      </div>
    );
  }

  return (
    <ul className="reminder-list">
      {reminders.map(reminder => (
        <li key={reminder.id} className={`reminder-item ${reminder.completed ? 'completed' : ''}`}>
          <button 
            className={`reminder-checkbox ${reminder.completed ? 'checked' : ''}`} 
            onClick={() => onToggleComplete(reminder.id)}
            aria-label={reminder.completed ? "Mark as uncompleted" : "Mark as completed"}
          >
            <div className="checkbox-inner">
              {reminder.completed && <Check size={16} strokeWidth={3} className="check-icon-anim" />}
            </div>
          </button>
          <span className="reminder-title">{reminder.title}</span>
          <button
            className="delete-btn"
            onClick={() => onDelete(reminder.id)}
            aria-label="Delete item"
            title="削除"
          >
            <Trash2 size={18} />
          </button>
        </li>
      ))}
    </ul>
  );
}
