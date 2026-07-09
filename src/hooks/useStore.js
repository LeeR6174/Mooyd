import { useState, useEffect } from 'react';

const DEFAULT_STATE = {
  coins: 0,
  inventory: ['theme_default', 'title_novice', 'avatar_default', 'boost_none'],
  equipped: {
    theme: 'theme_default',
    title: 'title_novice',
    avatar: 'avatar_default',
    boost: 'boost_none',
  }
};

export const STORE_ITEMS = [
  // --- Avatars (アバター) ---
  { id: 'avatar_default', category: 'avatar', name: 'ひよこ', emoji: '🐣', price: 0, desc: '始まりの姿' },
  { id: 'avatar_cat', category: 'avatar', name: 'のんびりネコ', emoji: '🐱', price: 150, desc: 'マイペースに頑張る' },
  { id: 'avatar_dog', category: 'avatar', name: '忠実なイヌ', emoji: '🐶', price: 150, desc: 'タスクに忠実' },
  { id: 'avatar_rabbit', category: 'avatar', name: 'うさぎ', emoji: '🐰', price: 300, desc: '素早くタスクをこなす' },
  { id: 'avatar_fox', category: 'avatar', name: 'かしこいキツネ', emoji: '🦊', price: 500, desc: '賢くタスクを処理' },
  { id: 'avatar_bear', category: 'avatar', name: '力持ちのクマ', emoji: '🐻', price: 500, desc: '重いタスクもへっちゃら' },
  { id: 'avatar_unicorn', category: 'avatar', name: 'ユニコーン', emoji: '🦄', price: 1000, desc: '幻想的な集中力' },
  { id: 'avatar_owl', category: 'avatar', name: '夜更かしフクロウ', emoji: '🦉', price: 1500, desc: '深夜の作業はお任せ' },
  { id: 'avatar_dragon', category: 'avatar', name: 'ドラゴン', emoji: '🐲', price: 3000, desc: 'すべてを焼き尽くすタスク処理' },
  { id: 'avatar_ghost', category: 'avatar', name: 'ゴースト', emoji: '👻', price: 4000, desc: '誰にも見られず仕事を終える' },
  { id: 'avatar_alien', category: 'avatar', name: 'エイリアン', emoji: '👽', price: 5000, desc: '宇宙レベルの効率' },
  { id: 'avatar_robot', category: 'avatar', name: 'ロボット', emoji: '🤖', price: 7500, desc: '感情を捨ててタスクを消化' },
  { id: 'avatar_king', category: 'avatar', name: '王冠', emoji: '👑', price: 10000, desc: 'タスク界の頂点' },
  { id: 'avatar_diamond', category: 'avatar', name: 'ダイヤモンド', emoji: '💎', price: 50000, desc: '永遠に輝く実績' },

  // --- Boosts (ブースト・お守り) ---
  { id: 'boost_none', category: 'boost', name: 'ブーストなし', multiplier: 1.0, price: 0, desc: '通常通り（10コイン）' },
  { id: 'boost_candy', category: 'boost', name: 'ご褒美キャンディ', multiplier: 1.1, price: 200, desc: '獲得コイン1.1倍' },
  { id: 'boost_coffee', category: 'boost', name: 'コーヒーのお守り', multiplier: 1.2, price: 500, desc: '獲得コイン1.2倍' },
  { id: 'boost_energy', category: 'boost', name: 'エナジードリンク', multiplier: 1.5, price: 2000, desc: '獲得コイン1.5倍' },
  { id: 'boost_clover', category: 'boost', name: '四つ葉のクローバー', multiplier: 1.8, price: 5000, desc: '獲得コイン1.8倍' },
  { id: 'boost_magic', category: 'boost', name: '魔法の砂時計', multiplier: 2.0, price: 8000, desc: '獲得コイン2倍（永続）' },
  { id: 'boost_scroll', category: 'boost', name: '賢者の巻物', multiplier: 2.5, price: 15000, desc: '獲得コイン2.5倍' },
  { id: 'boost_holy', category: 'boost', name: '聖なるタスク帳', multiplier: 3.0, price: 30000, desc: '獲得コイン3倍！超高額アイテム' },
  { id: 'boost_infinity', category: 'boost', name: '無限のエンジン', multiplier: 5.0, price: 100000, desc: '獲得コイン5倍（エンドコンテンツ）' },

  // --- Titles (称号) ---
  { id: 'title_novice', category: 'title', name: '駆け出し', price: 0, desc: 'まずはここから' },
  { id: 'title_achiever', category: 'title', name: 'アチーバー', price: 100, desc: 'タスクをこなす者' },
  { id: 'title_steady', category: 'title', name: 'コツコツ職人', price: 250, desc: '地道な努力が実を結ぶ' },
  { id: 'title_routine', category: 'title', name: 'ルーティン王', price: 400, desc: '習慣化の達人' },
  { id: 'title_expert', category: 'title', name: 'エキスパート', price: 700, desc: '頼れる存在' },
  { id: 'title_master', category: 'title', name: 'タスクマスター', price: 1000, desc: '効率化の鬼' },
  { id: 'title_ninja', category: 'title', name: 'タスク忍者', price: 1500, desc: '気づけば終わっている' },
  { id: 'title_speed', category: 'title', name: '音速の仕事人', price: 2500, desc: '誰も追いつけない' },
  { id: 'title_hero', category: 'title', name: '救世主', price: 3500, desc: '積まれたタスクを救う' },
  { id: 'title_legend', category: 'title', name: '伝説の社畜', price: 5000, desc: '息をするようにタスクをこなす' },
  { id: 'title_emperor', category: 'title', name: 'タスク皇帝', price: 10000, desc: 'すべてを支配する' },
  { id: 'title_god', category: 'title', name: 'タスク神', price: 20000, desc: '創造と破壊を司る' },
  { id: 'title_universe', category: 'title', name: '宇宙の真理', price: 50000, desc: 'タスクとは何かを知る者' },
  { id: 'title_infinity', category: 'title', name: '∞ 無限の彼方へ', price: 99999, desc: '究極のやり込み要素' },

  // --- Themes (テーマ) ---
  { id: 'theme_default', category: 'theme', name: 'パステルピンク', price: 0, desc: 'デフォルトの可愛いピンク' },
  { id: 'theme_ocean', category: 'theme', name: 'パステルミント', price: 200, desc: '爽やかなミントグリーン' },
  { id: 'theme_sunset', category: 'theme', name: 'パステルピーチ', price: 200, desc: '温かみのあるピーチ' },
  { id: 'theme_cream', category: 'theme', name: 'バニラクリーム', price: 300, desc: 'ふんわり甘いオフホワイト' },
  { id: 'theme_sky', category: 'theme', name: 'スカイブルー', price: 400, desc: '晴れ渡る空の色' },
  { id: 'theme_midnight', category: 'theme', name: 'パステルライラック', price: 500, desc: '大人可愛いパープル' },
  { id: 'theme_gold', category: 'theme', name: 'パステルレモン', price: 800, desc: '元気が出るイエロー' },
  { id: 'theme_dark', category: 'theme', name: 'パステルナイト', price: 1000, desc: '目に優しいダークパステル' },
  { id: 'theme_matcha', category: 'theme', name: '抹茶ラテ', price: 1500, desc: '和の心、パステルグリーン' },
  { id: 'theme_sakura', category: 'theme', name: '夜桜', price: 3000, desc: 'ダークピンクの高級感' },
  { id: 'theme_rainbow', category: 'theme', name: 'オーロラ', price: 10000, desc: '幻想的な極上のテーマ' },
];

