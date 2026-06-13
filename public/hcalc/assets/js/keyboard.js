// Keyboard support
export function bindKeyboard(calc) {
  window.addEventListener('keydown', (e) => {
    // Skip if user is typing in an input/textarea
    const tag = (e.target.tagName || '').toLowerCase();
    if (['input', 'textarea', 'select'].includes(tag)) return;

    const k = e.key;
    if (/^[0-9]$/.test(k)) return calc.input(k);
    if (k === '.') return calc.input('.');
    if (k === '+' || k === '-' || k === '*' || k === '/' || k === '%') return calc.input(k);
    if (k === '(' || k === ')') return calc.input(k);
    if (k === 'Enter' || k === '=') { e.preventDefault(); return calc.equals(); }
    if (k === 'Backspace') { e.preventDefault(); return calc.del(); }
    if (k === 'Delete' || k === 'Escape') return calc.clear();
  });
}
