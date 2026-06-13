// History panel manager
import { Storage } from './storage.js';
import { toast } from './notifications.js';

const KEY = 'history';
const MAX = 200;

export const History = {
  items: [],
  onUse: null,

  init({ onUse } = {}) {
    this.items = Storage.get(KEY, []);
    this.onUse = onUse;

    document.getElementById('history-search')?.addEventListener('input', (e) => {
      this.render(e.target.value);
    });
    document.getElementById('history-clear')?.addEventListener('click', () => {
      if (!this.items.length) return toast('History sudah kosong', 'info');
      this.items = [];
      this.save();
      this.render();
      toast('History dihapus', 'success');
    });
    document.getElementById('history-export')?.addEventListener('click', () => this.export());

    this.render();
  },

  add(expr, result) {
    this.items.unshift({ expr, result: String(result), at: Date.now() });
    if (this.items.length > MAX) this.items.length = MAX;
    this.save();
    this.render(document.getElementById('history-search')?.value || '');
  },

  remove(idx) {
    this.items.splice(idx, 1);
    this.save();
    this.render();
  },

  save() { Storage.set(KEY, this.items); },

  render(query = '') {
    const list = document.getElementById('history-list');
    if (!list) return;
    const q = query.trim().toLowerCase();
    const filtered = q
      ? this.items.filter(i => i.expr.toLowerCase().includes(q) || i.result.toLowerCase().includes(q))
      : this.items;

    if (!filtered.length) {
      list.innerHTML = `<p class="text-fg-muted text-sm text-center py-8">${q ? 'No matches' : 'No history yet'}</p>`;
      return;
    }
    list.innerHTML = filtered.map((it, i) => `
      <div class="h-item animate-fade-in" data-idx="${this.items.indexOf(it)}">
        <span class="h-expr">${escapeHtml(it.expr)} =</span>
        <span class="h-res">${escapeHtml(it.result)}</span>
        <button class="h-del" title="Delete"><i class="fa fa-times"></i></button>
      </div>
    `).join('');

    list.querySelectorAll('.h-item').forEach(node => {
      const idx = Number(node.dataset.idx);
      node.addEventListener('click', (e) => {
        if (e.target.closest('.h-del')) return;
        this.onUse?.(this.items[idx]);
      });
      node.querySelector('.h-del')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.remove(idx);
      });
    });
  },

  export() {
    if (!this.items.length) return toast('Tidak ada history untuk diexport', 'warning');
    const lines = this.items.map(i => `${new Date(i.at).toISOString()}\t${i.expr} = ${i.result}`);
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `hcalc-history-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast('History diexport', 'success');
  }
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