export function useStore() {
  const [storeState, setStoreState] = useState(() => {
    const saved = localStorage.getItem('mooyd_store');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_STATE,
        ...parsed,
        equipped: {
          ...DEFAULT_STATE.equipped,
          ...parsed.equipped,
        },
        inventory: Array.from(new Set([...DEFAULT_STATE.inventory, ...(parsed.inventory || [])]))
      };
    }
    return DEFAULT_STATE;
  });

  useEffect(() => {
    localStorage.setItem('mooyd_store', JSON.stringify(storeState));
  }, [storeState]);

  const addCoins = (baseAmount) => {
    const equippedBoostItem = STORE_ITEMS.find(item => item.id === storeState.equipped.boost);
    const multiplier = equippedBoostItem ? (equippedBoostItem.multiplier || 1.0) : 1.0;
    const finalAmount = Math.floor(baseAmount * multiplier);

    setStoreState(prev => ({ ...prev, coins: prev.coins + finalAmount }));
  };

  const buyItem = (item) => {
    if (storeState.coins >= item.price && !storeState.inventory.includes(item.id)) {
      setStoreState(prev => ({
        ...prev,
        coins: prev.coins - item.price,
        inventory: [...prev.inventory, item.id]
      }));
      return true;
    }
    return false;
  };

  const equipItem = (item) => {
    if (storeState.inventory.includes(item.id)) {
      setStoreState(prev => ({
        ...prev,
        equipped: {
          ...prev.equipped,
          [item.category]: item.id
        }
      }));
    }
  };

  return {
    ...storeState,
    addCoins,
    buyItem,
    equipItem
  };
}
