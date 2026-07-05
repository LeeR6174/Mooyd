import { useState } from 'react';
import { useTimeBank } from './hooks/useTimeBank';
import { formatTime } from './utils/formatTime';
import { TimerCard } from './components/TimerCard';
import { RecordsTab } from './components/RecordsTab';
import { StoreTab } from './components/StoreTab';

function App() {
  const {
    bankedTime,
    coins,
    records,
    profile,
    studyActive,
    studyElapsed,
    entertainActive,
    startStudy,
    pauseStudy,
    stopStudy,
    startEntertain,
    pauseEntertain,
    stopEntertain,
    buyItem,
    equipItem,
  } = useTimeBank();

  const [activeTab, setActiveTab] = useState('timer');
  const [showInfo, setShowInfo] = useState(false);

  const renderTimerTab = () => (
    <>
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
    </>
  );

  return (
    <div className={`app-container theme-${profile.theme}`}>
      <header className="app-header animate-slide-down">
        <div className="profile-badge glass">
          <span className="profile-icon">{profile.icon}</span>
          <span className="profile-title">{profile.title}</span>
        </div>
        <div className="coins-badge glass">
          <span className="coin-icon">🪙</span> 
          <span className="coin-amount">{coins}</span>
        </div>
      </header>

      <h1 className="animate-slide-down" style={{ animationDelay: '0.1s' }}>Mooyd</h1>
      <p className="subtitle animate-slide-down" style={{ animationDelay: '0.15s' }}>
        Earn time by studying, spend it on entertainment.
      </p>

      <nav className="tabs animate-slide-down" style={{ animationDelay: '0.2s' }}>
        <button className={`tab-btn ${activeTab === 'timer' ? 'active' : ''}`} onClick={() => setActiveTab('timer')}>Timer</button>
        <button className={`tab-btn ${activeTab === 'records' ? 'active' : ''}`} onClick={() => setActiveTab('records')}>Records</button>
        <button className={`tab-btn ${activeTab === 'store' ? 'active' : ''}`} onClick={() => setActiveTab('store')}>Store</button>
      </nav>

      <main className="tab-content">
        {activeTab === 'timer' && renderTimerTab()}
        {activeTab === 'records' && <RecordsTab records={records} />}
        {activeTab === 'store' && <StoreTab coins={coins} profile={profile} buyItem={buyItem} equipItem={equipItem} />}
      </main>

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
    </div>
  );
}

export default App;
