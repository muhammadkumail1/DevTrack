// helpers.js — shared UI components
const { useState, useEffect } = React;
const h = React.createElement;

// Format date
const fmt = d => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// Status Badge
function StatusBadge({ status }) {
  const map = {
    'Active': 'badge-green', 'Completed': 'badge-blue', 'Archived': 'badge-gray',
    'To Do': 'badge-gray', 'In Progress': 'badge-yellow', 'Done': 'badge-green',
    'Open': 'badge-red', 'Resolved': 'badge-green', 'Closed': 'badge-gray',
    'Planned': 'badge-purple', 'Low': 'badge-gray', 'Medium': 'badge-yellow',
    'High': 'badge-red', 'Critical': 'badge-red', 'Major': 'badge-orange',
    'Minor': 'badge-gray', 'Approved': 'badge-green', 'Pending': 'badge-yellow',
    'Manager': 'badge-blue', 'Developer': 'badge-green', 'Tester': 'badge-purple',
    'Admin': 'badge-blue', 'Designer': 'badge-purple', 'DevOps': 'badge-green',
  };
  return h('span', { className: 'badge ' + (map[status] || 'badge-gray') }, status);
}

function daysFrom(value) {
  if (!value) return 0;
  const date = new Date(value);
  const diff = date.getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function PrioDot({ priority }) {
  const map = {
    High: 'var(--red)',
    Medium: 'var(--yellow)',
    Low: 'var(--text3)',
  };
  return h('span', {
    style: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: map[priority] || 'var(--text3)',
      display: 'inline-block',
      flexShrink: 0,
      marginTop: 2,
    }
  });
}

function AvatarInitial({ name, size = 'md' }) {
  const initials = (name || '??').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const sizes = { xs: 24, sm: 32, md: 40 };
  return h('div', {
    style: {
      width: sizes[size] || 32,
      height: sizes[size] || 32,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #4f9cf9, #8b5cf6)',
      color: '#fff',
      display: 'grid',
      placeItems: 'center',
      fontSize: size === 'md' ? 16 : 12,
      fontWeight: 700,
    }
  }, initials);
}

function WorkloadBar({ pct }) {
  return h('div', { style: { width: '100%', height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' } },
    h('div', { style: { width: pct + '%', height: '100%', background: 'var(--accent)', transition: 'width .3s ease' } })
  );
}

function RagDot({ health }) {
  const color = health === 'Healthy' ? 'var(--green)' : health === 'Needs Attention' ? 'var(--yellow)' : 'var(--red)';
  return h('span', {
    style: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      display: 'inline-block',
      background: color,
      marginRight: 6,
    }
  });
}

function HealthBanner({ health, spi, daysLeft, tasksTotal, tasksCompleted }) {
  return h('div', { style: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 16,
    border: '1px solid var(--border2)',
    background: 'linear-gradient(135deg, rgba(79,156,249,0.08), rgba(16,185,129,0.08))',
    gap: 14,
    flexWrap: 'wrap',
  } },
    h('div', null,
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 } },
        h(RagDot, { health }),
        h('div', { style: { fontWeight: 700, fontSize: 14 } }, health)
      ),
      h('div', { style: { fontSize: 12, color: 'var(--text3)' } }, 'Sprint Performance Index (SPI): ', h('strong', { style: { color: 'var(--text)' } }, spi.toFixed(2)))
    ),
    h('div', { style: { textAlign: 'right', minWidth: 120 } },
      h('div', { style: { fontSize: 12, color: 'var(--text3)', marginBottom: 4 } }, 'Days left'),
      h('div', { style: { fontWeight: 700, fontSize: 18 } }, daysLeft != null ? daysLeft : '—')
    ),
    h('div', { style: { textAlign: 'right', minWidth: 140 } },
      h('div', { style: { fontSize: 12, color: 'var(--text3)', marginBottom: 4 } }, 'Task completion'),
      h('div', { style: { fontWeight: 700, fontSize: 18 } }, tasksCompleted + ' / ' + tasksTotal)
    )
  );
}

// Progress Bar
function ProgressBar({ pct }) {
  const color = pct >= 75 ? 'var(--green)' : pct >= 40 ? 'var(--accent)' : 'var(--yellow)';
  return h('div', { style: { background: 'var(--bg3)', borderRadius: 4, height: 4, overflow: 'hidden' } },
    h('div', { style: { width: pct + '%', background: color, height: '100%', borderRadius: 4, transition: 'width .4s' } }));
}

// Spinner
function Spinner() {
  return h('div', { className: 'spinner' });
}

// Empty state
function Empty({ icon, text }) {
  return h('div', { className: 'empty' },
    h('div', { className: 'empty-icon' }, icon),
    h('div', null, text));
}

// Modal wrapper
function Modal({ title, onClose, children }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return React.createElement('div', {
    className: 'modal-overlay',
    onClick: e => { if (e.target === e.currentTarget) onClose(); }
  },
    React.createElement('div', { className: 'modal' },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 } },
        React.createElement('h2', { style: { margin: 0 } }, title),
        React.createElement('button', {
          onClick: onClose,
          style: { background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, cursor: 'pointer', lineHeight: 1 }
        }, '✕')),
      children));
}

// Form field wrapper
function Field({ label, children }) {
  return React.createElement('div', { className: 'field' },
    React.createElement('label', null, label),
    children);
}

// KPI card component used by project overview
function KpiCard({ label, value, sub, accent }) {
  const colors = {
    green: 'var(--green)',
    red: 'var(--red)',
    purple: 'var(--purple)',
    accent: 'var(--accent)',
  };
  return React.createElement('div', { className: 'card', style: { padding: 18, minHeight: 110 } },
    React.createElement('div', { style: { fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 } }, label),
    React.createElement('div', { style: { fontSize: 24, fontWeight: 700, color: colors[accent] || 'var(--text)' } }, value),
    React.createElement('div', { style: { fontSize: 12, color: 'var(--text3)', marginTop: 8 } }, sub));
}

// Page header
function PageHeader({ title, subtitle, action }) {
  return React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 } },
    React.createElement('div', null,
      React.createElement('h1', { style: { fontSize: 20, fontWeight: 600, color: 'var(--text)' } }, title),
      subtitle && React.createElement('p', { style: { fontSize: 13, color: 'var(--text3)', marginTop: 2 } }, subtitle)),
    action && React.createElement('div', null, action));
}
