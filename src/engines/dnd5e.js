import { rollDice as r, rollD100, pickRandom } from './dice.js';

export function parseCR(cr) {
  if (cr === '1/8') return 0.125;
  if (cr === '1/4') return 0.25;
  if (cr === '1/2') return 0.5;
  return parseFloat(cr);
}

function getTier(cr) {
  const v = parseCR(cr);
  if (v <= 4) return 'low';
  if (v <= 10) return 'medium';
  if (v <= 16) return 'high';
  return 'legendary';
}

function rollCoins(tier) {
  const d = rollD100();
  switch (tier) {
    case 'low':
      if (d <= 30) return { cp: r('5d6') };
      if (d <= 60) return { sp: r('4d6') };
      if (d <= 70) return { ep: r('3d6') };
      if (d <= 95) return { gp: r('3d6') };
      return { pp: r('1d6') };
    case 'medium':
      if (d <= 30) return { cp: r('4d6') * 100, sp: r('1d6') * 10 };
      if (d <= 60) return { sp: r('6d6') * 10, gp: r('2d6') * 10 };
      if (d <= 70) return { ep: r('3d6') * 10, gp: r('2d6') * 10 };
      if (d <= 95) return { gp: r('4d6') * 10, pp: r('1d6') };
      return { gp: r('2d6') * 10, pp: r('3d6') };
    case 'high':
      if (d <= 20) return { sp: r('4d6') * 100, ep: r('1d6') * 10 };
      if (d <= 35) return { ep: r('1d6') * 100 };
      if (d <= 75) return { gp: r('4d6') * 100 };
      return { gp: r('2d6') * 100, pp: r('1d6') * 10 };
    case 'legendary':
      if (d <= 15) return { ep: r('2d6') * 1000, gp: r('8d6') * 100 };
      if (d <= 55) return { gp: r('1d6') * 1000, pp: r('1d6') * 100 };
      return { gp: r('1d6') * 1000, pp: r('2d6') * 100 };
  }
}

const TABLES = {
  A: ['Potion of Healing', 'Potion of Climbing', 'Spell Scroll (Cantrip)', 'Spell Scroll (1st Level)', 'Bag of 1,000 Ball Bearings', 'Sending Stones', 'Candle of Telling', 'Perfume of Bewitching', 'Cloak of Billowing', 'Enduring Spellbook', 'Wand of Conducting'],
  B: ['Potion of Greater Healing', 'Potion of Fire Breath', 'Potion of Resistance', 'Potion of Animal Friendship', 'Potion of Hill Giant Strength', 'Potion of Growth', 'Potion of Water Breathing', 'Spell Scroll (2nd Level)', 'Spell Scroll (3rd Level)', 'Bag of Tricks (Gray)', 'Bag of Tricks (Rust)', 'Boots of the Winterlands', 'Cloak of Protection', 'Deck of Illusions', 'Eyes of Charming', 'Gloves of Thievery', 'Headband of Intellect', 'Helm of Telepathy', 'Medallion of Thoughts', 'Necklace of Adaptation', 'Periapt of Wound Closure', 'Pipes of Haunting', 'Ring of Swimming'],
  C: ['Potion of Superior Healing', 'Potion of Clairvoyance', 'Potion of Gaseous Form', 'Potion of Frost Giant Strength', 'Potion of Heroism', 'Potion of Invulnerability', 'Potion of Mind Reading', 'Spell Scroll (4th Level)', 'Spell Scroll (5th Level)', 'Amulet of Health', 'Belt of Dwarvenkind', 'Belt of Hill Giant Strength', 'Boots of Levitation', 'Boots of Speed', 'Bracers of Defense', 'Brooch of Shielding', 'Broom of Flying', 'Chime of Opening', 'Cloak of Displacement', 'Cloak of the Bat', 'Cube of Force'],
  F: ['+1 Weapon', '+1 Weapon', '+1 Weapon', '+1 Shield', '+1 Shield', 'Sentinel Shield', 'Mithral Armor', 'Adamantine Armor', 'Javelin of Lightning', 'Trident of Fish Command', 'Pearl of Power', 'Slippers of Spider Climbing', 'Staff of the Adder', 'Staff of the Python', 'Sword of Vengeance', 'Wand of Magic Missiles', 'Wand of Web'],
  G: ['+2 Weapon', '+2 Weapon', '+2 Shield', '+2 Armor', 'Belt of Fire Giant Strength', 'Belt of Frost Giant Strength', 'Carpet of Flying', 'Crystal Ball', 'Ring of Regeneration', 'Ring of Shooting Stars', 'Ring of Telekinesis', 'Ring of the Ram', 'Ring of X-Ray Vision', 'Robe of Useful Items', 'Rope of Entanglement'],
  H: ['+3 Weapon', '+3 Shield', '+3 Armor', 'Potion of Supreme Healing', 'Potion of Storm Giant Strength', 'Spell Scroll (8th Level)', 'Amulet of the Planes', 'Efreeti Bottle', 'Iron Flask', 'Ring of Djinni Summoning', 'Ring of Elemental Command', 'Ring of Invisibility', 'Ring of Spell Storing', 'Ring of Three Wishes'],
  I: ['Apparatus of Kwalish', 'Armor of Invulnerability', 'Belt of Cloud Giant Strength', 'Belt of Storm Giant Strength', 'Cloak of Invisibility', 'Crystal Ball of True Seeing', 'Cubic Gate', 'Deck of Many Things', 'Defender', 'Holy Avenger', 'Luck Blade', 'Moonblade', 'Plate Armor of Etherealness', 'Robe of the Archmagi', 'Rod of Resurrection', 'Scarab of Protection', 'Sphere of Annihilation', 'Staff of the Magi', 'Vorpal Sword', 'Well of Many Worlds', 'Talisman of Pure Good', 'Talisman of Ultimate Evil'],
};

