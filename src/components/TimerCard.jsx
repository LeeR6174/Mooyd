import { Play, Square, HelpCircle, Timer, Gamepad2 } from 'lucide-react';
import { formatTime } from '../utils/formatTime';

export function TimerCard({ type, active, timeElapsed, timeRemaining, onToggle, disabled, onInfoClick }) {
  const isStudy = type === 'study';
  
  const title = isStudy ? 'Study Time' : 'Entertainment';
  const Icon = isStudy ? Timer : Gamepad2;
  const displayTime = isStudy ? timeElapsed : timeRemaining;

  return (
    <div className={`glass timer-card ${type} ${active ? 'active' : ''}`}>
      <div className="card-header">
        <Icon size={24} className="title-icon" color={isStudy ? 'var(--study-color)' : 'var(--entertain-color)'} />
        <h2 className="card-title">{title}</h2>
        {onInfoClick && (
          <button className="icon-btn" onClick={onInfoClick} aria-label="設定ヘルプ" title="設定ヘルプ">
            <HelpCircle size={20} />
          </button>
        )}
        {active && <div className="pulsing" style={{
          width: 8, height: 8, borderRadius: '50%', 
          backgroundColor: isStudy ? 'var(--study-color)' : 'var(--entertain-color)'
        }} />}
      </div>
      
      <div className="timer-display">
        {formatTime(displayTime || 0)}
      </div>

      <button 
        className={`btn ${active ? 'btn-stop' : isStudy ? 'btn-study' : 'btn-entertain'}`}
        onClick={onToggle}
        disabled={disabled}
      >
        {active ? (
          <>
            <Square size={20} fill="currentColor" />
            Stop
          </>
        ) : (
          <>
            <Play size={20} fill="currentColor" />
            Start
          </>
        )}
      </button>
    </div>
  );
}
