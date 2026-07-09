export function ReminderList({ reminders, onComplete }) {
  if (reminders.length === 0) {
    return (
      <div className="empty-state">
        <p>すべてのタスクが完了しました！</p>
      </div>
    );
  }

  return (
    <ul className="reminder-list">
      {reminders.map(reminder => (
        <li key={reminder.id} className="reminder-item">
          <button 
            className="reminder-checkbox" 
            onClick={() => onComplete(reminder.id, reminder.title)}
            aria-label="Complete task"
          >
            <div className="checkbox-inner"></div>
          </button>
          <span className="reminder-title">{reminder.title}</span>
        </li>
      ))}
    </ul>
  );
}
