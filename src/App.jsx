import { useState } from 'react';
import { useTimeBank } from './hooks/useTimeBank';
import { formatTime } from './utils/formatTime';
import { TimerCard } from './components/TimerCard';

function App() {
  const {
    bankedTime,
    studyActive,
    studyElapsed,
    entertainActive,
    startStudy,
    pauseStudy,
    stopStudy,
    startEntertain,
    pauseEntertain,
    stopEntertain,
  } = useTimeBank();

  const [showInfo, setShowInfo] = useState(false);

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
          onStart={startStudy}
          onPause={pauseStudy}
          onStop={stopStudy}
          disabled={entertainActive}
        />
        
        <TimerCard 
          type="entertain"
          active={entertainActive}
          timeRemaining={bankedTime}
          onStart={startEntertain}
          onPause={pauseEntertain}
          onStop={stopEntertain}
          disabled={studyActive || bankedTime <= 0}
          onInfoClick={() => setShowInfo(true)}
        />
      </div>

      {showInfo && (
        <div className="modal-overlay" onClick={() => setShowInfo(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">iOSショートカットの設定</h3>
            <div className="modal-body">
              <p>娯楽タイマーをバックグラウンドでも確実に鳴らすため、iOSの「ショートカット」アプリを使用します。</p>
              <ol>
                <li>iPhoneで「ショートカット」アプリを開き、新規作成します。</li>
                <li>名前を <strong>「タイマーセット」</strong> に変更します。</li>
                <li>アクションの検索から <strong>「タイマーを開始」</strong> を追加します。</li>
                <li>「（時間）分間タイマーを開始」と追加されるので、「時間」の部分をタップして <strong>「ショートカットの入力」</strong> を選択します。</li>
                <li>単位を「分」から <strong>「秒」</strong> に変更します。</li>
              </ol>
              <p>※娯楽スタートを押すと、このショートカットが自動で起動し、タイマーがセットされます。</p>
            </div>
            <button className="btn btn-entertain modal-close-btn" onClick={() => setShowInfo(false)}>
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
