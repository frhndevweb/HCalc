// Toast notification system
const container = () => document.getElementById('toast-container');

const ICONS = {
  success: 'fa-check-circle',
  error: 'fa-times-circle',
  warning: 'fa-exclamation-triangle',
  info: 'fa-info-circle'
};

export function toast(message, type = 'info', duration = 2600) {
  const c = container();
  if (!c) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fa ${ICONS[type] || ICONS.info}"></i><span>${message}</span>`;
  c.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'all .3s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateX(120%)';
    setTimeout(() => el.remove(), 300);
  }, duration);
}
