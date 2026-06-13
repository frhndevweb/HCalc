// Pure math helpers + safe expression evaluator
const factorial = (n) => {
  n = Number(n);
  if (!Number.isFinite(n) || n < 0 || Math.floor(n) !== n) return NaN;
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
};

export const SciFns = {
  sin: x => Math.sin(x),
  cos: x => Math.cos(x),
  tan: x => Math.tan(x),
  asin: x => Math.asin(x),
  acos: x => Math.acos(x),
  atan: x => Math.atan(x),
  log: x => Math.log10(x),
  ln:  x => Math.log(x),
  sqrt: x => Math.sqrt(x),
  cbrt: x => Math.cbrt(x),
  abs: x => Math.abs(x),
  fact: factorial,
  rand: () => Math.random()
};

/**
 * Normalize a human-friendly expression into valid JS for evaluation.
 * Replaces ×, ÷, π, e, ^, function calls, etc.
 */
export function normalize(expr) {
  if (!expr) return '';
  let s = String(expr);

  // Symbols
  s = s.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
  s = s.replace(/π/g, '(Math.PI)').replace(/(?<![A-Za-z_])e(?![A-Za-z_0-9(])/g, '(Math.E)');

  // Exponent ^
  // a^b → Math.pow(a,b)  — simple non-nested transform
  while (/\^/.test(s)) {
    s = s.replace(/(\([^()]*\)|[\d.]+)\s*\^\s*(\([^()]*\)|[\d.]+)/, 'Math.pow($1,$2)');
    if (/\^/.test(s) && !/(\([^()]*\)|[\d.]+)\s*\^\s*(\([^()]*\)|[\d.]+)/.test(s)) break;
  }

  // Trig + log + others — map word to Math.*
  const map = {
    asin: 'Math.asin', acos: 'Math.acos', atan: 'Math.atan',
    sin: 'Math.sin', cos: 'Math.cos', tan: 'Math.tan',
    sqrt: 'Math.sqrt', cbrt: 'Math.cbrt',
    log: 'Math.log10', ln: 'Math.log',
    abs: 'Math.abs', rand: 'Math.random'
  };
  // Replace longest first to avoid 'sin' clobbering 'asin'
  const keys = Object.keys(map).sort((a,b)=>b.length-a.length);
  for (const k of keys) {
    const re = new RegExp(`\\b${k}\\b`, 'g');
    s = s.replace(re, map[k]);
  }
  return s;
}

/**
 * Safely evaluate a normalized expression.
 * Throws on invalid input.
 */
export function evaluate(expr) {
  const norm = normalize(expr);
  if (!norm.trim()) return 0;
  // Whitelist: digits, ops, Math.*, parentheses, dot, comma, spaces
  if (!/^[\d+\-*/%().,\s]*(?:Math\.[A-Za-z0-9_]+|[\d+\-*/%().,\s])*$/.test(norm)) {
    // Re-check with a tolerant pattern
    if (!/^[\sMath.\d+\-*/%(),\.A-Za-z0-9_]+$/.test(norm)) {
      throw new Error('Invalid expression');
    }
  }
  // eslint-disable-next-line no-new-func
  const val = Function(`"use strict"; return (${norm});`)();
  if (typeof val === 'number' && !Number.isFinite(val)) {
    if (Number.isNaN(val)) throw new Error('Not a number');
  }
  return val;
}

export { factorial };
