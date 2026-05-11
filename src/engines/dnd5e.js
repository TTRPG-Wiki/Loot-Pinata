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

// ──────────── INDIVIDUAL TREASURE (DMG p.136-137) ────────────
function rollIndividualCoins(tier) {
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

// ──────────── HOARD TREASURE (DMG p.137-139) ────────────
function rollHoardCoins(tier) {
  switch (tier) {
    case 'low':
      return { cp: r('6d6') * 100, sp: r('3d6') * 100, gp: r('2d6') * 10 };
    case 'medium':
      return { cp: r('2d6') * 100, sp: r('2d6') * 1000, gp: r('6d6') * 100, pp: r('3d6') * 10 };
    case 'high':
      return { gp: r('4d6') * 1000, pp: r('5d6') * 100 };
    case 'legendary':
      return { gp: r('12d6') * 1000, pp: r('8d6') * 1000 };
  }
}

const GEM_VALUES = {
  '10gp': ['Azurite', 'Banded agate', 'Blue quartz', 'Eye agate', 'Hematite', 'Lapis lazuli', 'Malachite', 'Moss agate', 'Obsidian', 'Rhodochrosite', 'Tigereye', 'Turquoise'],
  '50gp': ['Bloodstone', 'Carnelian', 'Chalcedony', 'Chrysoprase', 'Citrine', 'Jasper', 'Moonstone', 'Onyx', 'Quartz', 'Sardonyx', 'Star rose quartz', 'Zircon'],
  '100gp': ['Amber', 'Amethyst', 'Chrysoberyl', 'Coral', 'Garnet', 'Jade', 'Jet', 'Pearl', 'Spinel', 'Tourmaline'],
  '500gp': ['Alexandrite', 'Aquamarine', 'Black pearl', 'Blue spinel', 'Peridot', 'Topaz'],
  '1000gp': ['Black opal', 'Blue sapphire', 'Emerald', 'Fire opal', 'Opal', 'Star ruby', 'Star sapphire', 'Yellow sapphire'],
  '5000gp': ['Black sapphire', 'Diamond', 'Jacinth', 'Ruby'],
};

const ART_OBJECTS = {
  '25gp': ['Silver ewer', 'Carved bone statuette', 'Small gold bracelet', 'Cloth-of-gold vestments', 'Black velvet mask stitched with silver thread', 'Copper chalice with silver filigree', 'Pair of engraved bone dice', 'Small mirror set in painted wooden frame', 'Embroidered silk handkerchief', 'Gold locket with painted miniature inside'],
  '250gp': ['Gold ring set with bloodstones', 'Carved ivory statuette', 'Large gold bracelet', 'Silver necklace with gemstone pendant', 'Bronze crown', 'Silk robe with gold embroidery', 'Large well-made tapestry', 'Brass mug with jade inlay', 'Box of turquoise animal figurines', 'Gold bird cage with electrum filigree'],
  '750gp': ['Silver chalice set with moonstones', 'Silver-plated steel longsword with jet jewel in pommel', 'Carved harp of exotic wood with ivory inlay and zircon gems', 'Small gold idol', 'Gold dragon comb set with red garnets as eyes', 'Bottle stopper cork embossed with gold leaf and set with amethysts', 'Ceremonial electrum dagger with black pearl in the pommel', 'Silver and gold brooch', 'Obsidian statuette with gold fittings and inlay', 'Painted gold war mask'],
  '2500gp': ['Fine gold chain set with a fire opal', 'Old masterpiece painting', 'Embroidered silk and velvet mantle set with numerous moonstones', 'Platinum bracelet set with a sapphire', 'Embroidered glove set with jewel chips', 'Jeweled anklet', 'Gold music box', 'Gold circlet set with four aquamarines', 'Eye patch with a mock eye set in blue sapphire and moonstone', 'Necklace string of small pink pearls'],
  '7500gp': ['Jeweled gold crown', 'Jeweled platinum ring', 'Small gold statuette set with rubies', 'Gold cup set with emeralds', 'Gold jewelry box with platinum filigree', "Painted gold child's sarcophagus", 'Jade game board with solid gold playing pieces', 'Bejeweled ivory drinking horn with gold filigree'],
};

function rollGems(value, dice) {
  const count = r(dice);
  const totalValue = count * parseInt(value);
  const items = [{ value: parseInt(value), count, name: pickRandom(GEM_VALUES[value]) }];
  return { count, items, totalValue };
}

function rollArt(value, dice) {
  const count = r(dice);
  const totalValue = count * parseInt(value);
  const items = [];
  for (let i = 0; i < Math.min(count, 8); i++) {
    items.push({ description: pickRandom(ART_OBJECTS[value]), value: parseInt(value) });
  }
  return { count, items, totalValue, label: 'Art Objects' };
}

const TABLES = {
  A: [
    'Potion of Healing', 'Potion of Healing', 'Potion of Climbing', 'Spell Scroll (Cantrip)',
    'Spell Scroll (1st Level)', 'Spell Scroll (1st Level)', 'Spell Scroll (2nd Level)',
    'Spell Scroll (3rd Level)', 'Sending Stones', 'Bag of 1,000 Ball Bearings', 'Bag of 100 Caltrops',
    'Candle of Telling', 'Perfume of Bewitching', 'Cloak of Billowing', 'Cloak of Many Fashions',
    'Cloak of Comfort', 'Clothes of Mending', 'Enduring Spellbook', 'Hat of Vermin', 'Mystery Key',
    'Wand of Conducting', 'Wand of Pyrotechnics', 'Wand of Smiles', 'Walloping Ammunition',
    'Boots of False Tracks', 'Charlatan\'s Die', 'Pole of Angling', 'Ruby of the War Mage',
    'Talking Doll', 'Driftglobe', 'Heward\'s Handy Spice Pouch', 'Goggles of Night',
  ],
  B: [
    'Potion of Greater Healing', 'Potion of Fire Breath', 'Potion of Resistance',
    'Potion of Animal Friendship', 'Potion of Hill Giant Strength', 'Potion of Growth',
    'Potion of Water Breathing', 'Spell Scroll (2nd Level)', 'Spell Scroll (3rd Level)',
    'Spell Scroll (4th Level)', 'Spell Scroll (5th Level)', 'Bag of Holding',
    'Bag of Tricks (Gray)', 'Bag of Tricks (Rust)', 'Bag of Tricks (Tan)',
    'Boots of Elvenkind', 'Boots of Striding and Springing', 'Boots of the Winterlands',
    'Bracers of Archery', 'Brooch of Shielding', 'Broom of Flying', 'Cloak of Elvenkind',
    'Cloak of Protection', 'Cloak of the Manta Ray', 'Decanter of Endless Water',
    'Deck of Illusions', 'Driftglobe', 'Dust of Disappearance', 'Dust of Dryness',
    'Dust of Sneezing and Choking', 'Elemental Gem', 'Eyes of Charming', 'Eyes of the Eagle',
    'Figurine of Wondrous Power (Silver Raven)', 'Gauntlets of Ogre Power', 'Gem of Brightness',
    'Gloves of Missile Snaring', 'Gloves of Swimming and Climbing', 'Gloves of Thievery',
    'Hat of Disguise', 'Headband of Intellect', 'Helm of Comprehending Languages',
    'Helm of Telepathy', 'Immovable Rod', 'Lantern of Revealing', 'Mariner\'s Armor',
    'Medallion of Thoughts', 'Necklace of Adaptation', 'Pearl of Power', 'Periapt of Health',
    'Periapt of Wound Closure', 'Pipes of Haunting', 'Pipes of the Sewers', 'Quiver of Ehlonna',
    'Ring of Jumping', 'Ring of Mind Shielding', 'Ring of Swimming', 'Ring of Warmth',
    'Ring of Water Walking', 'Rope of Climbing', 'Saddle of the Cavalier', 'Sentinel Shield',
    'Slippers of Spider Climbing', 'Stone of Good Luck', 'Wand of Magic Detection',
    'Wand of Secrets', 'Wand of Web', 'Weapon of Warning', 'Wind Fan', 'Winged Boots',
  ],
  C: [
    'Potion of Superior Healing', 'Spell Scroll (6th Level)', 'Potion of Clairvoyance',
    'Potion of Diminution', 'Potion of Gaseous Form', 'Potion of Frost Giant Strength',
    'Potion of Stone Giant Strength', 'Potion of Heroism', 'Potion of Invulnerability',
    'Potion of Mind Reading', 'Spell Scroll (7th Level)', 'Amulet of Proof Against Detection',
    'Amulet of Health', 'Armor of Vulnerability', 'Arrow-Catching Shield', 'Belt of Dwarvenkind',
    'Belt of Hill Giant Strength', 'Berserker Axe', 'Boots of Levitation', 'Boots of Speed',
    'Bowl of Commanding Water Elementals', 'Bracers of Defense', 'Brazier of Commanding Fire Elementals',
    'Cape of the Mountebank', 'Censer of Controlling Air Elementals', 'Armor +1 (Chain Mail)',
    'Armor of Resistance', 'Chime of Opening', 'Cloak of Displacement', 'Cloak of the Bat',
    'Cube of Force', 'Daern\'s Instant Fortress', 'Dagger of Venom', 'Dimensional Shackles',
    'Dragon Slayer', 'Elven Chain', 'Flame Tongue', 'Gem of Seeing', 'Giant Slayer',
    'Glamoured Studded Leather', 'Helm of Teleportation', 'Horn of Blasting', 'Horn of Valhalla (Silver)',
    'Instrument of the Bards (Doss Lute)', 'Ioun Stone (Awareness)', 'Iron Bands of Bilarro',
    'Mace of Disruption', 'Mace of Smiting', 'Mace of Terror', 'Mantle of Spell Resistance',
    'Necklace of Prayer Beads', 'Periapt of Proof Against Poison', 'Ring of Animal Influence',
    'Ring of Evasion', 'Ring of Feather Falling', 'Ring of Free Action', 'Ring of Protection',
    'Ring of Resistance', 'Ring of Spell Storing', 'Ring of the Ram', 'Robe of Eyes',
    'Rod of Rulership', 'Rod of the Pact Keeper +2', 'Rope of Entanglement', 'Armor +1 (Scale Mail)',
    'Shield +1', 'Shield of Missile Attraction', 'Stone of Controlling Earth Elementals',
    'Sun Blade', 'Sword of Life Stealing', 'Sword of Wounding', 'Tentacle Rod',
    'Vicious Weapon', 'Wand of Binding', 'Wand of Enemy Detection', 'Wand of Fear',
    'Wand of Fireballs', 'Wand of Lightning Bolts', 'Wand of Paralysis', 'Wand of the War Mage +2',
    'Wand of Wonder', 'Wings of Flying',
  ],
  D: [
    'Potion of Supreme Healing', 'Potion of Invisibility', 'Potion of Speed',
    'Spell Scroll (8th Level)', 'Potion of Cloud Giant Strength', 'Potion of Longevity',
    'Potion of Vitality', 'Spell Scroll (9th Level)', 'Potion of Storm Giant Strength',
    'Armor +2 (Half Plate)', 'Armor +2 (Plate)', 'Belt of Fire Giant Strength',
    'Dwarven Thrower', 'Frost Brand', 'Helm of Brilliance', 'Horn of Valhalla (Brass)',
    'Instrument of the Bards (Anstruth Harp)', 'Ioun Stone (Absorption)', 'Ioun Stone (Agility)',
    'Ioun Stone (Fortitude)', 'Ioun Stone (Insight)', 'Ioun Stone (Intellect)',
    'Ioun Stone (Leadership)', 'Ioun Stone (Strength)', 'Plate Armor of Etherealness',
    'Manual of Bodily Health', 'Manual of Gainful Exercise', 'Manual of Golems',
    'Manual of Quickness of Action', 'Mirror of Life Trapping', 'Nine Lives Stealer',
    'Oathbow', 'Armor +2 (Scale Mail)', 'Spellguard Shield', 'Tome of Clear Thought',
    'Tome of Leadership and Influence', 'Tome of Understanding', 'Horn of Valhalla (Bronze)',
  ],
  E: [
    'Spell Scroll (8th Level)', 'Potion of Storm Giant Strength', 'Potion of Supreme Healing',
    'Spell Scroll (9th Level)', 'Universal Solvent', 'Armor +3 (Studded Leather)',
    'Armor +3 (Breastplate)', 'Candle of Invocation', 'Armor +3 (Chain Mail)',
    'Armor +3 (Chain Shirt)', 'Cloak of Invisibility', 'Crystal Ball (Very Rare)',
    'Armor +1 (Half Plate)', 'Iron Flask', 'Armor +3 (Leather)', 'Armor of Invulnerability',
    'Belt of Cloud Giant Strength', 'Armor +2 (Breastplate)', 'Candle of Invocation',
    'Armor +3 (Splint)', 'Horn of Valhalla (Iron)', 'Instrument of the Bards (Ollamh Harp)',
    'Ioun Stone (Greater Absorption)', 'Ioun Stone (Mastery)', 'Ioun Stone (Regeneration)',
    'Belt of Storm Giant Strength', 'Robe of the Archmagi', 'Rod of Resurrection',
    'Armor +1 (Scale Mail)', 'Scarab of Protection', 'Armor +2 (Plate)',
    'Tome of the Stilled Tongue',
  ],
  F: [
    'Weapon +1', 'Weapon +1', 'Weapon +1', 'Weapon +1', 'Weapon +1', 'Weapon +1',
    'Shield +1', 'Sentinel Shield', 'Mithral Armor (Light)', 'Mithral Armor (Medium)',
    'Adamantine Armor (Light)', 'Adamantine Armor (Medium)', 'Adamantine Armor (Heavy)',
    'Javelin of Lightning', 'Pearl of Power', 'Rod of the Pact Keeper +1',
    'Slippers of Spider Climbing', 'Staff of the Adder', 'Staff of the Python',
    'Sword of Vengeance', 'Trident of Fish Command', 'Wand of Magic Missiles',
    'Wand of the War Mage +1', 'Wand of Web', 'Weapon of Warning', 'Bag of Beans',
    'Cap of Water Breathing', 'Cloak of the Manta Ray', 'Driftglobe', 'Goggles of Night',
    'Helm of Comprehending Languages', 'Lantern of Revealing', 'Boots of Striding and Springing',
    'Bracers of Archery', 'Cloak of Elvenkind', 'Necklace of Fireballs', 'Periapt of Health',
    'Periapt of Wound Closure', 'Quiver of Ehlonna', 'Stone of Good Luck',
  ],
  G: [
    'Weapon +2', 'Weapon +2', 'Weapon +2', 'Weapon +2', 'Shield +2', 'Shield +2',
    'Armor +2 (Chain Shirt)', 'Armor +2 (Leather)', 'Armor +2 (Breastplate)',
    'Belt of Fire Giant Strength', 'Belt of Frost Giant Strength', 'Belt of Stone Giant Strength',
    'Carpet of Flying', 'Crystal Ball', 'Ring of Regeneration', 'Ring of Shooting Stars',
    'Ring of Telekinesis', 'Ring of the Ram', 'Ring of X-Ray Vision', 'Robe of Useful Items',
    'Robe of Scintillating Colors', 'Rope of Entanglement', 'Wand of Fireballs',
    'Wand of Lightning Bolts', 'Wand of Polymorph', 'Wand of the War Mage +2',
    'Wand of Wonder', 'Wings of Flying', 'Boots of Levitation', 'Boots of Speed',
    'Cloak of Displacement', 'Censer of Controlling Air Elementals', 'Dagger of Venom',
    'Dragon Slayer', 'Frost Brand', 'Giant Slayer', 'Mace of Disruption',
    'Sun Blade', 'Sword of Life Stealing',
  ],
  H: [
    'Weapon +3', 'Weapon +3', 'Weapon +3', 'Shield +3', 'Armor +3 (Plate)',
    'Armor +3 (Splint)', 'Potion of Supreme Healing', 'Potion of Storm Giant Strength',
    'Potion of Cloud Giant Strength', 'Potion of Fire Giant Strength', 'Spell Scroll (8th Level)',
    'Amulet of the Planes', 'Carpet of Flying (Large)', 'Crystal Ball of Mind Reading',
    'Crystal Ball of Telepathy', 'Crystal Ball of True Seeing', 'Efreeti Bottle',
    'Iron Flask', 'Ring of Djinni Summoning', 'Ring of Elemental Command',
    'Ring of Invisibility', 'Ring of Spell Storing', 'Ring of Spell Turning',
    'Ring of Telekinesis', 'Robe of Scintillating Colors', 'Robe of Stars',
    'Rod of Lordly Might', 'Rod of the Pact Keeper +3', 'Wand of the War Mage +3',
    'Belt of Cloud Giant Strength', 'Belt of Storm Giant Strength', 'Dwarven Plate',
    'Mirror of Life Trapping', 'Nine Lives Stealer', 'Oathbow',
  ],
  I: [
    'Apparatus of Kwalish', 'Armor of Invulnerability', 'Belt of Cloud Giant Strength',
    'Belt of Storm Giant Strength', 'Cloak of Invisibility', 'Crystal Ball of True Seeing',
    'Cubic Gate', 'Deck of Many Things', 'Defender', 'Dragon Scale Mail',
    'Dwarven Thrower', 'Efreeti Chain', 'Hammer of Thunderbolts', 'Holy Avenger',
    'Horn of Valhalla (Iron)', 'Instrument of the Bards (Ollamh Harp)',
    'Ioun Stone (Greater Absorption)', 'Ioun Stone (Mastery)', 'Ioun Stone (Regeneration)',
    'Luck Blade', 'Moonblade', 'Plate Armor of Etherealness', 'Ring of Air Elemental Command',
    'Ring of Djinni Summoning', 'Ring of Earth Elemental Command', 'Ring of Fire Elemental Command',
    'Ring of Three Wishes', 'Ring of Water Elemental Command', 'Robe of the Archmagi',
    'Rod of Resurrection', 'Scarab of Protection', 'Sovereign Glue', 'Sphere of Annihilation',
    'Staff of the Magi', 'Sword of Answering', 'Talisman of Pure Good', 'Talisman of the Sphere',
    'Talisman of Ultimate Evil', 'Tome of the Stilled Tongue', 'Universal Solvent',
    'Vorpal Sword', 'Well of Many Worlds',
  ],
};

function rollMagicItemsIndividual(tier) {
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
      if (d <= 30) return [pickRandom(TABLES.D)];
      if (d <= 50) return [pickRandom(TABLES.H)];
      if (d <= 75) return [pickRandom(TABLES.H), pickRandom(TABLES.G)];
      if (d <= 85) return [pickRandom(TABLES.E)];
      if (d <= 95) return [pickRandom(TABLES.H), pickRandom(TABLES.I)];
      return [pickRandom(TABLES.I), pickRandom(TABLES.I)];
  }
}

