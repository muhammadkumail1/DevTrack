// ToastContext.js — toast notification system
const ToastCtx = React.createContext(null);

function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);

  const show = React.useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);

  const toastStyle = (type) => ({
    background: type === 'error' ? '#450a0a' : type === 'info' ? 'var(--bg3)' : '#052e16',
    border: `1px solid ${type === 'error' ? '#7f1d1d' : type === 'info' ? 'var(--border2)' : '#166534'}`,
    color: type === 'error' ? '#fca5a5' : type === 'info' ? 'var(--text)' : 'var(--green)',
    padding: '10px 16px',
    borderRadius: 8,
    fontSize: 13,
    maxWidth: 320,
    animation: 'slideIn .2s ease'
  });

  return React.createElement(ToastCtx.Provider, { value: show },
    children,
    React.createElement('div', {
      style: { position: 'fixed', bottom: 20, right: 20, zIndex: 999, display: 'flex', flexDirection: 'column', gap: 8 }
    },
      toasts.map(t => React.createElement('div', { key: t.id, style: toastStyle(t.type) }, t.msg))
    )
  );
}

const useToast = () => React.useContext(ToastCtx);
