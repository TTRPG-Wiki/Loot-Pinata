import { rollDice as r, rollChance, pickRandom } from './dice.js';

// Old-School Essentials / B/X treasure types
// Coin values shown are multiplied by 1000 unless noted
export const OSE_TYPES = {
  A: { label: 'A — Lair (Dragons, Liches)', coins: { cp: [25, '1d6', 1000], sp: [30, '1d6', 1000], ep: [20, '1d4', 1000], gp: [35, '2d6', 1000], pp: [25, '1d2', 1000] }, gems: [50, '6d6'], jewelry: [50, '6d6'], magic: [30, ['any', 'any', 'any', 'potion', 'scroll']] },
  B: { label: 'B — Lair (Small)', coins: { cp: [50, '1d8', 1000], sp: [25, '1d6', 1000], ep: [25, '1d4', 1000], gp: [25, '1d3', 1000] }, gems: [25, '1d6'], jewelry: [25, '1d6'], magic: [10, ['sword_armor_weapon']] },
  C: { label: 'C — Lair (Modest)', coins: { cp: [20, '1d12', 1000], sp: [30, '1d4', 1000], ep: [10, '1d4', 1000] }, gems: [25, '1d4'], jewelry: [25, '1d4'], magic: [10, ['any', 'any']] },
  D: { label: 'D — Lair (Gold-rich)', coins: { cp: [10, '1d8', 1000], sp: [15, '1d12', 1000], gp: [60, '1d6', 1000] }, gems: [30, '1d8'], jewelry: [30, '1d8'], magic: [15, ['any', 'any', 'potion']] },
  E: { label: 'E — Lair (Mixed)', coins: { cp: [5, '1d10', 1000], sp: [30, '1d12', 1000], ep: [25, '1d4', 1000], gp: [25, '1d8', 1000] }, gems: [10, '1d10'], jewelry: [10, '1d10'], magic: [25, ['any', 'any', 'any', 'scroll']] },
  F: { label: 'F — Lair (Rich)', coins: { sp: [10, '2d10', 1000], ep: [20, '1d8', 1000], gp: [45, '1d12', 1000], pp: [30, '1d3', 1000] }, gems: [20, '2d12'], jewelry: [10, '1d12'], magic: [30, ['nonweapon', 'nonweapon', 'nonweapon', 'potion', 'scroll']] },
  G: { label: 'G — Lair (Gold Hoard)', coins: { gp: [50, '10d4', 1000], pp: [50, '1d6', 1000] }, gems: [25, '3d6'], jewelry: [25, '1d10'], magic: [35, ['any', 'any', 'any', 'any', 'scroll']] },
  H: { label: 'H — Lair (Vast)', coins: { cp: [25, '3d8', 1000], sp: [50, '1d100', 1000], ep: [50, '10d4', 1000], gp: [50, '10d6', 1000], pp: [25, '5d4', 1000] }, gems: [50, '1d100'], jewelry: [50, '10d4'], magic: [15, ['any', 'any', 'any', 'any', 'potion', 'scroll']] },
  I: { label: 'I — Lair (Platinum)', coins: { pp: [30, '1d8', 1000] }, gems: [50, '2d6'], jewelry: [50, '2d6'], magic: [15, ['any']] },
  J: { label: 'J — Individual (Tiny)', coins: { cp: [25, '1d4', 1000], sp: [10, '1d3', 1000] } },
  K: { label: 'K — Individual (Small)', coins: { sp: [30, '1d6', 1000], ep: [10, '1d2', 1000] } },
  L: { label: 'L — Individual (Gems)', gems: [50, '1d4'] },
  M: { label: 'M — Individual (Rich)', coins: { gp: [40, '2d4', 1000], pp: [50, '1d6', 100] } },
  N: { label: 'N — Individual (Potions)', magic: [40, Array(4).fill('potion')] },
  O: { label: 'O — Individual (Scrolls)', magic: [50, Array(4).fill('scroll')] },
  P: { label: 'P — Carried (Copper)', coins: { cp: [100, '3d8', 1] } },
  Q: { label: 'Q — Carried (Silver)', coins: { sp: [100, '3d6', 1] } },
  R: { label: 'R — Carried (Electrum)', coins: { ep: [100, '2d6', 1] } },
  S: { label: 'S — Carried (Gold)', coins: { gp: [100, '2d4', 1] } },
  T: { label: 'T — Carried (Platinum)', coins: { pp: [100, '1d6', 1] } },
  U: { label: 'U — Mixed (Coins/Gems)', coins: { cp: [10, '1d20', 1], sp: [10, '1d20', 1], gp: [5, '1d20', 1] }, gems: [5, '1d4'], jewelry: [5, '1d4'], magic: [2, ['any']] },
  V: { label: 'V — Mixed (Silver/Gold)', coins: { sp: [10, '1d20', 1], ep: [5, '1d20', 1], gp: [10, '1d20', 1], pp: [5, '1d20', 1] }, gems: [10, '1d4'], jewelry: [10, '1d4'], magic: [5, ['any']] },
};