// ──────────── HOARD: gems, art, magic items based on DMG hoard tables ────────────
function rollHoardExtras(tier) {
  const d = rollD100();
  let gems, art, magicItems = [];

  if (tier === 'low') {
    if (d <= 6) {} // nothing
    else if (d <= 16) gems = rollGems('10gp', '2d6');
    else if (d <= 26) gems = rollGems('25gp'.replace('25', '10'), '2d4'); // 25gp simplified - use 10gp pool x2.5
    else if (d <= 36) art = rollArt('25gp', '2d4');
    else if (d <= 44) gems = rollGems('50gp', '1d4');
    else if (d <= 52) gems = rollGems('50gp', '1d6');
    else if (d <= 60) { gems = rollGems('10gp', '2d6'); magicItems = [pickRandom(TABLES.A)]; }
    else if (d <= 65) { art = rollArt('25gp', '2d4'); magicItems = [pickRandom(TABLES.A)]; }
    else if (d <= 70) { gems = rollGems('50gp', '2d6'); magicItems = [pickRandom(TABLES.A)]; }
    else if (d <= 75) { gems = rollGems('50gp', '1d6'); magicItems = [pickRandom(TABLES.A)]; }
    else if (d <= 78) { gems = rollGems('10gp', '2d6'); magicItems = [pickRandom(TABLES.B)]; }
    else if (d <= 80) { art = rollArt('25gp', '2d4'); magicItems = [pickRandom(TABLES.B)]; }
    else if (d <= 85) { gems = rollGems('50gp', '2d6'); magicItems = [pickRandom(TABLES.B)]; }
    else if (d <= 92) { gems = rollGems('50gp', '1d6'); magicItems = [pickRandom(TABLES.B)]; }
    else if (d <= 97) { art = rollArt('25gp', '2d6'); magicItems = [pickRandom(TABLES.C)]; }
    else if (d <= 99) { art = rollArt('25gp', '2d4'); magicItems = [pickRandom(TABLES.C)]; }
    else { gems = rollGems('50gp', '1d6'); magicItems = [pickRandom(TABLES.C)]; }
  } else if (tier === 'medium') {
    if (d <= 4) {}
    else if (d <= 10) gems = rollGems('25gp' === '25gp' ? '50gp' : '50gp', '2d4');
    else if (d <= 16) art = rollArt('25gp', '3d6');
    else if (d <= 22) { art = rollArt('25gp', '3d6'); magicItems = [pickRandom(TABLES.A), pickRandom(TABLES.A)]; }
    else if (d <= 28) { gems = rollGems('50gp', '3d6'); magicItems = [pickRandom(TABLES.A), pickRandom(TABLES.A)]; }
    else if (d <= 32) { art = rollArt('25gp', '3d6'); magicItems = [pickRandom(TABLES.B)]; }
    else if (d <= 36) { gems = rollGems('50gp', '3d6'); magicItems = [pickRandom(TABLES.B)]; }
    else if (d <= 40) { art = rollArt('25gp', '3d6'); magicItems = [pickRandom(TABLES.C)]; }
    else if (d <= 44) { gems = rollGems('50gp', '3d6'); magicItems = [pickRandom(TABLES.C)]; }
    else if (d <= 49) { art = rollArt('250gp', '2d4'); magicItems = [pickRandom(TABLES.F)]; }
    else if (d <= 54) { gems = rollGems('500gp', '2d4'); magicItems = [pickRandom(TABLES.F)]; }
    else if (d <= 59) { art = rollArt('250gp', '2d4'); magicItems = [pickRandom(TABLES.A), pickRandom(TABLES.A), pickRandom(TABLES.B)]; }
    else if (d <= 63) { gems = rollGems('500gp', '2d4'); magicItems = [pickRandom(TABLES.A), pickRandom(TABLES.A), pickRandom(TABLES.B)]; }
    else if (d <= 66) { art = rollArt('250gp', '2d4'); magicItems = [pickRandom(TABLES.B), pickRandom(TABLES.C)]; }
    else if (d <= 69) { gems = rollGems('500gp', '2d4'); magicItems = [pickRandom(TABLES.B), pickRandom(TABLES.C)]; }
    else if (d <= 72) { art = rollArt('250gp', '2d4'); magicItems = [pickRandom(TABLES.D)]; }
    else if (d <= 74) { gems = rollGems('500gp', '2d4'); magicItems = [pickRandom(TABLES.D)]; }
    else if (d <= 76) { art = rollArt('250gp', '2d4'); magicItems = [pickRandom(TABLES.E)]; }
    else if (d <= 78) { gems = rollGems('500gp', '2d4'); magicItems = [pickRandom(TABLES.E)]; }
    else if (d <= 85) { art = rollArt('250gp', '2d4'); magicItems = [pickRandom(TABLES.F), pickRandom(TABLES.F)]; }
    else if (d <= 92) { gems = rollGems('500gp', '2d4'); magicItems = [pickRandom(TABLES.F), pickRandom(TABLES.F)]; }
    else if (d <= 97) { art = rollArt('250gp', '2d4'); magicItems = [pickRandom(TABLES.G)]; }
    else { gems = rollGems('500gp', '2d4'); magicItems = [pickRandom(TABLES.G)]; }
  } else if (tier === 'high') {
    if (d <= 3) {}
    else if (d <= 6) { art = rollArt('250gp', '2d4'); magicItems = [pickRandom(TABLES.A), pickRandom(TABLES.A), pickRandom(TABLES.A), pickRandom(TABLES.B), pickRandom(TABLES.B)]; }
    else if (d <= 9) { gems = rollGems('500gp', '2d4'); magicItems = [pickRandom(TABLES.A), pickRandom(TABLES.A), pickRandom(TABLES.A), pickRandom(TABLES.B), pickRandom(TABLES.B)]; }
    else if (d <= 12) { art = rollArt('750gp', '2d4'); magicItems = [pickRandom(TABLES.B), pickRandom(TABLES.B), pickRandom(TABLES.B), pickRandom(TABLES.C)]; }
    else if (d <= 15) { gems = rollGems('1000gp', '3d6'); magicItems = [pickRandom(TABLES.B), pickRandom(TABLES.B), pickRandom(TABLES.B), pickRandom(TABLES.C)]; }
    else if (d <= 19) { art = rollArt('750gp', '2d4'); magicItems = [pickRandom(TABLES.C), pickRandom(TABLES.C), pickRandom(TABLES.C), pickRandom(TABLES.D)]; }
    else if (d <= 23) { gems = rollGems('1000gp', '3d6'); magicItems = [pickRandom(TABLES.C), pickRandom(TABLES.C), pickRandom(TABLES.C), pickRandom(TABLES.D)]; }
    else if (d <= 26) { art = rollArt('750gp', '2d4'); magicItems = [pickRandom(TABLES.D)]; }
    else if (d <= 29) { gems = rollGems('1000gp', '3d6'); magicItems = [pickRandom(TABLES.D)]; }
    else if (d <= 35) { art = rollArt('750gp', '2d4'); magicItems = [pickRandom(TABLES.E)]; }
    else if (d <= 40) { gems = rollGems('1000gp', '3d6'); magicItems = [pickRandom(TABLES.E)]; }
    else if (d <= 45) { art = rollArt('750gp', '2d4'); magicItems = [pickRandom(TABLES.F), pickRandom(TABLES.F), pickRandom(TABLES.G)]; }
    else if (d <= 50) { gems = rollGems('1000gp', '3d6'); magicItems = [pickRandom(TABLES.F), pickRandom(TABLES.F), pickRandom(TABLES.G)]; }
    else if (d <= 54) { art = rollArt('750gp', '2d4'); magicItems = [pickRandom(TABLES.G), pickRandom(TABLES.G)]; }
    else if (d <= 58) { gems = rollGems('1000gp', '3d6'); magicItems = [pickRandom(TABLES.G), pickRandom(TABLES.G)]; }
    else if (d <= 63) { art = rollArt('750gp', '2d4'); magicItems = [pickRandom(TABLES.H)]; }
    else if (d <= 68) { gems = rollGems('1000gp', '3d6'); magicItems = [pickRandom(TABLES.H)]; }
    else if (d <= 75) { art = rollArt('750gp', '2d4'); magicItems = [pickRandom(TABLES.I)]; }
    else if (d <= 80) { gems = rollGems('1000gp', '3d6'); magicItems = [pickRandom(TABLES.I)]; }
    else if (d <= 85) { art = rollArt('750gp', '2d4'); magicItems = [pickRandom(TABLES.H), pickRandom(TABLES.H)]; }
    else if (d <= 90) { gems = rollGems('1000gp', '3d6'); magicItems = [pickRandom(TABLES.H), pickRandom(TABLES.H)]; }
    else if (d <= 95) { art = rollArt('750gp', '2d4'); magicItems = [pickRandom(TABLES.I)]; }
    else { gems = rollGems('1000gp', '3d6'); magicItems = [pickRandom(TABLES.I)]; }
  } else { // legendary
    if (d <= 2) {}
    else if (d <= 5) { gems = rollGems('1000gp', '3d6'); magicItems = [pickRandom(TABLES.C), pickRandom(TABLES.C), pickRandom(TABLES.C), pickRandom(TABLES.C), pickRandom(TABLES.C), pickRandom(TABLES.C), pickRandom(TABLES.C), pickRandom(TABLES.C)]; }
    else if (d <= 8) { art = rollArt('2500gp', '1d10'); magicItems = [pickRandom(TABLES.C), pickRandom(TABLES.C), pickRandom(TABLES.C), pickRandom(TABLES.C), pickRandom(TABLES.C), pickRandom(TABLES.C)]; }
    else if (d <= 11) { art = rollArt('7500gp', '1d4'); magicItems = [pickRandom(TABLES.C), pickRandom(TABLES.C), pickRandom(TABLES.C), pickRandom(TABLES.C)]; }
    else if (d <= 14) { gems = rollGems('5000gp', '1d8'); magicItems = [pickRandom(TABLES.C), pickRandom(TABLES.C), pickRandom(TABLES.C), pickRandom(TABLES.C), pickRandom(TABLES.C), pickRandom(TABLES.C), pickRandom(TABLES.C)]; }
    else if (d <= 22) { gems = rollGems('1000gp', '3d6'); magicItems = [pickRandom(TABLES.D)]; }
    else if (d <= 30) { art = rollArt('2500gp', '1d10'); magicItems = [pickRandom(TABLES.D)]; }
    else if (d <= 38) { art = rollArt('7500gp', '1d4'); magicItems = [pickRandom(TABLES.D)]; }
    else if (d <= 46) { gems = rollGems('5000gp', '1d8'); magicItems = [pickRandom(TABLES.D)]; }
    else if (d <= 52) { gems = rollGems('1000gp', '3d6'); magicItems = [pickRandom(TABLES.E)]; }
    else if (d <= 58) { art = rollArt('2500gp', '1d10'); magicItems = [pickRandom(TABLES.E)]; }
    else if (d <= 63) { art = rollArt('7500gp', '1d4'); magicItems = [pickRandom(TABLES.E)]; }
    else if (d <= 68) { gems = rollGems('5000gp', '1d8'); magicItems = [pickRandom(TABLES.E)]; }
    else if (d <= 73) { art = rollArt('2500gp', '1d10'); magicItems = [pickRandom(TABLES.G), pickRandom(TABLES.G)]; }
    else if (d <= 78) { art = rollArt('7500gp', '1d4'); magicItems = [pickRandom(TABLES.G), pickRandom(TABLES.G)]; }
    else if (d <= 83) { gems = rollGems('5000gp', '1d8'); magicItems = [pickRandom(TABLES.G), pickRandom(TABLES.G)]; }
    else if (d <= 88) { art = rollArt('2500gp', '1d10'); magicItems = [pickRandom(TABLES.H)]; }
    else if (d <= 93) { art = rollArt('7500gp', '1d4'); magicItems = [pickRandom(TABLES.H)]; }
    else if (d <= 96) { gems = rollGems('5000gp', '1d8'); magicItems = [pickRandom(TABLES.H)]; }
    else { gems = rollGems('5000gp', '1d8'); magicItems = [pickRandom(TABLES.I), pickRandom(TABLES.I)]; }
  }

  return { gems, art, magicItems };
}

