import { rollDice as r, rollChance, pickRandom } from './dice.js';

// Shadowdark Core Rulebook treasure (organized by encounter tier/difficulty)
// Each tier roughly aligns with the corresponding adventuring tier in SDRPG
const TIERS = {
  1: {
    label: 'Tier 1 (Lv 1–2 encounters)',
    coinFormula: { gp: ['2d4', 5], sp: ['2d6', 5], cp: ['2d10', 10] },
    gemsChance: 10, gemsDice: '1d3',
    magicChance: 10, magicCount: '1',
    rarity: 'common',
  },
  2: {
    label: 'Tier 2 (Lv 3–4 encounters)',
    coinFormula: { gp: ['3d6', 10], sp: ['2d6', 10], cp: ['2d6', 20] },
    gemsChance: 20, gemsDice: '1d4',
    magicChance: 25, magicCount: '1',
    rarity: 'common',
  },
  3: {
    label: 'Tier 3 (Lv 5–6 encounters)',
    coinFormula: { gp: ['4d6', 10], sp: ['2d8', 20] },
    gemsChance: 35, gemsDice: '1d6',
    magicChance: 40, magicCount: '1',
    rarity: 'uncommon',
  },
  4: {
    label: 'Tier 4 (Lv 7–8 encounters)',
    coinFormula: { gp: ['5d6', 20], pp: ['1d4', 1] },
    gemsChance: 55, gemsDice: '1d6+1',
    magicChance: 55, magicCount: '1d2',
    rarity: 'uncommon',
  },
  5: {
    label: 'Tier 5 (Lv 9–10 encounters)',
    coinFormula: { gp: ['6d6', 30], pp: ['1d6', 2] },
    gemsChance: 75, gemsDice: '2d4',
    magicChance: 70, magicCount: '1d2',
    rarity: 'rare',
  },
  boss: {
    label: 'Boss Hoard',
    coinFormula: { gp: ['10d6', 50], pp: ['2d6', 5] },
    gemsChance: 100, gemsDice: '3d6',
    magicChance: 100, magicCount: '1d3+1',
    rarity: 'legendary',
  },
};

// Shadowdark Core Rulebook magic items, grouped roughly by rarity tier
const ITEMS_BY_RARITY = {
  common: [
    'Bag of Holding', 'Boots of the Cat', 'Cape of the Mountebank', 'Cloak of Stars',
    'Crown of Tongues', 'Drinking Horn of Awakening', 'Goggles of the Past',
    'Helm of Comprehension', 'Lantern of the Lich', 'Map of Many Trails',
    'Mirror of Memories', 'Pearl of Power', 'Pipe of the Pied Piper',
    'Robe of Useful Items', 'Scroll of Protection', 'Stone of Returning',
    'Tome of Cipher', 'Wand of Smites', 'Wand of Web Walking', 'War Drum',
    'Murky Vial', 'Black Ooze Vial',
  ],
  uncommon: [
    'Amulet of the Drowned', 'Armor of the Heretic', 'Belt of Bullshark',
    'Carcass of the Necrolisk', 'Chime of Opening', 'Crystal of Eyes',
    'Dagger of Bonebreaker', 'Echo Sword', 'Elixir of the Trembling Eye',
    'Eye of Many Eyes', 'Flute of the Snake Charmer', 'Gauntlet of the Crusader',
    'Gloves of Death', 'Helm of the Hill Giant', 'Horn of the Aurochs',
    'Ring of Ramming', 'Rod of Authority', 'Shadow Knight\'s Chains',
    'Singing Sword', 'Skull of the Lost', 'Sword of Many Sharp Points',
    'Alabaster\'s Wand', 'The Awful Tome',
  ],
  rare: [
    'Eye of the Dragon', 'Holy Avenger', 'Trident of the Sea Lords',
    'Ring of Wishes (1 wish)', 'Crown of Tongues (Greater)',
    'Bag of Holding (Major)', 'Cloak of Stars (Greater)',
    'Hammer of Thunderbolts', 'Frost Brand', 'Defender Sword',
    'Sphere of Annihilation', 'Cube of Force',
    'Map of Ill Fortune (cursed)',
  ],
  legendary: [
    'Vorpal Sword', 'Apparatus of Kwalish', 'Deck of Many Things',
    'Staff of the Magi', 'Sphere of Annihilation', 'Cubic Gate',
    'Talisman of Pure Good', 'Talisman of Ultimate Evil',
    'Robe of the Archmagi', 'Crown of the Companion',
  ],
};

const GEM_VALUES_BY_RARITY = {
  common: [10, 25, 50, 50, 100],
  uncommon: [25, 50, 100, 100, 250],
  rare: [100, 250, 500, 500, 1000],
  legendary: [500, 1000, 2500, 5000],
};

export function generateLoot(tierKey) {
  const tier = TIERS[tierKey];
  if (!tier) return null;

  const coins = {};
  for (const [type, [dice, mult]] of Object.entries(tier.coinFormula)) {
    coins[type] = r(dice) * mult;
  }

  let gems;
  if (rollChance(tier.gemsChance)) {
    const count = r(tier.gemsDice);
    const values = GEM_VALUES_BY_RARITY[tier.rarity];
    const groups = {};
    let totalValue = 0;
    for (let i = 0; i < count; i++) {
      const v = pickRandom(values);
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
    const pool = ITEMS_BY_RARITY[tier.rarity];
    for (let i = 0; i < count; i++) magicItems.push(pickRandom(pool));
  }

  return {
    system: 'Shadowdark',
    subtitle: tier.label,
    coins,
    gems,
    magicItems,
  };
}

export const SHADOWDARK_TIERS = ['1', '2', '3', '4', '5', 'boss'];
export function shadowdarkLabel(t) { return TIERS[t]?.label || `Tier ${t}`; }
