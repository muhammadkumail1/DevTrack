// pages/Roles.js
function Roles({ setPage }) {
  const toast = useToast();
  const [roles, setRoles]     = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [modal, setModal]     = React.useState(null); // null | 'new' | role-object
  const [form, setForm]       = React.useState({ name: '', description: '' });
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const load = () => {
    setLoading(true);
    api.get('/roles').then(d => { if (Array.isArray(d)) setRoles(d); setLoading(false); });
  };
  React.useEffect(() => { load(); }, []);

  const openNew  = ()  => { setForm({ name: '', description: '' }); setModal('new'); };
  const openEdit = r   => { setForm({ name: r.name, description: r.description || '' }); setModal(r); };

  const save = async () => {
    if (!form.name.trim()) { toast('Role name is required', 'error'); return; }
    const r = modal === 'new'
      ? await api.post('/roles', form)
      : await api.put('/roles/' + modal._id, form);
    if (r._id) { toast('Role saved'); setModal(null); load(); }
    else toast(r.message || 'Error', 'error');
  };

  const del = async id => {
    if (!confirm('Delete this role?')) return;
    const r = await api.del('/roles/' + id);
    if (r.message === 'Role deleted') { toast('Role deleted'); load(); }
    else toast(r.message || 'Error', 'error');
  };

  const systemBadge = isSystem =>
    React.createElement('span', {
      style: {
        fontSize: 10, padding: '2px 7px', borderRadius: 20,
        background: isSystem ? 'var(--bg3)' : '#0c1a3b',
        color: isSystem ? 'var(--text3)' : '#93c5fd',
        fontFamily: "'DM Mono',monospace", fontWeight: 500
      }
    }, isSystem ? 'system' : 'custom');

  return React.createElement('div', null,
    React.createElement(PageHeader, {
      title: 'Company Roles',
      subtitle: roles.length + ' roles — manage organisation-wide roles',
      action: React.createElement('button', { className: 'btn', onClick: openNew }, '+ New Role')
    }),

    loading ? React.createElement(Spinner) :
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 } },
      roles.map(r =>
        React.createElement('div', { key: r._id, className: 'card', style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
            React.createElement('div', { style: { fontWeight: 600, fontSize: 15 } }, r.name),
            systemBadge(r.isSystem)
          ),
          r.description && React.createElement('p', { style: { fontSize: 12, color: 'var(--text3)', lineHeight: 1.5, flex: 1 } }, r.description),
          !r.isSystem && React.createElement('div', { style: { display: 'flex', gap: 6, marginTop: 4 } },
            React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => openEdit(r) }, 'Edit'),
            React.createElement('button', { className: 'btn btn-danger btn-sm', onClick: () => del(r._id) }, 'Delete')
          )
        )
      )
    ),

    modal && React.createElement(Modal, { title: modal === 'new' ? 'New Role' : 'Edit Role', onClose: () => setModal(null) },
      React.createElement('div', null,
        React.createElement(Field, { label: 'Role Name' },
          React.createElement('input', {
            value: form.name, onChange: e => setF('name', e.target.value),
            placeholder: 'e.g. Security Engineer'
          })
        ),
        React.createElement(Field, { label: 'Description (optional)' },
          React.createElement('textarea', {
            value: form.description, onChange: e => setF('description', e.target.value),
            rows: 3, placeholder: 'Describe this role\'s responsibilities'
          })
        ),
        React.createElement('div', { style: { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 } },
          React.createElement('button', { className: 'btn btn-ghost', onClick: () => setModal(null) }, 'Cancel'),
          React.createElement('button', { className: 'btn', onClick: save }, 'Save')
        )
      )
    )
  );
}
