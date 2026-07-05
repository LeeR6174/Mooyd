const STORE_ITEMS = [
  { id: 'icon_default', type: 'icon', name: 'シルエット', value: '👤', price: 0 },
  { id: 'icon_cat', type: 'icon', name: '猫', value: '🐱', price: 600 }, // 10 mins
  { id: 'icon_dog', type: 'icon', name: '犬', value: '🐶', price: 600 },
  { id: 'icon_owl', type: 'icon', name: 'フクロウ', value: '🦉', price: 1800 }, // 30 mins
  { id: 'icon_rocket', type: 'icon', name: 'ロケット', value: '🚀', price: 3600 }, // 1 hour
  { id: 'icon_crown', type: 'icon', name: '王冠', value: '👑', price: 18000 }, // 5 hours

  { id: 'title_beginner', type: 'title', name: '称号：初心者', value: '初心者', price: 0 },
  { id: 'title_student', type: 'title', name: '称号：学習者', value: '学習者', price: 1200 },
  { id: 'title_master', type: 'title', name: '称号：マスター', value: 'マスター', price: 7200 },
  { id: 'title_legend', type: 'title', name: '称号：レジェンド', value: 'レジェンド', price: 36000 },

  { id: 'theme_default', type: 'theme', name: 'ダークテーマ（標準）', value: 'default', price: 0 },
  { id: 'theme_nature', type: 'theme', name: 'ネイチャー（緑）', value: 'nature', price: 3600 },
  { id: 'theme_ocean', type: 'theme', name: 'オーシャン（青）', value: 'ocean', price: 3600 },
];

export function StoreTab({ coins, profile, buyItem, equipItem }) {
  
  const handleItemClick = (item) => {
    const isUnlocked = profile.unlocked.includes(item.id);
    const isEquipped = profile[item.type] === item.value;

    if (isEquipped) return; // Already equipped, do nothing

    if (isUnlocked) {
      // Equip
      equipItem(item.type, item.value);
    } else {
      // Buy
      if (coins >= item.price) {
        if (window.confirm(`${item.name} を ${item.price}🪙 で購入しますか？`)) {
          const success = buyItem(item);
          if (success) {
            equipItem(item.type, item.value);
          }
        }
      } else {
        alert(`コインが足りません！（あと ${item.price - coins}🪙 必要です）`);
      }
    }
  };

  const renderSection = (title, type) => {
    const items = STORE_ITEMS.filter(i => i.type === type);
    return (
      <div className="store-section">
        <h3 className="store-section-title">{title}</h3>
        <div className="store-grid">
          {items.map(item => {
            const isUnlocked = profile.unlocked.includes(item.id);
            const isEquipped = profile[item.type] === item.value;
            const canAfford = coins >= item.price;

            let btnText = '';
            let btnClass = 'store-item glass ';
            if (isEquipped) {
              btnText = '装備中';
              btnClass += 'equipped';
            } else if (isUnlocked) {
              btnText = '装備する';
              btnClass += 'unlocked';
            } else {
              btnText = `${item.price} 🪙`;
              if (!canAfford) btnClass += 'locked';
            }

            return (
              <button 
                key={item.id} 
                className={btnClass}
                onClick={() => handleItemClick(item)}
              >
                <div className="item-preview">
                  {type === 'icon' && <span className="preview-icon">{item.value}</span>}
                  {type === 'title' && <span className="preview-title">{item.value}</span>}
                  {type === 'theme' && <div className={`preview-color preview-${item.value}`}></div>}
                </div>
                <div className="item-name">{item.name}</div>
                <div className="item-status">{btnText}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="store-tab animate-slide-down">
      <div className="store-header">
        <h2 className="tab-title">Store</h2>
        <p className="store-desc">勉強して貯めたコインでアイテムを解放しよう！</p>
      </div>

      {renderSection('アイコン (Icons)', 'icon')}
      {renderSection('称号 (Titles)', 'title')}
      {renderSection('テーマカラー (Themes)', 'theme')}
    </div>
  );
}
