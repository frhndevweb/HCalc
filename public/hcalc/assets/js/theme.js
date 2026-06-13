// Theme + palette manager
import { Storage } from './storage.js';

const PALETTES = ['blue', 'purple', 'emerald', 'orange', 'rose'];

export const Theme = {
  init() {
    const mode = Storage.get('theme', 'dark');
    const palette = Storage.get('palette', 'blue');
    this.applyMode(mode);
    this.applyPalette(palette);

    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
      this.applyMode(next);
      Storage.set('theme', next);
    });

    const paletteToggle = document.getElementById('palette-toggle');
    const paletteMenu = document.getElementById('palette-menu');
    paletteToggle?.addEventListener('click', (e) => {
      e.stopPropagation();
      paletteMenu?.classList.toggle('hidden');
    });
    document.addEventListener('click', () => paletteMenu?.classList.add('hidden'));

    document.querySelectorAll('[data-palette]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = btn.dataset.palette;
        if (!PALETTES.includes(p)) return;
        this.applyPalette(p);
        Storage.set('palette', p);
        paletteMenu?.classList.add('hidden');
      });
    });
  },

  applyMode(mode) {
    const html = document.documentElement;
    html.classList.toggle('dark', mode === 'dark');
    const icon = document.querySelector('#theme-toggle i');
    if (icon) icon.className = mode === 'dark' ? 'fa fa-sun-o' : 'fa fa-moon-o';
  },

  applyPalette(palette) {
    document.documentElement.setAttribute('data-palette', palette);
  }
};
