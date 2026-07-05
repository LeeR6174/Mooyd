import { Play, Pause, Square, HelpCircle, Timer, Gamepad2 } from 'lucide-react';
import { formatTime } from '../utils/formatTime';

export function TimerCard({ type, active, timeElapsed, timeRemaining, onStart, onPause, onStop, disabled, onInfoClick }) {
  const isStudy = type === 'study';
  
  const title = isStudy ? 'Study Time' : 'Entertainment';
  const Icon = isStudy ? Timer : Gamepad2;
  const displayTime = isStudy ? timeElapsed : timeRemaining;

  return (
    <div className={`glass timer-card ${type} ${active ? 'active' : ''}`}>
      <div className="card-header">
        <Icon size={20} className="title-icon" color={isStudy ? 'var(--study-color)' : 'var(--entertain-color)'} />
        <h2 className="card-title">{title}</h2>
        {onInfoClick && (
          <button className="icon-btn" onClick={onInfoClick} aria-label="設定ヘルプ" title="設定ヘルプ">
            <HelpCircle size={18} />
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

      <div className="controls-row">
        {!active ? (
          <button 
            className={`btn ${isStudy ? 'btn-study' : 'btn-entertain'}`}
            onClick={onStart}
            disabled={disabled}
          >
            <Play size={18} fill="currentColor" />
            Start
          </button>
        ) : (
          <button 
            className="btn btn-pause"
            onClick={onPause}
          >
            <Pause size={18} fill="currentColor" />
            Pause
          </button>
        )}
        {isStudy && (
          <button 
            className="btn btn-stop"
            onClick={onStop}
            disabled={!active && timeElapsed === 0}
          >
            <Square size={18} fill="currentColor" />
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
