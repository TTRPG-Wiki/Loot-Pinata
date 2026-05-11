import { rollDice as r, rollChance, pickRandom } from './dice.js';

// Approximate per-encounter currency values, based on PF2e GMG treasure-by-level
const COIN_FORMULAS = {
  1: '1d6+5', 2: '2d6+8', 3: '3d6+12', 4: '4d6+15', 5: '5d6+20',
  6: '5d6+30', 7: '6d10+50', 8: '8d10+70', 9: '10d10+100', 10: '12d10+150',
  11: '15d20+200', 12: '18d20+300', 13: '22d20+450', 14: '25d20+700',
  15: '30d20+1000', 16: '40d20+1500', 17: '50d20+2500', 18: '80d20+4000',
  19: '100d20+6500', 20: '150d20+10000',
};

const ITEMS = {
  '1-3': [
    'Bottled Lightning (Lvl 1)', 'Lesser Healing Potion (Lvl 1)', 'Lesser Holy Water Vial (Lvl 1)',
    'Smokestick (Lvl 1)', 'Sunrod (Lvl 1)', 'Lesser Tanglefoot Bag (Lvl 1)',
    'Lesser Acid Flask (Lvl 1)', 'Lesser Alchemist\'s Fire (Lvl 1)',
    'Magnifying Glass (Lvl 0)', 'Spyglass (Lvl 0)', 'Wand of Heal (Cantrip)',
    'Scroll of 1st-Level Spell', 'Climbing Kit', 'Coyote Cloak (Lvl 2)',
    'Boots of Elvenkind (Lvl 4)', 'Daredevil Boots (Lvl 4)',
  ],
  '4-6': [
    '+1 Weapon Potency Rune (Lvl 4)', '+1 Armor Potency Rune (Lvl 5)',
    'Moderate Healing Potion (Lvl 6)', 'Bag of Holding I (Lvl 4)',
    'Cloak of Elvenkind (Lvl 5)', 'Cape of the Mountebank (Lvl 5)',
    'Goggles of Night (Lvl 5)', 'Wand of Magic Missile (1st)',
    'Ring of Energy Resistance (Lvl 6)', 'Bracers of Missile Deflection (Lvl 6)',
    'Striking Rune (Lvl 4)', 'Resilient Rune (Lvl 8)',
    'Greater Tanglefoot Bag (Lvl 5)', 'Greater Alchemist\'s Fire (Lvl 5)',
  ],
  '7-9': [
    'Greater Healing Potion (Lvl 9)', '+1 Striking Weapon (Lvl 4)',
    '+1 Resilient Armor (Lvl 8)', 'Bag of Holding II (Lvl 7)',
    'Belt of Giant Strength (Lvl 9)', 'Cloak of Resistance (Lvl 8)',
    'Eyes of the Eagle (Lvl 7)', 'Greater Cloak of Elvenkind (Lvl 9)',
    'Greater Boots of Bounding (Lvl 9)', 'Wand of Fireball (3rd)',
    'Necklace of Fireballs II (Lvl 7)', 'Mirror Cape (Lvl 9)',
    'Voyager\'s Pack (Lvl 7)', 'Aeon Stone (Lvl 9)',
  ],
  '10-12': [
    'Major Healing Potion (Lvl 12)', '+2 Striking Weapon (Lvl 10)',
    '+2 Resilient Armor (Lvl 11)', 'Bag of Holding III (Lvl 11)',
    'Boots of Speed (Lvl 12)', 'Wand of Lightning Bolt (Lvl 9)',
    'Greater Cloak of the Bat (Lvl 12)', 'Greater Belt of Giant Strength (Lvl 11)',
    'Greater Bracers of Armor (Lvl 11)', 'Greater Goggles of Night (Lvl 9)',
    'Daredevil Boots (Major) (Lvl 11)', 'Ring of Wizardry I (Lvl 10)',
  ],
  '13-16': [
    'True Healing Potion (Lvl 19)', '+3 Striking Weapon (Lvl 16)',
    '+3 Greater Resilient Armor (Lvl 14)', 'Bag of Holding IV (Lvl 15)',
    'Boots of Free Running (Lvl 13)', 'Cloak of the Bat (Lvl 13)',
    'Wand of Fireball (5th) (Lvl 13)', 'Greater Belt of Giant Strength (Lvl 14)',
    'Major Cloak of Resistance (Lvl 14)', 'Mantle of the Predator (Lvl 14)',
    'Skeleton Key (Lvl 16)', 'Major Bag of Holding (Lvl 15)',
  ],
  '17-20': [
    '+3 Major Striking Weapon (Lvl 19)', '+3 Major Resilient Armor (Lvl 18)',
    'Orb of Dragonkind (Lvl 20)', 'Holy Avenger (Lvl 18)',
    'Apparatus of Kwalish (Lvl 18)', 'Sphere of Annihilation (Lvl 20)',
    'Ring of Wizardry IV (Lvl 19)', 'Tome of the Stilled Tongue (Lvl 19)',
    'True Healing Potion (Lvl 19)', 'Cloak of the Mountebank (Major) (Lvl 18)',
    'Belt of Giant Strength (Major) (Lvl 17)', 'Crown of the Companion (Lvl 19)',
  ],
};

function itemTierFor(level) {
  if (level <= 3) return '1-3';
  if (level <= 6) return '4-6';
  if (level <= 9) return '7-9';
  if (level <= 12) return '10-12';
  if (level <= 16) return '13-16';
  return '17-20';
}

function itemChanceFor(level) {
  if (level <= 3) return [30, 1];
  if (level <= 6) return [55, 1];
  if (level <= 9) return [75, 2];
  if (level <= 12) return [85, 2];
  if (level <= 16) return [95, 3];
  return [100, 3];
}

export function generateLoot(level) {
  const lvl = parseInt(level, 10);
  const gp = r(COIN_FORMULAS[lvl] || '1d6');

  // Lower levels keep some silver/copper in the mix; higher levels are GP-only
  const coins = {};
  if (lvl <= 3) {
    coins.cp = r('2d6') * 10;
    coins.sp = r('2d6') * 5;
    coins.gp = gp;
  } else if (lvl <= 6) {
    coins.sp = r('3d6') * 10;
    coins.gp = gp;
  } else {
    coins.gp = gp;
    if (lvl >= 11) coins.pp = Math.floor(gp / 100);
  }

  const tier = itemTierFor(lvl);
  const [chance, maxItems] = itemChanceFor(lvl);
  const magicItems = [];
  if (rollChance(chance)) {
    const numItems = 1 + Math.floor(Math.random() * maxItems);
    for (let i = 0; i < numItems; i++) magicItems.push(pickRandom(ITEMS[tier]));
  }

  return {
    system: 'Pathfinder 2e',
    subtitle: `Level ${lvl}`,
    coins,
    magicItems,
  };
}

export const PF2E_LEVELS = Array.from({ length: 20 }, (_, i) => String(i + 1));
