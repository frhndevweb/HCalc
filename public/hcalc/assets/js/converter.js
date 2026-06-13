// Unit converter
const UNITS = {
  length: {
    name: 'Panjang',
    base: 'm',
    items: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 }
  },
  weight: {
    name: 'Berat',
    base: 'kg',
    items: { mg: 0.000001, g: 0.001, kg: 1, ton: 1000, lb: 0.45359237, oz: 0.0283495231 }
  },
  speed: {
    name: 'Kecepatan',
    base: 'm/s',
    items: { 'm/s': 1, 'km/h': 0.27777778, 'mph': 0.44704, 'knot': 0.51444444 }
  },
  time: {
    name: 'Waktu',
    base: 's',
    items: { ms: 0.001, s: 1, min: 60, hour: 3600, day: 86400, week: 604800 }
  },
  temp: {
    name: 'Suhu',
    base: 'C',
    items: { C: 1, F: 1, K: 1 } // handled specially
  }
};

function convert(type, from, to, value) {
  const v = Number(value);
  if (!Number.isFinite(v)) return '';
  if (type === 'temp') {
    // to celsius first
    let c;
    if (from === 'C') c = v;
    else if (from === 'F') c = (v - 32) * 5/9;
    else if (from === 'K') c = v - 273.15;
    let out;
    if (to === 'C') out = c;
    else if (to === 'F') out = c * 9/5 + 32;
    else if (to === 'K') out = c + 273.15;
    return round(out);
  }
  const u = UNITS[type].items;
  const inBase = v * u[from];
  return round(inBase / u[to]);
}

function round(n) {
  if (!Number.isFinite(n)) return '';
  return Math.round(n * 1e10) / 1e10;
}

export const Converter = {
  init() {
    const typeSel = document.getElementById('conv-type');
    const fromSel = document.getElementById('conv-from');
    const toSel = document.getElementById('conv-to');
    const fromVal = document.getElementById('conv-from-val');
    const toVal = document.getElementById('conv-to-val');

    const populate = () => {
      const type = typeSel.value;
      const keys = Object.keys(UNITS[type].items);
      fromSel.innerHTML = keys.map(k => `<option value="${k}">${k}</option>`).join('');
      toSel.innerHTML = keys.map(k => `<option value="${k}">${k}</option>`).join('');
      if (keys.length > 1) toSel.value = keys[1];
      compute();
    };

    const compute = () => {
      toVal.value = convert(typeSel.value, fromSel.value, toSel.value, fromVal.value);
    };

    typeSel.addEventListener('change', populate);
    [fromSel, toSel, fromVal].forEach(el => el.addEventListener('input', compute));
    populate();
  }
};
