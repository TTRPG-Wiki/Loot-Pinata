import OBR from '@owlbear-rodeo/sdk';
import * as Dnd5e from './engines/dnd5e.js';
import * as Pf2e from './engines/pf2e.js';
import * as Shadowdark from './engines/shadowdark.js';
import * as Ose from './engines/ose.js';
import * as Custom from './engines/custom.js';

const COIN_LABELS = { cp: 'Copper', sp: 'Silver', ep: 'Electrum', gp: 'Gold', pp: 'Platinum' };
const COIN_CLASSES = { cp: 'coin-cp', sp: 'coin-sp', ep: 'coin-ep', gp: 'coin-gp', pp: 'coin-pp' };

const COMMUNITY_BASE = new URL('../community-tables/', window.location.href).href;
const EXAMPLE_URL = new URL('../example-table.json', window.location.href).href;

const state = {
  system: 'dnd5e',
  cr: '5',
  pf2eLevel: '5',
  sdTier: '1',
  oseType: 'A',
  customTableId: null,
  customTierIndex: 0,
  selectedItems: [],
};

const $ = (id) => document.getElementById(id);

function showError(msg) {
  const el = $('error');
  el.textContent = msg;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 4000);
}

function switchSystem(system) {
  state.system = system;
  $('system-select').value = system;
  document.querySelectorAll('.system-panel').forEach(p => {
    p.style.display = p.id === `panel-${system}` ? 'block' : 'none';
  });
  $('results').classList.remove('visible');
}

// ─────────────── Dropdown population ───────────────
function fillSelect(id, values, labelFn, current) {
  const select = $(id);
  select.innerHTML = '';
  values.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = labelFn(v);
    if (v === current) opt.selected = true;
    select.appendChild(opt);
  });
}

function populateBuiltInDropdowns() {
  fillSelect('cr-select', Dnd5e.CR_VALUES, v => `CR ${v}`, state.cr);
  fillSelect('pf2e-select', Pf2e.PF2E_LEVELS, v => `Level ${v}`, state.pf2eLevel);
  fillSelect('sd-select', Shadowdark.SHADOWDARK_TIERS, Shadowdark.shadowdarkLabel, state.sdTier);
  fillSelect('ose-select', Object.keys(Ose.OSE_TYPES), k => Ose.OSE_TYPES[k].label, state.oseType);
}

function populateCustomTables() {
  const tables = Custom.loadTables();
  const select = $('custom-table');
  const mgmt = $('table-management');
  const list = $('table-list');
  const tierRow = $('custom-tier-row');
  const rollBtn = $('roll-btn');

  select.innerHTML = '';
  list.innerHTML = '';

  const ids = Object.keys(tables);
  if (ids.length === 0) {
    const opt = document.createElement('option');
    opt.textContent = '— Upload or browse to get started —';
    opt.disabled = true;
    opt.selected = true;
    select.appendChild(opt);
    mgmt.style.display = 'none';
    tierRow.style.display = 'none';
    if (state.system === 'custom') rollBtn.disabled = true;
    return;
  }

  rollBtn.disabled = false;
  mgmt.style.display = 'block';

  ids.forEach(id => {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = tables[id].name;
    if (id === state.customTableId) opt.selected = true;
    select.appendChild(opt);

    const row = document.createElement('div');
    row.className = 'table-item';
    row.innerHTML = `
      <span>
        <span class="table-item-name">${escapeHtml(tables[id].name)}</span>
        <span class="table-item-tiers">${tables[id].tiers.length} tier${tables[id].tiers.length === 1 ? '' : 's'}</span>
      </span>
      <button class="delete-btn" data-id="${id}" title="Delete">×</button>
    `;
    list.appendChild(row);
  });

  if (!state.customTableId || !tables[state.customTableId]) {
    state.customTableId = ids[0];
    select.value = ids[0];
  }
  populateCustomTiers();
}