function rollMagicItems(tier) {
  const d = rollD100();
  switch (tier) {
    case 'low':
      return d >= 96 ? [pickRandom(TABLES.A)] : [];
    case 'medium':
      if (d <= 40) return [];
      if (d <= 65) return [pickRandom(TABLES.A)];
      if (d <= 80) return [pickRandom(TABLES.B)];
      if (d <= 90) return [pickRandom(TABLES.F)];
      if (d <= 95) return [pickRandom(TABLES.B), pickRandom(TABLES.F)];
      if (d <= 98) return [pickRandom(TABLES.C)];
      return [pickRandom(TABLES.G)];
    case 'high':
      if (d <= 20) return [];
      if (d <= 35) return [pickRandom(TABLES.B)];
      if (d <= 50) return [pickRandom(TABLES.C)];
      if (d <= 65) return [pickRandom(TABLES.G)];
      if (d <= 80) return [pickRandom(TABLES.C), pickRandom(TABLES.G)];
      if (d <= 90) return [pickRandom(TABLES.H)];
      if (d <= 98) return [pickRandom(TABLES.H), pickRandom(TABLES.G)];
      return [pickRandom(TABLES.I)];
    case 'legendary':
      if (d <= 15) return [pickRandom(TABLES.C), pickRandom(TABLES.G)];
      if (d <= 30) return [pickRandom(TABLES.C)];
      if (d <= 50) return [pickRandom(TABLES.H)];
      if (d <= 75) return [pickRandom(TABLES.H), pickRandom(TABLES.G)];
      if (d <= 85) return [pickRandom(TABLES.I)];
      if (d <= 95) return [pickRandom(TABLES.H), pickRandom(TABLES.I)];
      return [pickRandom(TABLES.I), pickRandom(TABLES.I)];
  }
}

export function generateLoot(cr) {
  const tier = getTier(cr);
  return {
    system: 'D&D 5e',
    subtitle: `CR ${cr}`,
    coins: rollCoins(tier),
    magicItems: rollMagicItems(tier),
  };
}

export const CR_VALUES = [
  '0', '1/8', '1/4', '1/2',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  '11', '12', '13', '14', '15', '16',
  '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
];