const POTIONS = ['Clairvoyance', 'Climbing', 'ESP', 'Ethereality', 'Fire Resistance', 'Flying', 'Gaseous Form', 'Giant Strength', 'Growth', 'Healing', 'Heroism', 'Human Control', 'Invisibility', 'Invulnerability', 'Levitation', 'Longevity', 'Plant Control', 'Polymorph Self', 'Speed', 'Super-Heroism', 'Treasure Finding', 'Undead Control', 'Delusion (cursed)', 'Poison (cursed)'];

const SCROLLS = ['Spell Scroll (1 spell, lvl 1)', 'Spell Scroll (1 spell, lvl 3)', 'Spell Scroll (2 spells, lvls 2-4)', 'Spell Scroll (3 spells, lvls 4-6)', 'Protection from Elementals', 'Protection from Lycanthropes', 'Protection from Magic', 'Protection from Undead', 'Treasure Map', 'Cursed Scroll'];

const SWORDS = ['Sword +1', 'Sword +1, +2 vs lycanthropes', 'Sword +1, +3 vs undead', 'Sword +1, Locate Objects', 'Sword +1, Charm Person', 'Sword +2', 'Sword +2, Charm Person', 'Sword +3', 'Sword of Sharpness +3', 'Sword of Life Stealing', 'Sword of Wounding', 'Holy Sword (Paladin only)', 'Two-Handed Sword +1', 'Flame Tongue', 'Frost Brand', 'Defender +3', 'Vorpal Sword', 'Sword -1 (cursed)', 'Sword -2 (cursed)'];

const ARMOR = ['Leather Armor +1', 'Leather Armor +2', 'Chain Mail +1', 'Chain Mail +2', 'Plate Mail +1', 'Plate Mail +2', 'Plate Mail +3', 'Shield +1', 'Shield +2', 'Shield +3', 'Mithril Plate', 'Armor of Etherealness', 'Armor -1 (cursed)', 'Shield -1 (cursed)'];

const WEAPONS = ['Battleaxe +1', 'Battleaxe +2', 'Dagger +1, +2 vs small', 'Hand Axe +1', 'Mace +1', 'Mace +2', 'Mace +3', 'War Hammer +1', 'War Hammer +3, Dwarven Thrower', 'Spear +1', 'Spear +3', 'Quarterstaff +1', '1 Arrow +1 (1d10)', '1 Arrow of Slaying', 'Crossbow Bolt +2 (1d6)', 'Sling Stone +2', 'Light Crossbow +1'];

