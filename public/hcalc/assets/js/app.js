// Main app bootstrap
import { Theme } from './theme.js';
import { createCalculator } from './calculator.js';
import { History } from './history.js';
import { bindKeyboard } from './keyboard.js';
import { Converter } from './converter.js';
import { toast } from './notifications.js';
import { evaluate } from './scientific.js';

document.getElementById('year').textContent = new Date().getFullYear();

// Theme
Theme.init();

// Calculator
const calc = createCalculator({
  exprEl: document.getElementById('expression'),
  resultEl: document.getElementById('result'),
  onCommit: (expr, result) => History.add(expr, result)
});

// History
History.init({ onUse: (item) => calc.loadFromHistory(item) });

// Keyboard
bindKeyboard(calc);

// Converter
Converter.init();

// Ripple effect + button bindings
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const r = document.createElement('span');
    r.className = 'ripple';
    r.style.width = r.style.height = size + 'px';
    r.style.left = (e.clientX - rect.left - size/2) + 'px';
    r.style.top = (e.clientY - rect.top - size/2) + 'px';
    btn.appendChild(r);
    setTimeout(() => r.remove(), 600);

    if (btn.dataset.num) return calc.input(btn.dataset.num);
    if (btn.dataset.insert) return calc.insert(btn.dataset.insert);
    if (btn.dataset.fn) return calc.applyFn(btn.dataset.fn);
    if (btn.dataset.mem) return calc.mem(btn.dataset.mem);
    if (btn.dataset.action === 'ac') return calc.clear();
    if (btn.dataset.action === 'del') return calc.del();
    if (btn.dataset.action === 'eq') return calc.equals();
    if (btn.dataset.action === 'ans') return calc.ans();
  });
});

// Mode tab switching
const panels = {
  basic: document.getElementById('panel-basic'),
  scientific: document.getElementById('panel-basic'), // shares basic + reveals sci row
  programmer: document.getElementById('panel-programmer'),
  converter: document.getElementById('panel-converter'),
  graph: document.getElementById('panel-graph'),
  stats: document.getElementById('panel-stats')
};
const sciRow = document.getElementById('scientific-row');

function setMode(mode) {
  document.querySelectorAll('.mode-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
  // hide all
  [panels.basic, panels.programmer, panels.converter, panels.graph, panels.stats]
    .forEach(p => p.classList.add('hidden'));
  // show target
  panels[mode].classList.remove('hidden');
  sciRow.classList.toggle('hidden', mode !== 'scientific');
}
document.querySelectorAll('.mode-tab').forEach(t => {
  t.addEventListener('click', () => setMode(t.dataset.mode));
});

// History panel toggle (mobile-ish)
document.getElementById('history-toggle')?.addEventListener('click', () => {
  document.getElementById('history-panel').classList.toggle('hidden');
});

// ---------- Programmer ----------
const progIn = document.getElementById('prog-input');
const progBase = document.getElementById('prog-base');
document.getElementById('prog-convert')?.addEventListener('click', () => {
  const base = parseInt(progBase.value, 10);
  const raw = progIn.value.trim();
  if (!raw) return toast('Masukkan angka dahulu', 'warning');
  let dec;
  try {
    dec = parseInt(raw, base);
    if (Number.isNaN(dec)) throw new Error();
  } catch { return toast('Format tidak valid', 'error'); }
  document.getElementById('prog-hex').textContent = dec.toString(16).toUpperCase();
  document.getElementById('prog-dec').textContent = dec.toString(10);
  document.getElementById('prog-oct').textContent = dec.toString(8);
  document.getElementById('prog-bin').textContent = dec.toString(2);
});

// ---------- Graph ----------
const canvas = document.getElementById('graph-canvas');
const gctx = canvas.getContext('2d');

function drawGrid() {
  const { width: W, height: H } = canvas;
  gctx.clearRect(0, 0, W, H);
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--display-bg') || 'rgba(0,0,0,0.1)';
  gctx.fillStyle = 'transparent';
  gctx.fillRect(0, 0, W, H);

  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#3b82f6';
  const muted = getComputedStyle(document.documentElement).getPropertyValue('--fg-muted').trim() || '#888';

  // Grid
  gctx.strokeStyle = muted + '33';
  gctx.lineWidth = 1;
  const step = 40;
  for (let x = 0; x < W; x += step) {
    gctx.beginPath(); gctx.moveTo(x, 0); gctx.lineTo(x, H); gctx.stroke();
  }
  for (let y = 0; y < H; y += step) {
    gctx.beginPath(); gctx.moveTo(0, y); gctx.lineTo(W, y); gctx.stroke();
  }
  // Axes
  gctx.strokeStyle = muted;
  gctx.lineWidth = 1.5;
  gctx.beginPath(); gctx.moveTo(0, H/2); gctx.lineTo(W, H/2); gctx.stroke();
  gctx.beginPath(); gctx.moveTo(W/2, 0); gctx.lineTo(W/2, H); gctx.stroke();
  return { W, H, accent };
}

function plot(fnText) {
  const { W, H, accent } = drawGrid();
  if (!fnText) return;
  const scale = 40; // pixels per unit
  const cx = W/2, cy = H/2;
  gctx.strokeStyle = accent;
  gctx.lineWidth = 2.5;
  gctx.shadowColor = accent;
  gctx.shadowBlur = 12;
  gctx.beginPath();
  let started = false;
  for (let px = 0; px < W; px++) {
    const x = (px - cx) / scale;
    let y;
    try { y = evaluate(fnText.replace(/x/g, `(${x})`)); }
    catch { return toast('Fungsi tidak valid', 'error'); }
    if (!Number.isFinite(y)) { started = false; continue; }
    const py = cy - y * scale;
    if (!started) { gctx.moveTo(px, py); started = true; }
    else gctx.lineTo(px, py);
  }
  gctx.stroke();
  gctx.shadowBlur = 0;
}

document.getElementById('graph-plot')?.addEventListener('click', () => {
  const f = document.getElementById('graph-input').value.trim();
  if (!f) return toast('Masukkan fungsi, contoh: sin(x)', 'warning');
  plot(f);
});
document.getElementById('graph-clear')?.addEventListener('click', () => drawGrid());
drawGrid();

// ---------- Stats ----------
document.getElementById('stats-calc')?.addEventListener('click', () => {
  const raw = document.getElementById('stats-input').value.trim();
  const nums = raw.split(/[,\s]+/).map(Number).filter(n => Number.isFinite(n));
  if (!nums.length) return toast('Masukkan angka valid', 'warning');
  const sorted = [...nums].sort((a,b) => a-b);
  const sum = nums.reduce((a,b)=>a+b,0);
  const mean = sum / nums.length;
  const mid = Math.floor(sorted.length/2);
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid-1] + sorted[mid]) / 2;
  const freq = {};
  nums.forEach(n => freq[n] = (freq[n] || 0) + 1);
  const maxF = Math.max(...Object.values(freq));
  const mode = Object.keys(freq).filter(k => freq[k] === maxF).join(', ');
  const range = sorted[sorted.length-1] - sorted[0];
  const variance = nums.reduce((a,b) => a + (b-mean)**2, 0) / nums.length;
  const sd = Math.sqrt(variance);

  const out = document.getElementById('stats-output');
  const r = n => Math.round(n * 1e6) / 1e6;
  out.innerHTML = [
    ['Count', nums.length],
    ['Sum', r(sum)],
    ['Mean', r(mean)],
    ['Median', r(median)],
    ['Mode', mode],
    ['Range', r(range)],
    ['Std Dev', r(sd)],
    ['Variance', r(variance)]
  ].map(([l,v]) => `<div class="stat-card animate-fade-in"><div class="l">${l}</div><div class="v">${v}</div></div>`).join('');
});

