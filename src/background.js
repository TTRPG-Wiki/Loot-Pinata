import OBR from '@owlbear-rodeo/sdk';

// background.html lives at /.../src/background.html — paths are computed
// against window.location so the extension works under a GitHub Pages subpath
const ICON_URL = new URL('../icon.svg', window.location.href).href;
const LOOT_URL = new URL('./loot-display.html', window.location.href).href;

OBR.onReady(() => {
  OBR.contextMenu.create({
    id: 'loot-pinata/loot',
    icons: [
      {
        icon: ICON_URL,
        label: 'Loot!',
        filter: {
          roles: ['GM'],
          every: [{ key: 'type', value: 'IMAGE' }],
        },
      },
    ],
    embed: {
      url: LOOT_URL,
      height: 520,
    },
  });
});
