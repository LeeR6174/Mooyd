import { useState, useRef, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Mic, MicOff } from 'lucide-react';

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
  
  // Swipe mechanics
  const [offset, setOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const startX = useRef(null);
  const isDragging = useRef(false);
  const containerRef = useRef(null);
  
  const SWIPE_THRESHOLD = 60; // How far to swipe before it triggers
  
  const handleTouchStart = (e) => {
    if (!text.trim()) return; // Don't allow swipe if no text
    isDragging.current = true;
    setIsAnimating(false);
    startX.current = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const deltaX = currentX - startX.current;
    
    // limit visual offset based on container width minus thumb width
    const maxOffset = containerRef.current ? (containerRef.current.offsetWidth / 2) - 24 : 100;
    
    // Bounded delta
    const boundedDelta = Math.max(-maxOffset, Math.min(maxOffset, deltaX));
    setOffset(boundedDelta);
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsAnimating(true);
    
    if (offset >= SWIPE_THRESHOLD) {
      // Swiped Right -> Today
      onAdd(text.trim(), 'today');
      setText('');
    } else if (offset <= -SWIPE_THRESHOLD) {
      // Swiped Left -> Date
      onAdd(text.trim(), 'date');
      setText('');
    }
    
    setOffset(0);
  };

  // Default enter key to 'today' since "no date" is removed.
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim(), 'today');
      setText('');
    }
  };

  const isRightActive = offset >= SWIPE_THRESHOLD;
  const isLeftActive = offset <= -SWIPE_THRESHOLD;

  return (
    <div className="reminder-input-wrapper">
      <form className="reminder-input-form" onSubmit={handleFormSubmit}>
        <Plus className="plus-icon" size={20} />
        <input
          type="text"
          placeholder="新規リマインダー"
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
      </form>
      
      <div 
        className={`swipe-add-container ${text.trim() ? 'active' : 'disabled'}`}
        ref={containerRef}
        onMouseLeave={handleTouchEnd}
        onMouseUp={handleTouchEnd}
        onMouseMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        <div className={`swipe-hint-left ${isLeftActive ? 'active' : ''}`}>
          <ChevronLeft size={16} /> 日付指定
        </div>
        
        <div 
          className={`swipe-thumb ${isAnimating ? 'animating' : ''}`}
          style={{ transform: `translateX(${offset}px)` }}
          onMouseDown={handleTouchStart}
          onTouchStart={handleTouchStart}
        >
          <Plus size={20} />
        </div>

        <div className={`swipe-hint-right ${isRightActive ? 'active' : ''}`}>
          今日 <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
}