function populateCustomTiers() {
  const tables = Custom.loadTables();
  const table = tables[state.customTableId];
  const tierSelect = $('custom-tier');
  const tierRow = $('custom-tier-row');

  if (!table || !table.tiers) {
    tierRow.style.display = 'none';
    return;
  }

  tierSelect.innerHTML = '';
  table.tiers.forEach((tier, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = tier.label;
    if (i === state.customTierIndex) opt.selected = true;
    tierSelect.appendChild(opt);
  });

  tierRow.style.display = table.tiers.length > 1 ? 'flex' : 'none';
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ─────────────── Roll & display ───────────────
async function rollLoot() {
  let loot;
  try {
    switch (state.system) {
      case 'dnd5e': loot = Dnd5e.generateLoot(state.cr); break;
      case 'pf2e': loot = Pf2e.generateLoot(state.pf2eLevel); break;
      case 'shadowdark': loot = Shadowdark.generateLoot(state.sdTier); break;
      case 'ose': loot = Ose.generateLoot(state.oseType); break;
      case 'custom': {
        const tables = Custom.loadTables();
        const table = tables[state.customTableId];
        if (!table) return showError('No custom table selected.');
        loot = Custom.generateLoot(table, state.customTierIndex);
        break;
      }
    }
  } catch (err) {
    return showError(`Roll failed: ${err.message}`);
  }
  if (!loot) return showError('Could not generate loot.');

  displayLoot(loot);

  if (state.selectedItems.length > 0) {
    try {
      await OBR.scene.items.updateItems(
        state.selectedItems.map(i => i.id),
        items => {
          for (const item of items) {
            item.metadata['loot-pinata/system'] = state.system;
            item.metadata['loot-pinata/cr'] = state.cr;
            item.metadata['loot-pinata/pf2e-level'] = state.pf2eLevel;
            item.metadata['loot-pinata/sd-tier'] = state.sdTier;
            item.metadata['loot-pinata/ose-type'] = state.oseType;
            item.metadata['loot-pinata/looted'] = true;
          }
        }
      );
    } catch { /* dev mode */ }
  }
}

function displayLoot(loot) {
  const { system, subtitle, coins, gems, jewelry, magicItems } = loot;
  const results = $('results');

  let html = `<div class="result-header">${escapeHtml(system)} • ${escapeHtml(subtitle)}</div>`;

  html += '<div class="section-title">Coins</div>';
  const order = ['cp', 'sp', 'ep', 'gp', 'pp'];
  let hasCoins = false;
  for (const k of order) {
    if (coins?.[k]) {
      hasCoins = true;
      html += `
        <div class="coin-row ${COIN_CLASSES[k]}">
          <span class="coin-label">${COIN_LABELS[k]}</span>
          <span class="coin-value">${coins[k].toLocaleString()} ${k}</span>
        </div>`;
    }
  }
  if (!hasCoins) html += '<div class="no-content">None.</div>';

  if (gems && gems.count > 0) {
    const total = gems.totalValue != null
      ? `<span class="section-total">${gems.totalValue.toLocaleString()} gp</span>`
      : '';
    html += `<div class="section-title">Gems (${gems.count})${total}</div>`;
    gems.items.forEach(g => {
      if (typeof g === 'object' && g.value != null) {
        const label = g.count > 1
          ? `${g.count} × ${g.value.toLocaleString()} gp gem`
          : `${g.value.toLocaleString()} gp gem`;
        const subtotal = g.count > 1
          ? `<span class="item-subtotal">${(g.value * g.count).toLocaleString()} gp</span>`
          : '';
        html += `<div class="treasure-item">${label}${subtotal}</div>`;
      } else {
        html += `<div class="treasure-item">${escapeHtml(g)}</div>`;
      }
    });
  }

  if (jewelry && jewelry.count > 0) {
    const total = jewelry.totalValue != null
      ? `<span class="section-total">${jewelry.totalValue.toLocaleString()} gp</span>`
      : '';
    html += `<div class="section-title">Jewelry (${jewelry.count})${total}</div>`;
    jewelry.items.forEach(j => {
      if (typeof j === 'object') {
        const valStr = j.value != null
          ? ` <span class="item-subtotal">${j.value.toLocaleString()} gp</span>`
          : '';
        html += `<div class="treasure-item">${escapeHtml(j.description)}${valStr}</div>`;
      } else {
        html += `<div class="treasure-item">${escapeHtml(j)}</div>`;
      }
    });
  }

  html += '<div class="section-title">Magic Items</div>';
  if (magicItems && magicItems.length > 0) {
    magicItems.forEach(item => {
      html += `<div class="magic-item">${escapeHtml(item)}</div>`;
    });
  } else {
    html += '<div class="no-content">None.</div>';
  }

  results.innerHTML = html;
  results.classList.add('visible');
}

// ─────────────── File upload ───────────────
function handleFileUpload(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      const err = Custom.validateTable(data);
      if (err) return showError(err);
      const id = Custom.addTable(data);
      state.customTableId = id;
      state.customTierIndex = 0;
      populateCustomTables();
    } catch (parseErr) {
      showError(`Invalid JSON: ${parseErr.message}`);
    }
  };
  reader.readAsText(file);
}

