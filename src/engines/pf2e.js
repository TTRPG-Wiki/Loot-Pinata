import { rollDice as r, rollChance, pickRandom } from './dice.js';

// Per-encounter treasure budget (single significant encounter ~10% of party-level total)
// Values approximated from PF2e GMG "Treasure by Level" table, divided by ~10 encounters
const ENCOUNTER_BUDGET_GP = {
  1: 17, 2: 30, 3: 50, 4: 85, 5: 135,
  6: 200, 7: 290, 8: 400, 9: 570, 10: 800,
  11: 1150, 12: 1650, 13: 2500, 14: 3650, 15: 5450,
  16: 8250, 17: 12800, 18: 20800, 19: 35500, 20: 49000,
};

// Variance: 0.6–1.4× the budget to spread loot
function variableBudget(lvl) {
  const base = ENCOUNTER_BUDGET_GP[lvl] ?? 50;
  return Math.floor(base * (0.6 + Math.random() * 0.8));
}

// Items grouped by item level, using actual PF2e item levels
// Source: AoN/PRD - approximating common-rarity items
const ITEMS_BY_LEVEL = {
  1: [
    'Bottled Lightning (Lvl 1)', 'Lesser Healing Potion (Lvl 1)', 'Lesser Holy Water (Lvl 1)',
    'Smokestick (Lvl 1)', 'Sunrod (Lvl 1)', 'Tindertwig (Lvl 1)',
    'Lesser Acid Flask (Lvl 1)', 'Lesser Alchemist\'s Fire (Lvl 1)',
    'Lesser Antidote (Lvl 1)', 'Lesser Antiplague (Lvl 1)',
    'Lesser Cheetah\'s Elixir (Lvl 1)', 'Lesser Eagle-Eye Elixir (Lvl 1)',
    'Lesser Bravo\'s Brew (Lvl 1)', 'Scroll of 1st-Rank Spell (Lvl 1)',
    'Snake Oil (Lvl 1)', 'Holy Water (Lvl 1)',
  ],
  2: [
    'Bag of Holding I (Lvl 4)', 'Coyote Cloak (Lvl 2)', 'Climbing Bolts (Lvl 2)',
    'Compass (Lvl 0)', 'Crying Angel Pendant (Lvl 2)', 'Hand of the Mage (Lvl 2)',
    'Indomitable Keepsake (Lvl 2)', 'Lesser Smokestick (Lvl 1)',
    'Lesser Sun Orchid Elixir (Lvl 2)', 'Scroll of 1st-Rank Spell (Lvl 1)',
    'Vine Arrow (Lvl 2)', 'Lesser Cognitive Mutagen (Lvl 2)',
  ],
  3: [
    'Lesser Cold Iron Buckler (Lvl 2)', 'Healing Potion (Lvl 3)', 'Wand of Heal 1st (Lvl 3)',
    'Wand of Magic Missile 1st (Lvl 3)', 'Scroll of 2nd-Rank Spell (Lvl 3)',
    'Aeon Stone (Dull Gray) (Lvl 3)', 'Goggles of Night (Lvl 5)',
    'Moderate Antidote (Lvl 6)', 'Hat of the Magi (Lvl 3)', 'Climber\'s Kit (Lvl 0)',
    'Demon Mask (Lvl 3)', 'Diadem of Intuition (Lvl 7)',
  ],
  4: [
    '+1 Weapon Potency Rune (Lvl 4)', 'Striking Rune (Lvl 4)',
    'Boots of Elvenkind (Lvl 4)', 'Bracelet of Dashing (Lvl 4)',
    'Cape of the Mountebank (Lvl 4)', 'Daredevil Boots (Lvl 4)',
    'Cloak of Elvenkind (Lvl 5)', 'Necklace of Fireballs II (Lvl 4)',
    'Glasses of Comprehension (Lvl 4)', 'Greater Antidote (Lvl 9)',
    'Wand of Continuation 1st (Lvl 4)', 'Crystal Ball (Clear Quartz) (Lvl 10)',
  ],
  5: [
    '+1 Armor Potency Rune (Lvl 5)', 'Moderate Healing Potion (Lvl 6)',
    'Boots of Bounding (Lvl 5)', 'Goggles of Night (Lvl 5)',
    'Greater Coyote Cloak (Lvl 5)', 'Holy Avenger Variant (Lvl 5)',
    'Pendant of the Occult (Lvl 5)', 'Pipe of the Pied Piper (Lvl 5)',
    'Resilient Rune (Lvl 8)', 'Wand of Heal 2nd (Lvl 6)',
    'Ring of the Ram (Lvl 6)', 'Scroll of 3rd-Rank Spell (Lvl 5)',
  ],
  6: [
    'Moderate Healing Potion (Lvl 6)', 'Bracers of Missile Deflection (Lvl 6)',
    'Demon Mask (Greater) (Lvl 6)', 'Eyes of the Eagle (Lvl 7)',
    'Belt of Regeneration (Lvl 13)', 'Necklace of Strangulation (Lvl 6)',
    'Lesser Bag of Devouring (Lvl 6)', 'Wand of Manifold Missiles 3rd (Lvl 7)',
    'Forge Warden (Lvl 6)', 'Cloak of the Bat (Lvl 9)',
  ],
  7: [
    'Bag of Holding II (Lvl 7)', 'Belt of Giant Strength (Lvl 11)',
    'Diadem of Intuition (Lvl 7)', 'Greater Eyes of the Eagle (Lvl 7)',
    'Greater Coyote Cloak (Lvl 7)', 'Aeon Stone (Pale Lavender) (Lvl 7)',
    'Major Bag of Tricks (Lvl 7)', 'Lifting Belt (Lvl 4)',
    '+1 Striking Weapon (Lvl 4)', 'Wand of Fireball 3rd (Lvl 7)',
  ],
  8: [
    'Greater Cloak of Elvenkind (Lvl 9)', '+1 Resilient Armor (Lvl 8)',
    'Major Resilient Rune (Lvl 14)', 'Mantle of the Predator (Lvl 14)',
    'Moderate Sun Orchid Elixir (Lvl 8)', 'Daredevil Boots (Greater) (Lvl 11)',
    'Belt of the Five Kings (Lvl 8)', 'Wand of Slow 3rd (Lvl 7)',
  ],
  9: [
    'Greater Healing Potion (Lvl 9)', 'Cloak of the Bat (Lvl 9)',
    'Aeon Stone (Western Star) (Lvl 9)', 'Greater Boots of Bounding (Lvl 9)',
    'Mirror Cape (Lvl 9)', 'Voyager\'s Pack (Lvl 7)',
    'Greater Quicksilver Mutagen (Lvl 9)', 'Scroll of 5th-Rank Spell (Lvl 9)',
  ],
  10: [
    '+2 Weapon Potency Rune (Lvl 10)', 'Crystal Ball (Selenite) (Lvl 10)',
    'Bag of Holding III (Lvl 11)', 'Cloak of Resistance (Lvl 8)',
    'Greater Bracers of Missile Deflection (Lvl 11)', 'Wand of Wall of Fire 4th (Lvl 9)',
    'Major Forge Warden (Lvl 10)', 'Sleeves of Storage (Lvl 9)',
  ],
  11: [
    '+2 Resilient Armor (Lvl 11)', 'Belt of Giant Strength (Lvl 11)',
    'Major Daredevil Boots (Lvl 11)', 'Ring of Wizardry I (Lvl 10)',
    'Greater Goggles of Night (Lvl 9)', 'Greater Cloak of the Bat (Lvl 13)',
    'Wand of Lightning Bolt 4th (Lvl 9)', 'Aeon Stone (Tourmaline Sphere) (Lvl 11)',
  ],
  12: [
    'Major Healing Potion (Lvl 12)', 'Boots of Speed (Lvl 12)',
    'Greater Striking Rune (Lvl 12)', 'Greater Resilient Rune (Lvl 14)',
    'Wand of Fireball 5th (Lvl 13)', 'Greater Mirror Cape (Lvl 13)',
    'Scroll of 6th-Rank Spell (Lvl 11)', 'Greater Hat of the Magi (Lvl 11)',
  ],
  13: [
    'Cloak of the Bat (Lvl 13)', 'Greater Belt of Giant Strength (Lvl 13)',
    'Crystal Ball (Moonstone) (Lvl 13)', 'Major Bag of Holding IV (Lvl 15)',
    'Greater Cloak of Resistance (Lvl 14)', 'Wand of Disintegrate 6th (Lvl 13)',
    'Boots of Free Running (Lvl 13)', 'Greater Quicksilver Mutagen (Lvl 12)',
  ],
  14: [
    '+2 Greater Resilient Armor (Lvl 14)', 'Mantle of the Predator (Lvl 14)',
    'Greater Pipe of the Pied Piper (Lvl 14)', 'Wand of Heal 7th (Lvl 14)',
    'Major Cloak of Resistance (Lvl 14)', 'Skeleton Key (Lvl 16)',
    'Aeon Stone (Orange Prism) (Lvl 14)', 'Voyager\'s Pack (Lvl 7)',
  ],
  15: [
    'Bag of Holding IV (Lvl 15)', 'True Healing Potion (Lvl 19)',
    'Crystal Ball (Peridot) (Lvl 16)', 'Greater Crown of the Companion (Lvl 15)',
    'Wand of Wall of Stone 5th (Lvl 11)', 'Glasses of Comprehension (Greater) (Lvl 15)',
    'Greater Ring of Wizardry (Lvl 16)', 'Holy Avenger (Lvl 18)',
  ],
  16: [
    '+3 Weapon Potency Rune (Lvl 16)', 'Skeleton Key (Lvl 16)',
    'Greater Crystal Ball (Lvl 16)', 'Boots of Speed (Greater) (Lvl 16)',
    'Major Ring of Wizardry (Lvl 16)', 'Major Belt of Giant Strength (Lvl 17)',
    'Wand of Fireball 7th (Lvl 15)', 'Greater Skull of the Drinker (Lvl 16)',
  ],
  17: [
    'Major Belt of Giant Strength (Lvl 17)', 'Major Crown of the Companion (Lvl 17)',
    'Aeon Stone (Ellipsoid) (Lvl 17)', 'Major Pipe of the Pied Piper (Lvl 17)',
    'Wand of Cone of Cold 7th (Lvl 15)', 'Major Cape of the Mountebank (Lvl 17)',
    'Major Mantle of the Predator (Lvl 17)', '+3 Major Striking Weapon (Lvl 19)',
  ],
  18: [
    'Holy Avenger (Lvl 18)', '+3 Major Resilient Armor (Lvl 18)',
    'Wand of Heal 9th (Lvl 18)', 'Apparatus of Kwalish (Lvl 18)',
    'Belt of the Five Kings (Major) (Lvl 18)', 'Major Cloak of the Bat (Lvl 18)',
    'Sun Orchid Elixir (Lvl 18)', 'Robe of the Archmagi (Lvl 18)',
  ],
  19: [
    'True Healing Potion (Lvl 19)', '+3 Major Striking Weapon (Lvl 19)',
    'Tome of the Stilled Tongue (Lvl 19)', 'Major Ring of Wizardry (Lvl 19)',
    'Crystal Ball of True Seeing (Lvl 19)', 'Wand of Disintegrate 9th (Lvl 19)',
    'Sphere of Annihilation (Lvl 20)', 'Cubic Gate (Lvl 19)',
  ],
  20: [
    'Orb of Dragonkind (Lvl 20)', 'Sphere of Annihilation (Lvl 20)',
    'Major Healing Potion (True) (Lvl 19)', 'Major Major Striking Weapon (Lvl 20)',
    'Major Major Resilient Armor (Lvl 20)', 'Deck of Many Things (Lvl 20)',
    'Staff of the Magi (Lvl 20)', 'Vorpal Sword (Lvl 20)',
  ],
};

