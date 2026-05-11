// Parses "2d6", "1d8+2", "3d6*100", "2d6-1*10"
export function rollDice(formula) {
  if (typeof formula === 'number') return formula;
  const f = String(formula).replace(/\s+/g, '');
  const m = f.match(/^(\d+)d(\d+)(?:([+\-])(\d+))?(?:[*x](\d+))?$/i);
  if (!m) return 0;
  const [, n, sides, op, mod, mult] = m;
  let total = 0;
  for (let i = 0; i < parseInt(n); i++) {
    total += Math.floor(Math.random() * parseInt(sides)) + 1;
  }
  if (op === '+') total += parseInt(mod);
  if (op === '-') total -= parseInt(mod);
  if (mult) total *= parseInt(mult);
  return total;
}

export function rollD100() {
  return Math.floor(Math.random() * 100) + 1;
}

export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function rollChance(percent) {
  return rollD100() <= percent;
}
