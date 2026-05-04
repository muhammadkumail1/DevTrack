// pages/Auth.js — Login and Register
function AuthPage() {
  const { login, register } = useAuth();
  const toast = useToast();
  const [mode, setMode]     = React.useState('login');
  const [form, setForm]     = React.useState({ name: '', email: '', password: '', role: 'Developer' });
  const [loading, setLoading] = React.useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    setLoading(true);
    const result = mode === 'login'
      ? await login(form.email, form.password)
      : await register(form.name, form.email, form.password, form.role);
    if (result !== true) toast(result, 'error');
    setLoading(false);
  };

  return React.createElement('div', {
    style: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }
  },
    React.createElement('div', {
      style: { width: 360, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }
    },
      React.createElement('div', { style: { fontFamily: "'DM Mono',monospace", fontSize: 18, fontWeight: 500, letterSpacing: '2px', color: 'var(--accent)', marginBottom: 4 } }, 'DevTrack'),
      React.createElement('div', { style: { fontSize: 12, color: 'var(--text3)', marginBottom: 28 } }, mode === 'login' ? 'Sign in to continue' : 'Create an account'),

      mode === 'register' && React.createElement(Field, { label: 'Full Name' },
        React.createElement('input', { value: form.name, onChange: e => set('name', e.target.value), placeholder: 'Your name' })
      ),
      React.createElement(Field, { label: 'Email' },
        React.createElement('input', { type: 'email', value: form.email, onChange: e => set('email', e.target.value), placeholder: 'you@example.com' })
      ),
      React.createElement(Field, { label: 'Password' },
        React.createElement('input', { type: 'password', value: form.password, onChange: e => set('password', e.target.value), onKeyDown: e => e.key === 'Enter' && submit() })
      ),
      mode === 'register' && React.createElement(Field, { label: 'Role' },
        React.createElement('select', { value: form.role, onChange: e => set('role', e.target.value) },
          ['Developer', 'Tester', 'Manager', 'Admin'].map(r => React.createElement('option', { key: r, value: r }, r))
        )
      ),

      React.createElement('button', {
        className: 'btn',
        onClick: submit,
        disabled: loading,
        style: { width: '100%', padding: '10px', justifyContent: 'center', marginTop: 8, opacity: loading ? .6 : 1 }
      }, loading ? '...' : (mode === 'login' ? 'Sign In' : 'Create Account')),

      React.createElement('div', { style: { textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text3)' } },
        mode === 'login' ? 'No account? ' : 'Have an account? ',
        React.createElement('span', {
          onClick: () => setMode(mode === 'login' ? 'register' : 'login'),
          style: { color: 'var(--accent)', cursor: 'pointer' }
        }, mode === 'login' ? 'Register' : 'Sign in')
      )
    )
  );
}
