// pages/Milestones.js
function Milestones({ setPage }) {
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems]       = React.useState([]);
  const [loading, setLoading]   = React.useState(true);
  const [modal, setModal]       = React.useState(null);
  const [projects, setProjects] = React.useState([]);
  const [form, setForm]         = React.useState({ title: '', description: '', project: '', dueDate: '', status: 'Pending' });
  const isManager = user?.role === 'Manager';
  const canManage = isManager || user?.role === 'Admin';
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const load = () => { setLoading(true); api.get('/milestones').then(d => { if (Array.isArray(d)) setItems(d); setLoading(false); }); };
  React.useEffect(() => { load(); api.get('/projects').then(d => Array.isArray(d) && setProjects(d)); }, []);

  const save = async () => {
    const r = modal === 'new' ? await api.post('/milestones', form) : await api.put('/milestones/' + modal._id, form);
    if (r._id) { toast('Saved'); setModal(null); load(); } else toast(r.message || 'Error', 'error');
  };
  const approve = async id => { await api.patch('/milestones/' + id + '/approve'); toast('Approved'); load(); };
  const openNew  = ()  => { setForm({ title: '', description: '', project: '', dueDate: '', status: 'Pending' }); setModal('new'); };
  const openEdit = m   => { setForm({ title: m.title, description: m.description || '', project: m.project?._id || m.project, dueDate: m.dueDate?.split('T')[0] || '', status: m.status }); setModal(m); };

  return React.createElement('div', null,
    React.createElement(PageHeader, {
      title: 'Milestones', subtitle: items.length + ' milestones',
      action: canManage && React.createElement('button', { className: 'btn', onClick: openNew }, '+ New Milestone')
    }),

    loading ? React.createElement(Spinner) :
    items.length === 0 ? React.createElement(Empty, { icon: '◆', text: 'No milestones' }) :
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 150px 120px 100px 140px', gap: 12, padding: '6px 14px', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 600, borderBottom: '1px solid var(--border)' } },
        React.createElement('div', null, 'Title'),
        React.createElement('div', null, 'Project'),
        React.createElement('div', null, 'Due Date'),
        React.createElement('div', null, 'Status'),
        React.createElement('div', null, '')
      ),
      items.map(m =>
        React.createElement('div', { key: m._id, style: { display: 'grid', gridTemplateColumns: '1fr 150px 120px 100px 140px', gap: 12, padding: '12px 14px', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)', alignItems: 'center' } },
          React.createElement('div', null,
            React.createElement('div', { style: { fontWeight: 500 } }, m.title),
            m.description && React.createElement('div', { style: { fontSize: 11, color: 'var(--text3)', marginTop: 1 } }, m.description)
          ),
          React.createElement('div', { style: { fontSize: 12, color: 'var(--text3)' } }, m.project?.title || '—'),
          React.createElement('div', { style: { fontSize: 12, color: 'var(--text3)' } }, fmt(m.dueDate)),
          React.createElement(StatusBadge, { status: m.status }),
          React.createElement('div', { style: { display: 'flex', gap: 4 } },
            canManage && React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => openEdit(m) }, 'Edit'),
            isManager && m.status !== 'Approved' && React.createElement('button', { className: 'btn btn-sm', onClick: () => approve(m._id) }, 'Approve')
          )
        )
      )
    ),

    modal && React.createElement(Modal, { title: modal === 'new' ? 'New Milestone' : 'Edit Milestone', onClose: () => setModal(null) },
      React.createElement('div', null,
        React.createElement(Field, { label: 'Title' }, React.createElement('input', { value: form.title, onChange: e => setF('title', e.target.value) })),
        React.createElement(Field, { label: 'Description' }, React.createElement('textarea', { value: form.description, onChange: e => setF('description', e.target.value), rows: 2 })),
        React.createElement(Field, { label: 'Project' },
          React.createElement('select', { value: form.project, onChange: e => setF('project', e.target.value) },
            React.createElement('option', { value: '' }, '— Select —'),
            projects.map(p => React.createElement('option', { key: p._id, value: p._id }, p.title))
          )
        ),
        React.createElement('div', { className: 'grid2' },
          React.createElement(Field, { label: 'Due Date' }, React.createElement('input', { type: 'date', value: form.dueDate, onChange: e => setF('dueDate', e.target.value) })),
          React.createElement(Field, { label: 'Status' },
            React.createElement('select', { value: form.status, onChange: e => setF('status', e.target.value) },
              ['Pending', 'Completed', 'Approved'].map(v => React.createElement('option', { key: v, value: v }, v))
            )
          )
        ),
        React.createElement('div', { style: { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 } },
          React.createElement('button', { className: 'btn btn-ghost', onClick: () => setModal(null) }, 'Cancel'),
          React.createElement('button', { className: 'btn', onClick: save }, 'Save')
        )
      )
    )
  );
}
