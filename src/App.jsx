import { useState } from 'react';
import { useStore, STORE_ITEMS } from './hooks/useStore';
import { useReminders } from './hooks/useReminders';
import { ReminderList } from './components/ReminderList';
import { ReminderInput } from './components/ReminderInput';
import { StoreTab } from './components/StoreTab';
import { ShortcutHelp } from './components/ShortcutHelp';
import { HelpCircle } from 'lucide-react';

function App() {
  const { coins, inventory, equipped, addCoins, buyItem, equipItem } = useStore();
  const { reminders, addReminder, completeReminder } = useReminders(addCoins);
  
  const [activeTab, setActiveTab] = useState('reminders');
  const [showHelp, setShowHelp] = useState(false);

  // Get current title and avatar
  const currentTitle = STORE_ITEMS.find(item => item.id === equipped.title)?.name || '名称未設定';
  const currentAvatar = STORE_ITEMS.find(item => item.id === equipped.avatar)?.emoji || '🐣';

  return (
    <div className={`app-container ${equipped.theme}`}>
      <header className="app-header">
        <div className="header-left">
          <span className="profile-title">
            <span className="profile-avatar">{currentAvatar}</span> {currentTitle}
          </span>
        </div>
        <div className="header-right">
          <div className="coins-badge">
            <span className="coin-icon">🪙</span> 
            <span className="coin-amount">{coins}</span>
          </div>
          <button className="help-btn" onClick={() => setShowHelp(true)}>
            <HelpCircle size={20} />
          </button>
        </div>
      </header>

      <div className="title-section">
        <h1>Mooyd</h1>
        <p className="subtitle">Apple Reminders PWA</p>
      </div>

      <nav className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'reminders' ? 'active' : ''}`} 
          onClick={() => setActiveTab('reminders')}
        >
          タスク
        </button>
        <button 
          className={`tab-btn ${activeTab === 'store' ? 'active' : ''}`} 
          onClick={() => setActiveTab('store')}
        >
          ストア
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'reminders' && (
          <div className="reminders-view animate-fade-in">
            <ReminderList reminders={reminders} onComplete={completeReminder} />
            <ReminderInput onAdd={addReminder} />
          </div>
        )}
        
        {activeTab === 'store' && (
          <div className="store-view animate-fade-in">
            <StoreTab 
              coins={coins} 
              inventory={inventory} 
              equipped={equipped} 
              onBuy={buyItem} 
              onEquip={equipItem} 
            />
          </div>
        )}
      </main>

      {showHelp && (
        <ShortcutHelp onClose={() => setShowHelp(false)} />
      )}
    </div>
  );
}

export default App;
