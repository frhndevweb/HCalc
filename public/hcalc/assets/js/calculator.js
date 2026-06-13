// Core calculator engine
import { evaluate, SciFns, factorial } from './scientific.js';
import { toast } from './notifications.js';

export function createCalculator({ exprEl, resultEl, onCommit }) {
  const state = {
    expr: '',
    result: '0',
    memory: 0,
    lastAns: 0,
    justEvaluated: false
  };

  const memInd = document.getElementById('memory-indicator');

  function render() {
    exprEl.textContent = state.expr || '0';
    resultEl.textContent = formatNum(state.result);
  }

  function formatNum(v) {
    if (v === '' || v === null || v === undefined) return '0';
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v);
    // Avoid scientific for small ints; allow for very large
    if (Math.abs(n) >= 1e15 || (n !== 0 && Math.abs(n) < 1e-6)) return n.toExponential(6);
    // Trim trailing zeros
    return parseFloat(n.toFixed(10)).toString();
  }

  function input(token) {
    if (state.justEvaluated && /[0-9.]/.test(token)) {
      state.expr = '';
    }
    state.justEvaluated = false;
    state.expr += token;
    livePreview();
    render();
  }

  function insert(token) {
    if (state.justEvaluated && /[0-9.(]/.test(token[0])) {
      state.expr = '';
    } else if (state.justEvaluated && /[+\-*/%^]/.test(token)) {
      state.expr = state.result;
    }
    state.justEvaluated = false;
    state.expr += token;
    livePreview();
    render();
  }

  function applyFn(fn) {
    // Wrap current numeric result or open new function
    if (fn === 'fact') {
      try {
        const cur = state.expr ? evaluate(state.expr) : 0;
        const v = factorial(Number(cur));
        commit(state.expr + '!', v);
      } catch { error(); }
      return;
    }
    if (fn === 'rand') {
      const v = SciFns.rand();
      state.expr = String(v);
      state.result = String(v);
      state.justEvaluated = true;
      render();
      return;
    }
    // sin, cos, log, etc.
    insert(`${fn}(`);
  }

  function livePreview() {
    try {
      const v = evaluate(state.expr);
      if (v !== undefined && v !== null && !Number.isNaN(v)) {
        state.result = String(v);
      }
    } catch { /* ignore while typing */ }
  }

  function equals() {
    if (!state.expr) return;
    try {
      const v = evaluate(state.expr);
      if (Number.isNaN(v) || !Number.isFinite(v)) throw new Error('Math error');
      commit(state.expr, v);
    } catch (e) {
      error();
    }
  }

  function commit(expr, value) {
    const formatted = formatNum(value);
    onCommit?.(expr, formatted);
    state.lastAns = Number(value);
    state.expr = formatted;
    state.result = formatted;
    state.justEvaluated = true;
    animateResult();
    render();
  }

  function animateResult() {
    resultEl.classList.remove('animate-pop');
    void resultEl.offsetWidth;
    resultEl.classList.add('animate-pop');
  }

  function error() {
    resultEl.classList.add('animate-shake');
    setTimeout(() => resultEl.classList.remove('animate-shake'), 400);
    toast('Expression error', 'error');
  }

  function clear() {
    state.expr = '';
    state.result = '0';
    state.justEvaluated = false;
    render();
  }

  function del() {
    if (state.justEvaluated) { clear(); return; }
    state.expr = state.expr.slice(0, -1);
    livePreview();
    render();
  }

  function ans() { insert(String(state.lastAns)); }

  // Memory
  function mem(op) {
    const cur = Number(state.result) || 0;
    switch (op) {
      case 'MC': state.memory = 0; toast('Memory cleared', 'info'); break;
      case 'MR': insert(String(state.memory)); return;
      case 'M+': state.memory += cur; toast(`M+ ${cur}`, 'success'); break;
      case 'M-': state.memory -= cur; toast(`M− ${cur}`, 'success'); break;
      case 'MS': state.memory = cur; toast(`Memory stored: ${cur}`, 'success'); break;
    }
    memInd?.classList.toggle('active', state.memory !== 0);
  }

  function loadFromHistory(item) {
    state.expr = item.expr;
    state.result = item.result;
    state.justEvaluated = true;
    render();
  }

  render();

  return {
    input, insert, applyFn, equals, clear, del, ans, mem,
    loadFromHistory,
    get expr() { return state.expr; },
    get result() { return state.result; }
  };
}
