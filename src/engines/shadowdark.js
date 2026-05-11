import { rollDice as r, rollChance, pickRandom } from './dice.js';

// Shadowdark tier-based treasure (rough approximation of the Core treasure tables)
const TIERS = {
  1: {
    label: 'Tier 1 (Lv 1–2)',
    coins: { gp: ['2d4', 10], sp: ['1d4', 5] },
    gemsChance: 10,
    gemsDice: '1d3',
    magicChance: 10,
    magicCount: '1',
  },
  2: {
    label: 'Tier 2 (Lv 3–4)',
    coins: { gp: ['3d4', 10], sp: ['1d4', 20] },
    gemsChance: 20,
    gemsDice: '1d4',
    magicChance: 20,
    magicCount: '1',
  },
  3: {
    label: 'Tier 3 (Lv 5–6)',
    coins: { gp: ['4d6', 10], sp: ['1d6', 20] },
    gemsChance: 35,
    gemsDice: '1d6',
    magicChance: 35,
    magicCount: '1',
  },
  4: {
    label: 'Tier 4 (Lv 7–8)',
    coins: { gp: ['5d6', 10], sp: ['2d6', 20] },
    gemsChance: 55,
    gemsDice: '1d6+1',
    magicChance: 50,
    magicCount: '1',
  },
  5: {
    label: 'Tier 5 (Lv 9+)',
    coins: { gp: ['6d6', 20], pp: ['1d4', 1] },
    gemsChance: 75,
    gemsDice: '2d4',
    magicChance: 70,
    magicCount: '1d2',
  },
};

// Curated from Shadowdark Core Rulebook
const MAGIC_ITEMS = [
  'Alabaster\'s Wand', 'Amulet of the Drowned', 'Armor of the Heretic',
  'Black Ooze Vial', 'Boots of the Cat', 'Cape of the Mountebank',
  'Carcass of the Necrolisk', 'Chime of Opening', 'Cloak of Stars',
  'Crown of Tongues', 'Crystal of Eyes', 'Dagger of Bonebreaker',
  'Drinking Horn of Awakening', 'Echo Sword', 'Elixir of the Trembling Eye',
  'Eye of Many Eyes', 'Eye of the Dragon', 'Flute of the Snake Charmer',
  'Gauntlet of the Crusader', 'Gloves of Death', 'Goggles of the Past',
  'Helm of the Hill Giant', 'Holy Avenger', 'Horn of the Aurochs',
  'Lantern of the Lich', 'Map of Many Trails', 'Mirror of Memories',
  'Murky Vial', 'Pearl of Power', 'Pipe of the Pied Piper',
  'Ring of Ramming', 'Ring of Wishes', 'Robe of Useful Items',
  'Rod of Authority', 'Scroll of Protection', 'Shadow Knight\'s Chains',
  'Singing Sword', 'Skull of the Lost', 'Stone of Returning',
  'Sword of Many Sharp Points', 'The Awful Tome', 'Tome of Cipher',
  'Trident of the Sea Lords', 'Wand of Smites', 'Wand of Web Walking',
  'War Drum', 'Bag of Holding', 'Helm of Comprehension',
  'Belt of Bullshark', 'Map of Ill Fortune (cursed)',
];

const GEM_VALUES = [10, 25, 50, 100, 250, 500];

export function generateLoot(tierKey) {
  const tier = TIERS[tierKey];
  if (!tier) return null;

  const coins = {};
  for (const [type, [dice, mult]] of Object.entries(tier.coins)) {
    coins[type] = r(dice) * mult;
  }

  let gems;
  if (rollChance(tier.gemsChance)) {
    const count = r(tier.gemsDice);
    const groups = {};
    let totalValue = 0;
    for (let i = 0; i < count; i++) {
      const v = pickRandom(GEM_VALUES);
      groups[v] = (groups[v] || 0) + 1;
      totalValue += v;
    }
    const items = Object.entries(groups)
      .map(([value, c]) => ({ value: Number(value), count: c }))
      .sort((a, b) => b.value - a.value);
    gems = { count, items, totalValue };
  }

  const magicItems = [];
  if (rollChance(tier.magicChance)) {
    const count = r(tier.magicCount);
    for (let i = 0; i < count; i++) magicItems.push(pickRandom(MAGIC_ITEMS));
  }

  return {
    system: 'Shadowdark',
    subtitle: tier.label,
    coins,
    gems,
    magicItems,
  };
}

export const SHADOWDARK_TIERS = ['1', '2', '3', '4', '5'];
export function shadowdarkLabel(t) { return TIERS[t]?.label || `Tier ${t}`; }