// Pull items of appropriate level (party_level - 2 to party_level + 1 mix per PF2e GMG)
function pickItemsForLevel(level, count) {
  const candidates = [];
  for (let l = Math.max(1, level - 2); l <= Math.min(20, level + 1); l++) {
    if (ITEMS_BY_LEVEL[l]) candidates.push(...ITEMS_BY_LEVEL[l]);
  }
  const picks = [];
  for (let i = 0; i < count; i++) {
    if (candidates.length) picks.push(pickRandom(candidates));
  }
  return picks;
}

// Probability of items by level (per GMG encounter treasure distribution)
function rollItemCount(level) {
  const d = Math.random();
  if (level <= 3) return d < 0.4 ? 1 : 0;
  if (level <= 6) return d < 0.5 ? 1 : (d < 0.7 ? 2 : 0);
  if (level <= 10) return d < 0.4 ? 1 : (d < 0.85 ? 2 : 0);
  if (level <= 14) return d < 0.3 ? 1 : (d < 0.7 ? 2 : (d < 0.95 ? 3 : 0));
  if (level <= 18) return d < 0.2 ? 2 : (d < 0.7 ? 3 : 4);
  return d < 0.5 ? 3 : 4;
}

export function generateLoot(level) {
  const lvl = parseInt(level, 10);
  const budgetGp = variableBudget(lvl);

  // Distribute coins. Low levels still see CP/SP; mid levels GP; high levels GP/PP
  const coins = {};
  if (lvl <= 2) {
    coins.cp = Math.floor(budgetGp * 0.3) * 10;
    coins.sp = Math.floor(budgetGp * 0.4) * 5;
    coins.gp = Math.floor(budgetGp * 0.3);
  } else if (lvl <= 6) {
    coins.sp = Math.floor(budgetGp * 0.25) * 10;
    coins.gp = Math.floor(budgetGp * 0.75);
  } else if (lvl <= 12) {
    coins.gp = Math.floor(budgetGp * 0.9);
    coins.pp = Math.floor(budgetGp * 0.01);
  } else {
    coins.gp = Math.floor(budgetGp * 0.5);
    coins.pp = Math.floor(budgetGp * 0.005);
  }

  // Strip zero entries
  for (const k of Object.keys(coins)) if (!coins[k]) delete coins[k];

  const itemCount = rollItemCount(lvl);
  const magicItems = pickItemsForLevel(lvl, itemCount);

  return {
    system: 'Pathfinder 2e',
    subtitle: `Level ${lvl} (≈${budgetGp} gp budget)`,
    coins,
    magicItems,
  };
}

export const PF2E_LEVELS = Array.from({ length: 20 }, (_, i) => String(i + 1));
