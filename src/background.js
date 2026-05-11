import OBR from '@owlbear-rodeo/sdk';

const CHANNEL = 'loot-pinata/reveal';

function summarize(loot) {
  const parts = [];
  const { coins, gems, jewelry, magicItems } = loot || {};

  if (coins) {
    const order = ['cp', 'sp', 'ep', 'gp', 'pp'];
    for (const k of order) {
      if (coins[k]) parts.push(`${coins[k].toLocaleString()} ${k}`);
    }
  }
  if (gems?.count > 0) {
    parts.push(`${gems.count} gem${gems.count === 1 ? '' : 's'}${gems.totalValue ? ` (${gems.totalValue.toLocaleString()} gp)` : ''}`);
  }
  if (jewelry?.count > 0) {
    const noun = (jewelry.label || 'jewelry').toLowerCase();
    parts.push(`${jewelry.count} ${noun}`);
  }
  if (magicItems?.length > 0) {
    parts.push(...magicItems);
  }
  return parts.join(' · ');
}

OBR.onReady(() => {
  OBR.broadcast.onMessage(CHANNEL, async (event) => {
    const loot = event.data;
    if (!loot) return;
    const summary = summarize(loot);
    if (!summary) return;
    await OBR.notification.show(`🎁 Loot revealed: ${summary}`, 'SUCCESS');
  });
});