const MISC = ['Bag of Holding', 'Bag of Devouring (cursed)', 'Boots of Levitation', 'Boots of Speed', 'Boots of Traveling and Leaping', 'Bracers of Defense AC4', 'Broom of Flying', 'Carpet of Flying', 'Cloak of Displacement', 'Cloak of Elvenkind', 'Crystal Ball', 'Decanter of Endless Water', 'Drums of Panic', 'Efreeti Bottle', 'Elven Boots', 'Elven Cloak', 'Eyes of the Eagle', 'Gauntlets of Ogre Power', 'Girdle of Giant Strength', 'Helm of Reading Magic', 'Helm of Telepathy', 'Horn of Blasting', 'Mirror of Life Trapping', 'Robe of Useful Items', 'Rope of Climbing', 'Ring of Animal Control', 'Ring of Fire Resistance', 'Ring of Invisibility', 'Ring of Protection +1', 'Ring of Protection +2', 'Ring of Regeneration', 'Ring of Spell Storing', 'Ring of Spell Turning', 'Ring of Telekinesis', 'Ring of Three Wishes', 'Ring of Water Walking', 'Ring of X-Ray Vision', 'Ring of Weakness (cursed)', 'Rod of Cancellation', 'Snake Staff', 'Staff of Healing', 'Staff of Striking', 'Staff of Withering', 'Wand of Cold', 'Wand of Enemy Detection', 'Wand of Fear', 'Wand of Fire Balls', 'Wand of Illusion', 'Wand of Lightning Bolts', 'Wand of Magic Detection', 'Wand of Negation', 'Wand of Paralyzation', 'Wand of Polymorph', 'Wand of Secret Door Detection'];

function rollMagicItem(category) {
  switch (category) {
    case 'potion': return pickRandom(POTIONS);
    case 'scroll': return pickRandom(SCROLLS);
    case 'sword': return pickRandom(SWORDS);
    case 'armor': return pickRandom(ARMOR);
    case 'weapon': return pickRandom(WEAPONS);
    case 'nonweapon': return pickRandom([...MISC, ...POTIONS, ...SCROLLS]);
    case 'sword_armor_weapon': return pickRandom([...SWORDS, ...ARMOR, ...WEAPONS]);
    case 'any':
    default: {
      const all = [...SWORDS, ...ARMOR, ...WEAPONS, ...MISC, ...POTIONS, ...SCROLLS];
      return pickRandom(all);
    }
  }
}

const GEM_VALUES = [10, 50, 100, 100, 500, 500, 1000, 5000];
const JEWELRY_FORMULAS = ['1d6', '2d6', '1d10', '3d6'];

function rollGems(count) {
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
  return { count, items, totalValue };
}

function rollJewelry(count) {
  const items = [];
  let totalValue = 0;
  for (let i = 0; i < count; i++) {
    const formula = pickRandom(JEWELRY_FORMULAS);
    const value = r(formula) * 100;
    items.push({ description: `Jewelry (${formula} × 100)`, value });
    totalValue += value;
  }
  return { count, items, totalValue };
}

export function generateLoot(typeKey) {
  const type = OSE_TYPES[typeKey];
  if (!type) return null;

  const coins = {};
  if (type.coins) {
    for (const [coin, [chance, dice, mult]] of Object.entries(type.coins)) {
      if (rollChance(chance)) coins[coin] = r(dice) * mult;
    }
  }

  let gems;
  if (type.gems) {
    const [chance, dice] = type.gems;
    if (rollChance(chance)) gems = rollGems(r(dice));
  }

  let jewelry;
  if (type.jewelry) {
    const [chance, dice] = type.jewelry;
    if (rollChance(chance)) jewelry = rollJewelry(r(dice));
  }

  const magicItems = [];
  if (type.magic) {
    const [chance, items] = type.magic;
    if (rollChance(chance)) {
      for (const cat of items) magicItems.push(rollMagicItem(cat));
    }
  }

  return {
    system: 'OSE',
    subtitle: type.label,
    coins,
    gems,
    jewelry,
    magicItems,
  };
}
