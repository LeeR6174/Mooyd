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
    <div className="reminder-input-wrapper">
      <form className="reminder-input-form" onSubmit={handleSubmit}>
        <Plus className="plus-icon" size={20} />
        <input
          type="text"
          placeholder="新しいやりたいことを入力..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="reminder-input"
        />
        <button 
          type="submit"
          className="add-todo-btn"
          disabled={!text.trim()}
        >
          追加
        </button>
      </form>
    </div>
  );
}
