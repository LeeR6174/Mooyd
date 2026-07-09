import { useState } from 'react';
import { Plus } from 'lucide-react';

export function ReminderInput({ onAdd }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim());
      setText('');
    }
  };

  return (
    <form className="reminder-input-form" onSubmit={handleSubmit}>
      <Plus className="plus-icon" size={20} />
      <input
        type="text"
        placeholder="新規リマインダー"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="reminder-input"
      />
    </form>
  );
}
