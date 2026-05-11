import { rollDice, rollChance, pickRandom } from './dice.js';

const STORAGE_KEY = 'loot-pinata/custom-tables';

export function loadTables() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveTables(tables) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
}

export function addTable(table) {
  const tables = loadTables();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  tables[id] = table;
  saveTables(tables);
  return id;
}

export function removeTable(id) {
  const tables = loadTables();
  delete tables[id];
  saveTables(tables);
}

export function validateTable(data) {
  if (!data || typeof data !== 'object') return 'Not a valid JSON object.';
  if (typeof data.name !== 'string') return 'Missing "name" field.';
  if (!Array.isArray(data.tiers) || data.tiers.length === 0) return 'Missing or empty "tiers" array.';
  for (const tier of data.tiers) {
    if (typeof tier.label !== 'string') return 'Each tier needs a "label".';
  }
  return null;
}

export function generateLoot(table, tierIndex) {
  const tier = table.tiers[tierIndex];
  if (!tier) return null;

  const coins = {};
  if (tier.coins) {
    for (const [type, spec] of Object.entries(tier.coins)) {
      if (!spec) continue;
      const chance = spec.chance ?? 100;
      if (rollChance(chance)) {
        const amount = rollDice(spec.dice ?? '1');
        const mult = spec.mult ?? 1;
        if (amount > 0) coins[type] = amount * mult;
      }
    }
  }

  let gems;
  if (tier.gems) {
    const chance = tier.gems.chance ?? 100;
    if (rollChance(chance)) {
      const count = rollDice(tier.gems.dice ?? '1');
      const values = tier.gems.values || [10, 50, 100, 500, 1000];
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
  }

  let jewelry;
  if (tier.jewelry) {
    const chance = tier.jewelry.chance ?? 100;
    if (rollChance(chance)) {
      const count = rollDice(tier.jewelry.dice ?? '1');
      const desc = tier.jewelry.description || 'Jewelry';
      const items = [];
      for (let i = 0; i < count; i++) items.push({ description: desc, value: null });
      jewelry = { count, items, totalValue: null };
    }
  }

  const magicItems = [];
  if (Array.isArray(tier.items)) {
    for (const entry of tier.items) {
      const chance = entry.chance ?? 100;
      if (rollChance(chance) && Array.isArray(entry.table) && entry.table.length > 0) {
        magicItems.push(pickRandom(entry.table));
      }
    }
  }

  return {
    system: table.name,
    subtitle: tier.label,
    coins,
    gems,
    jewelry,
    magicItems,
  };
}