// ---------- Voice ----------
const voiceBtn = document.getElementById('voice-btn');
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recog = null;
if (SR) {
  recog = new SR();
  recog.lang = 'id-ID';
  recog.continuous = false;
  recog.interimResults = false;
  recog.onresult = (e) => {
    const text = e.results[0][0].transcript.toLowerCase();
    const expr = voiceToExpr(text);
    if (!expr) return toast(`Tidak dimengerti: "${text}"`, 'warning');
    try {
      const v = evaluate(expr);
      calc.loadFromHistory({ expr, result: String(v) });
      History.add(expr, String(v));
      toast(`"${text}" = ${v}`, 'success');
    } catch { toast('Gagal menghitung', 'error'); }
  };
  recog.onend = () => voiceBtn.classList.remove('recording');
  recog.onerror = (e) => { toast('Voice error: ' + e.error, 'error'); voiceBtn.classList.remove('recording'); };
}
voiceBtn?.addEventListener('click', () => {
  if (!recog) return toast('Browser tidak mendukung voice', 'warning');
  try { recog.start(); voiceBtn.classList.add('recording'); toast('Bicara sekarang...', 'info', 1500); }
  catch { recog.stop(); }
});

function voiceToExpr(t) {
  const m = {
    'tambah': '+', 'plus': '+', 'ditambah': '+',
    'kurang': '-', 'minus': '-', 'dikurang': '-',
    'kali': '*', 'dikali': '*', 'times': '*', 'x': '*',
    'bagi': '/', 'dibagi': '/', 'per': '/',
    'modulo': '%', 'mod': '%',
    'koma': '.', 'titik': '.',
    'kurung buka': '(', 'kurung tutup': ')',
    'satu':'1','dua':'2','tiga':'3','empat':'4','lima':'5',
    'enam':'6','tujuh':'7','delapan':'8','sembilan':'9','nol':'0'
  };
  let s = ' ' + t + ' ';
  Object.entries(m).forEach(([k,v]) => { s = s.replace(new RegExp('\\b'+k+'\\b','g'), v); });
  s = s.replace(/[^0-9+\-*/%().\s]/g, '');
  s = s.replace(/\s+/g, '');
  return s;
}

// Welcome toast
setTimeout(() => toast('HCalc siap. Coba ketik dengan keyboard!', 'success', 2200), 400);