// ─────────────── Community Browse ───────────────
async function openCommunityModal() {
  $('community-modal').classList.add('visible');
  const list = $('community-list');
  list.innerHTML = 'Loading…';

  try {
    const res = await fetch(COMMUNITY_BASE + 'index.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data.tables || data.tables.length === 0) {
      list.innerHTML = '<div class="no-content">No community tables yet.</div>';
      return;
    }

    list.innerHTML = '';
    data.tables.forEach((entry, idx) => {
      const div = document.createElement('div');
      div.className = 'community-table';
      div.innerHTML = `
        <div class="ct-name">${escapeHtml(entry.name)}</div>
        <div class="ct-meta">${escapeHtml(entry.system || 'Generic')} · ${entry.tiers || '?'} tiers · by ${escapeHtml(entry.author || 'anonymous')}</div>
        <div class="ct-desc">${escapeHtml(entry.description || '')}</div>
        <button class="install-btn" data-idx="${idx}">Install</button>
      `;
      div.querySelector('.install-btn').addEventListener('click', e => installCommunityTable(entry, e.target));
      list.appendChild(div);
    });
  } catch (err) {
    list.innerHTML = `<div class="no-content">Couldn't load community tables: ${escapeHtml(err.message)}</div>`;
  }
}

async function installCommunityTable(entry, btn) {
  btn.disabled = true;
  btn.textContent = 'Installing…';
  try {
    const res = await fetch(COMMUNITY_BASE + entry.file);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const table = await res.json();
    const err = Custom.validateTable(table);
    if (err) throw new Error(err);

    const id = Custom.addTable(table);
    state.customTableId = id;
    state.customTierIndex = 0;
    populateCustomTables();
    btn.textContent = '✓ Installed';
    btn.style.background = '#90c0a0';
  } catch (err) {
    btn.disabled = false;
    btn.textContent = 'Install';
    showError(`Install failed: ${err.message}`);
  }
}

// ─────────────── Wire up ───────────────
populateBuiltInDropdowns();
populateCustomTables();

$('system-select').addEventListener('change', e => switchSystem(e.target.value));

$('cr-select').addEventListener('change', e => { state.cr = e.target.value; });
$('pf2e-select').addEventListener('change', e => { state.pf2eLevel = e.target.value; });
$('sd-select').addEventListener('change', e => { state.sdTier = e.target.value; });
$('ose-select').addEventListener('change', e => { state.oseType = e.target.value; });
$('custom-table').addEventListener('change', e => {
  state.customTableId = e.target.value;
  state.customTierIndex = 0;
  populateCustomTiers();
});
$('custom-tier').addEventListener('change', e => {
  state.customTierIndex = parseInt(e.target.value, 10);
});

$('roll-btn').addEventListener('click', rollLoot);