const WEAPON_TYPES = [
  'Battleaxe', 'Greataxe', 'Greatsword', 'Halberd', 'Longsword', 'Maul',
  'Morningstar', 'Rapier', 'Scimitar', 'Shortsword', 'Trident',
  'War Pick', 'Warhammer', 'Mace', 'Spear', 'Glaive', 'Lance',
  'Longbow', 'Heavy Crossbow', 'Hand Crossbow', 'Light Crossbow',
  'Dagger', 'Handaxe', 'Javelin', 'Quarterstaff', 'Whip',
];

const ARMOR_TYPES_LIGHT = ['Leather', 'Studded Leather', 'Padded'];
const ARMOR_TYPES_MEDIUM = ['Chain Shirt', 'Scale Mail', 'Breastplate', 'Half Plate'];
const ARMOR_TYPES_HEAVY = ['Chain Mail', 'Splint', 'Plate', 'Ring Mail'];
const ARMOR_TYPES_ALL = [...ARMOR_TYPES_LIGHT, ...ARMOR_TYPES_MEDIUM, ...ARMOR_TYPES_HEAVY];

function specifyWeaponsAndArmor(items) {
  if (!items) return items;
  return items.map(item => {
    // "+1 Weapon", "+2 Weapon", "+3 Weapon"
    const wMatch = item.match(/^([+]\d+) Weapon$/);
    if (wMatch) return `${wMatch[1]} ${pickRandom(WEAPON_TYPES)}`;
    // "Weapon +1", "+1 Striking Weapon" etc. (PF2e style — leave alone)
    // "+1 Armor", "+2 Armor", "+3 Armor" (without parens)
    const aMatch = item.match(/^([+]\d+) Armor$/);
    if (aMatch) return `${aMatch[1]} ${pickRandom(ARMOR_TYPES_ALL)} Armor`;
    return item;
  });
}

export function generateLoot(cr, mode = 'individual') {
  const tier = getTier(cr);
  if (mode === 'hoard') {
    const { gems, art, magicItems } = rollHoardExtras(tier);
    return {
      system: 'D&D 5e',
      subtitle: `Hoard CR ${cr}`,
      coins: rollHoardCoins(tier),
      gems,
      jewelry: art,
      magicItems: specifyWeaponsAndArmor(magicItems),
    };
  }
  return {
    system: 'D&D 5e',
    subtitle: `CR ${cr}`,
    coins: rollIndividualCoins(tier),
    magicItems: specifyWeaponsAndArmor(rollMagicItemsIndividual(tier)),
  };
}

export const CR_VALUES = [
  '0', '1/8', '1/4', '1/2',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  '11', '12', '13', '14', '15', '16',
  '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
];
