// pages/Team.js
function Team({ setPage }) {
  const { user } = useAuth();
  const toast = useToast();
  const [users, setUsers]     = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [modal, setModal]     = React.useState(null);
  const [form, setForm]       = React.useState({ name: '', email: '', password: '', role: 'Developer' });
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const isAdmin = user?.role === 'Admin';

  const load = () => { setLoading(true); api.get('/users').then(d => { if (Array.isArray(d)) setUsers(d); setLoading(false); }); };
  React.useEffect(() => { load(); }, []);

  const save = async () => {
    const r = modal === 'new' ? await api.post('/users', form) : await api.put('/users/' + modal._id, form);
    if (r._id) { toast('Saved'); setModal(null); load(); } else toast(r.message || 'Error', 'error');
  };
  const del = async id => { if (!confirm('Delete user?')) return; const r = await api.del('/users/' + id); if (r.message && r.message !== 'User deleted') { toast(r.message, 'error'); } else { toast('Deleted'); load(); } };
  const openNew  = ()  => { setForm({ name: '', email: '', password: '', role: 'Developer' }); setModal('new'); };
  const openEdit = u   => { setForm({ name: u.name, email: u.email, password: '', role: u.role }); setModal(u); };

  return React.createElement('div', null,
    React.createElement(PageHeader, {
      title: 'Team', subtitle: users.length + ' members',
      action: isAdmin && React.createElement('button', { className: 'btn', onClick: openNew }, '+ Add Member')
    }),

    loading ? React.createElement(Spinner) :
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 } },
      users.map(u =>
        React.createElement('div', { key: u._id, className: 'card' },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 } },
            React.createElement('div', null,
              React.createElement('div', { style: { fontWeight: 600, fontSize: 15, marginBottom: 2 } }, u.name),
              React.createElement('div', { style: { fontSize: 12, color: 'var(--text3)' } }, u.email)
            ),
            React.createElement(StatusBadge, { status: u.role })
          ),
          // Admin accounts: show a read-only notice — no edit/delete buttons
          u.role === 'Admin'
            ? React.createElement('div', {
                style: { marginTop: 10, padding: '6px 10px', borderRadius: 6, background: 'rgba(79,156,249,.08)', border: '1px solid rgba(79,156,249,.2)', fontSize: 11, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6 }
              },
                React.createElement('span', null, '🔒'),
                'Protected — changes require database access'
              )
            // Non-Admin accounts: show edit/delete for Admin users only
            : isAdmin && React.createElement('div', { style: { display: 'flex', gap: 6, marginTop: 12 } },
                React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => openEdit(u) }, 'Edit'),
                React.createElement('button', { className: 'btn btn-danger btn-sm', onClick: () => del(u._id) }, 'Remove')
              )
        )
      )
    ),

    modal && React.createElement(Modal, { title: modal === 'new' ? 'Add Member' : 'Edit Member', onClose: () => setModal(null) },
      React.createElement('div', null,
        React.createElement(Field, { label: 'Name' },  React.createElement('input', { value: form.name,  onChange: e => setF('name',  e.target.value) })),
        React.createElement(Field, { label: 'Email' }, React.createElement('input', { type: 'email', value: form.email, onChange: e => setF('email', e.target.value) })),
        React.createElement(Field, { label: 'Password ' + (modal !== 'new' ? '(leave blank to keep)' : '') },
          React.createElement('input', { type: 'password', value: form.password, onChange: e => setF('password', e.target.value) })
        ),
        React.createElement(Field, { label: 'Role' },
          React.createElement('select', { value: form.role, onChange: e => setF('role', e.target.value) },
            // Admin is excluded — Admin accounts can only be created via code/database
            ['Manager', 'Developer', 'Tester'].map(r => React.createElement('option', { key: r, value: r }, r))
          )
        ),
        React.createElement('div', { style: { fontSize: 11, color: 'var(--text3)', marginTop: 4 } },
          '⚠ Admin accounts can only be created directly in the database.'
        ),
        React.createElement('div', { style: { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 } },
          React.createElement('button', { className: 'btn btn-ghost', onClick: () => setModal(null) }, 'Cancel'),
          React.createElement('button', { className: 'btn', onClick: save }, 'Save')
        )
      )
    )
  );
}

