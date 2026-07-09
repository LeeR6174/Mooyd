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
  { id: 'avatar_unicorn', category: 'avatar', name: 'ユニコーン', emoji: '🦄', price: 1000, desc: '幻想的な集中力' },
  { id: 'avatar_dragon', category: 'avatar', name: 'ドラゴン', emoji: '🐲', price: 3000, desc: 'すべてを焼き尽くすタスク処理' },
  { id: 'avatar_alien', category: 'avatar', name: 'エイリアン', emoji: '👽', price: 5000, desc: '宇宙レベルの効率' },
  { id: 'avatar_king', category: 'avatar', name: '王冠', emoji: '👑', price: 10000, desc: 'タスク界の頂点' },

  // --- Boosts (ブースト・お守り) ---
  { id: 'boost_none', category: 'boost', name: 'ブーストなし', multiplier: 1.0, price: 0, desc: '通常通り（10コイン）' },
  { id: 'boost_coffee', category: 'boost', name: 'コーヒーのお守り', multiplier: 1.2, price: 500, desc: '獲得コイン1.2倍' },
  { id: 'boost_energy', category: 'boost', name: 'エナジードリンク', multiplier: 1.5, price: 2000, desc: '獲得コイン1.5倍' },
  { id: 'boost_magic', category: 'boost', name: '魔法の砂時計', multiplier: 2.0, price: 8000, desc: '獲得コイン2倍（永続）' },
  { id: 'boost_holy', category: 'boost', name: '聖なるタスク帳', multiplier: 3.0, price: 30000, desc: '獲得コイン3倍！超高額アイテム' },

  // --- Titles (称号) ---
  { id: 'title_novice', category: 'title', name: '駆け出し', price: 0, desc: 'まずはここから' },
  { id: 'title_achiever', category: 'title', name: 'アチーバー', price: 100, desc: 'タスクをこなす者' },
  { id: 'title_routine', category: 'title', name: 'ルーティン王', price: 400, desc: '習慣化の達人' },
  { id: 'title_master', category: 'title', name: 'タスクマスター', price: 1000, desc: '効率化の鬼' },
  { id: 'title_speed', category: 'title', name: '音速の仕事人', price: 2500, desc: '誰も追いつけない' },
  { id: 'title_legend', category: 'title', name: '伝説の社畜', price: 5000, desc: '息をするようにタスクをこなす' },
  { id: 'title_god', category: 'title', name: 'タスク神', price: 20000, desc: '創造と破壊を司る' },
  { id: 'title_infinity', category: 'title', name: '∞ 無限の彼方へ', price: 99999, desc: '究極のやり込み要素' },

  // --- Themes (テーマ) ---
  { id: 'theme_default', category: 'theme', name: 'パステルピンク', price: 0, desc: 'デフォルトの可愛いピンク' },
  { id: 'theme_ocean', category: 'theme', name: 'パステルミント', price: 200, desc: '爽やかなミントグリーン' },
  { id: 'theme_sunset', category: 'theme', name: 'パステルピーチ', price: 200, desc: '温かみのあるピーチ' },
  { id: 'theme_midnight', category: 'theme', name: 'パステルライラック', price: 500, desc: '大人可愛いパープル' },
  { id: 'theme_gold', category: 'theme', name: 'パステルレモン', price: 800, desc: '元気が出るイエロー' },
  { id: 'theme_dark', category: 'theme', name: 'パステルナイト', price: 1000, desc: '目に優しいダークパステル' },
  { id: 'theme_matcha', category: 'theme', name: '抹茶ラテ', price: 1500, desc: '和の心、パステルグリーン' },
  { id: 'theme_sakura', category: 'theme', name: '夜桜', price: 3000, desc: 'ダークピンクの高級感' },
];

export function useStore() {
  const [storeState, setStoreState] = useState(() => {
    const saved = localStorage.getItem('mooyd_store');
    if (saved) {
      const parsed = JSON.parse(saved);
      // マイグレーション用 (過去のセーブデータに新しい装備枠がない場合)
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
    // 装備中のブーストアイテムの効果を計算
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
