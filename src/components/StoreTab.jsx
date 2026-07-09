import { STORE_ITEMS } from '../hooks/useStore';
import { ShoppingBag, Check } from 'lucide-react';

export function StoreTab({ coins, inventory, equipped, onBuy, onEquip }) {
  const avatars = STORE_ITEMS.filter(item => item.category === 'avatar');
  const boosts = STORE_ITEMS.filter(item => item.category === 'boost');
  const themes = STORE_ITEMS.filter(item => item.category === 'theme');
  const titles = STORE_ITEMS.filter(item => item.category === 'title');

  const renderItem = (item) => {
    const isOwned = inventory.includes(item.id);
    const isEquipped = equipped[item.category] === item.id;
    const canAfford = coins >= item.price;

    return (
      <div key={item.id} className={`store-item ${isEquipped ? 'equipped' : ''} ${!isOwned && !canAfford ? 'locked' : ''}`}>
        {item.emoji && <div className="store-item-emoji">{item.emoji}</div>}
        <div className="store-item-info">
          <h4>{item.name}</h4>
          <p className="item-desc">{item.desc}</p>
          {item.multiplier && <p className="item-boost-desc">倍率: x{item.multiplier}</p>}
        </div>
        
        <div className="store-item-action">
          {isEquipped ? (
            <span className="equipped-badge"><Check size={16} /> 装備中</span>
          ) : isOwned ? (
            <button className="btn btn-equip" onClick={() => onEquip(item)}>装備する</button>
          ) : (
            <button 
              className="btn btn-buy" 
              disabled={!canAfford}
              onClick={() => {
                if(window.confirm(`${item.name} を ${item.price}コインで購入しますか？`)) {
                  onBuy(item);
                }
              }}
            >
              🪙 {item.price}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="store-tab">
      <div className="store-header">
        <div className="store-coins">
          <ShoppingBag size={28} className="accent-icon" />
          <span>所持コイン: <strong>{coins}</strong></span>
        </div>
        <p className="store-subtitle">タスクをこなして様々なアイテムをコレクションしよう！</p>
      </div>

      <div className="store-section">
        <h3 className="section-title">✨ アバター (アイコン)</h3>
        <div className="store-grid">
          {avatars.map(renderItem)}
        </div>
      </div>

      <div className="store-section">
        <h3 className="section-title">🔮 お守り (獲得コインUP)</h3>
        <div className="store-grid">
          {boosts.map(renderItem)}
        </div>
      </div>

      <div className="store-section">
        <h3 className="section-title">🎨 テーマ (背景色)</h3>
        <div className="store-grid">
          {themes.map(renderItem)}
        </div>
      </div>

      <div className="store-section">
        <h3 className="section-title">👑 称号 (ヘッダー表示)</h3>
        <div className="store-grid">
          {titles.map(renderItem)}
        </div>
      </div>
    </div>
  );
}
