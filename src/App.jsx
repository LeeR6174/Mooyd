import React from 'react';
import { useTimeBank } from './hooks/useTimeBank';
import { formatTime } from './utils/formatTime';
import { TimerCard } from './components/TimerCard';

function App() {
  const {
    bankedTime,
    studyActive,
    studyElapsed,
    entertainActive,
    toggleStudy,
    toggleEntertain,
  } = useTimeBank();

  return (
    <>
      <h1 className="animate-slide-down">Time Bank</h1>
      <p className="subtitle animate-slide-down" style={{ animationDelay: '0.1s' }}>
        Earn time by studying, spend it on entertainment.
      </p>

      <div className="bank-display glass animate-slide-down" style={{ animationDelay: '0.2s' }}>
        <div className="bank-label">Total Banked Time</div>
        <div className="bank-time">
          {formatTime(bankedTime)}
        </div>
      </div>

      <div className="cards-container animate-slide-down" style={{ animationDelay: '0.3s' }}>
        <TimerCard 
          type="study"
          active={studyActive}
          timeElapsed={studyElapsed}
          onToggle={toggleStudy}
          disabled={entertainActive}
        />
        
        <TimerCard 
          type="entertain"
          active={entertainActive}
          timeRemaining={entertainActive ? bankedTime : bankedTime}
          onToggle={toggleEntertain}
          disabled={studyActive || bankedTime <= 0}
        />
      </div>
    </>
  );
}

export default App;