$('upload-btn').addEventListener('click', () => $('file-input').click());
$('file-input').addEventListener('change', e => {
  if (e.target.files[0]) handleFileUpload(e.target.files[0]);
  e.target.value = '';
});

$('browse-btn').addEventListener('click', openCommunityModal);
$('close-modal').addEventListener('click', () => $('community-modal').classList.remove('visible'));
$('community-modal').addEventListener('click', e => {
  if (e.target.id === 'community-modal') e.target.classList.remove('visible');
});

$('example-link').addEventListener('click', () => {
  const link = document.createElement('a');
  link.href = EXAMPLE_URL;
  link.download = 'loot-pinata-example.json';
  link.click();
});

$('format-help-link').addEventListener('click', () => {
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(`<pre style="font-family:monospace;padding:20px;background:#1a1a2e;color:#e0d8c8;font-size:13px;line-height:1.6;">${escapeHtml(FORMAT_DOCS)}</pre>`);
});

$('table-list').addEventListener('click', e => {
  if (e.target.classList.contains('delete-btn')) {
    Custom.removeTable(e.target.dataset.id);
    if (state.customTableId === e.target.dataset.id) state.customTableId = null;
    populateCustomTables();
  }
});

// ─────────────── OBR integration ───────────────
OBR.onReady(async () => {
  try {
    const selection = await OBR.player.getSelection();
    if (selection && selection.length > 0) {
      state.selectedItems = await OBR.scene.items.getItems(selection);
      const md = state.selectedItems[0]?.metadata || {};
      if (md['loot-pinata/system']) switchSystem(md['loot-pinata/system']);
      if (md['loot-pinata/cr']) { state.cr = md['loot-pinata/cr']; $('cr-select').value = state.cr; }
      if (md['loot-pinata/pf2e-level']) { state.pf2eLevel = md['loot-pinata/pf2e-level']; $('pf2e-select').value = state.pf2eLevel; }
      if (md['loot-pinata/sd-tier']) { state.sdTier = md['loot-pinata/sd-tier']; $('sd-select').value = state.sdTier; }
      if (md['loot-pinata/ose-type']) { state.oseType = md['loot-pinata/ose-type']; $('ose-select').value = state.oseType; }
      if (md['loot-pinata/looted']) $('looted-warning').classList.add('visible');
    }
  } catch { /* dev mode */ }
});

const FORMAT_DOCS = `Loot Pinata — Custom Table Format

A custom table is a JSON file with a "name" and a list of "tiers".

────────────────────────────────────────
MINIMAL EXAMPLE
────────────────────────────────────────

{
  "name": "My Goblin Loot",
  "tiers": [
    {
      "label": "Goblin Grunt",
      "coins": {
        "cp": { "chance": 100, "dice": "2d6" }
      }
    }
  ]
}

────────────────────────────────────────
ALL FIELDS
────────────────────────────────────────

{
  "name": "Table name shown in dropdown",
  "description": "Optional description",
  "tiers": [
    {
      "label": "Tier name shown in dropdown",

      "coins": {
        "cp": { "chance": 0-100, "dice": "NdN", "mult": 1 },
        "sp": { ... },
        "ep": { ... },
        "gp": { ... },
        "pp": { ... }
      },

      "gems": {
        "chance": 0-100,
        "dice": "1d4",
        "values": [10, 50, 100, 500]
      },

      "jewelry": {
        "chance": 0-100,
        "dice": "1d3",
        "description": "Description shown per item"
      },

      "items": [
        {
          "chance": 0-100,
          "table": ["Item 1", "Item 2", "Item 3"]
        }
      ]
    }
  ]
}

────────────────────────────────────────
FIELD NOTES
────────────────────────────────────────

• chance — percent chance (0–100). 100 = always.
• dice — supports "NdN", "NdN+X", "NdN-X", "NdN*X".
• mult — coin multiplier (default 1).
• values — array of gp values for gems.

Each "items" entry rolls independently. If chance succeeds,
one random entry from "table" is picked.

To share with the community, submit a PR — see CONTRIBUTING.md.
`;
