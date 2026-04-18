// pages/Sprints.js
function Sprints() {
  const { user } = useAuth();
  const toast = useToast();
  const [sprints, setSprints]   = React.useState([]);
  const [loading, setLoading]   = React.useState(true);
  const [modal, setModal]       = React.useState(null);
  const [projects, setProjects] = React.useState([]);
  const [filter, setFilter]     = React.useState('');
  const [form, setForm]         = React.useState({ name: '', project: '', startDate: '', endDate: '', status: 'Planned' });
  const isManager = user?.role === 'Manager';
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const load = () => {
    setLoading(true);
    api.get('/sprints' + (filter ? '?project=' + filter : '')).then(d => { if (Array.isArray(d)) setSprints(d); setLoading(false); });
  };
  React.useEffect(() => { api.get('/projects').then(d => Array.isArray(d) && setProjects(d)); }, []);
  React.useEffect(() => { load(); }, [filter]);

  const save = async () => {
    const r = modal === 'new' ? await api.post('/sprints', form) : await api.put('/sprints/' + modal._id, form);
    if (r._id) { toast('Sprint saved'); setModal(null); load(); } else toast(r.message || 'Error', 'error');
  };
  const del = async id => { if (!confirm('Delete?')) return; await api.del('/sprints/' + id); toast('Deleted'); load(); };
  const openNew  = ()  => { setForm({ name: '', project: '', startDate: '', endDate: '', status: 'Planned' }); setModal('new'); };
  const openEdit = s   => { setForm({ name: s.name, project: s.project?._id || s.project, startDate: s.startDate?.split('T')[0] || '', endDate: s.endDate?.split('T')[0] || '', status: s.status }); setModal(s); };

  return React.createElement('div', null,
    React.createElement(PageHeader, {
      title: 'Sprints', subtitle: sprints.length + ' sprints',
      action: isManager && React.createElement('button', { className: 'btn', onClick: openNew }, '+ New Sprint')
    }),
    React.createElement('select', { style: { width: 200, marginBottom: 20 }, value: filter, onChange: e => setFilter(e.target.value) },
      React.createElement('option', { value: '' }, 'All Projects'),
      projects.map(p => React.createElement('option', { key: p._id, value: p._id }, p.title))
    ),

    loading ? React.createElement(Spinner) :
    sprints.length === 0 ? React.createElement(Empty, { icon: '◎', text: 'No sprints yet' }) :
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 } },
      sprints.map(s =>
        React.createElement('div', { key: s._id, className: 'card' },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 } },
            React.createElement('span', { style: { fontWeight: 600, fontSize: 14 } }, s.name),
            React.createElement(StatusBadge, { status: s.status })
          ),
          React.createElement('div', { style: { fontSize: 12, color: 'var(--text3)', marginBottom: 8 } }, s.project?.title || '—'),
          React.createElement('div', { style: { fontSize: 12, color: 'var(--text3)', marginBottom: 10 } }, fmt(s.startDate) + ' → ' + fmt(s.endDate)),
          s.tasks && React.createElement('div', null,
            React.createElement('div', { style: { display: 'flex', gap: 8, fontSize: 11, marginBottom: 6 } },
              React.createElement('span', { style: { color: 'var(--text3)' } }, 'Todo: ' + s.tasks.todo),
              React.createElement('span', { style: { color: 'var(--text3)' } }, 'In Progress: ' + s.tasks.inProgress),
              React.createElement('span', { style: { color: 'var(--text3)' } }, 'Done: ' + s.tasks.completed)
            ),
            React.createElement(ProgressBar, { pct: s.progress || 0 })
          ),
          isManager && React.createElement('div', { style: { display: 'flex', gap: 6, marginTop: 12 } },
            React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => openEdit(s) }, 'Edit'),
            React.createElement('button', { className: 'btn btn-danger btn-sm', onClick: () => del(s._id) }, 'Delete')
          )
        )
      )
    ),

    modal && React.createElement(Modal, { title: modal === 'new' ? 'New Sprint' : 'Edit Sprint', onClose: () => setModal(null) },
      React.createElement('div', null,
        React.createElement(Field, { label: 'Name' }, React.createElement('input', { value: form.name, onChange: e => setF('name', e.target.value) })),
        React.createElement(Field, { label: 'Project' },
          React.createElement('select', { value: form.project, onChange: e => setF('project', e.target.value) },
            React.createElement('option', { value: '' }, '— Select —'),
            projects.map(p => React.createElement('option', { key: p._id, value: p._id }, p.title))
          )
        ),
        React.createElement('div', { className: 'grid2' },
          React.createElement(Field, { label: 'Start' }, React.createElement('input', { type: 'date', value: form.startDate, onChange: e => setF('startDate', e.target.value) })),
          React.createElement(Field, { label: 'End' },   React.createElement('input', { type: 'date', value: form.endDate,   onChange: e => setF('endDate',   e.target.value) }))
        ),
        React.createElement(Field, { label: 'Status' },
          React.createElement('select', { value: form.status, onChange: e => setF('status', e.target.value) },
            ['Planned', 'Active', 'Completed'].map(v => React.createElement('option', { key: v, value: v }, v))
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
