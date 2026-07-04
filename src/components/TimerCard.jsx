import React from 'react';
import { Play, Square } from 'lucide-react';
import { formatTime } from '../utils/formatTime';

export function TimerCard({ type, active, timeElapsed, timeRemaining, onToggle, disabled }) {
  const isStudy = type === 'study';
  
  const title = isStudy ? 'Study Time' : 'Entertainment';
  const displayTime = isStudy ? timeElapsed : timeRemaining;

  return (
    <div className={`glass timer-card ${type} ${active ? 'active' : ''}`}>
      <div className="card-header">
        <h2 className="card-title">{title}</h2>
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
