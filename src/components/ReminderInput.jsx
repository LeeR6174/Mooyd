import { useState, useRef, useEffect } from 'react';
import { Plus, Mic, MicOff } from 'lucide-react';

export function ReminderInput({ onAdd }) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'ja-JP';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setText((prev) => prev ? prev + transcript : transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startRecording = (e) => {
    if (e) e.preventDefault();
    if (!recognitionRef.current) {
      alert('お使いのブラウザは音声認識に対応していません。');
      return;
    }
    if (!isRecording) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const stopRecording = (e) => {
    if (e) e.preventDefault();
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

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
          type="button" 
          className={`mic-btn ${isRecording ? 'recording' : ''}`}
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          title="長押しで音声入力"
        >
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
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
