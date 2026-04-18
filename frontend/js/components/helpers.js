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
  };
  return h('span', { className: 'badge ' + (map[status] || 'badge-gray') }, status);
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

// Page header
function PageHeader({ title, subtitle, action }) {
  return React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 } },
    React.createElement('div', null,
      React.createElement('h1', { style: { fontSize: 20, fontWeight: 600, color: 'var(--text)' } }, title),
      subtitle && React.createElement('p', { style: { fontSize: 13, color: 'var(--text3)', marginTop: 2 } }, subtitle)),
    action && React.createElement('div', null, action));
}
