// pages/Bugs.js
function BugForm({ initial, projects, users, onSave, onClose }) {
  const [form, setForm] = React.useState(initial || { title: '', description: '', project: '', severity: 'Minor', status: 'Open', assignedTo: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return React.createElement('div', null,
    React.createElement(Field, { label: 'Title' }, React.createElement('input', { value: form.title, onChange: e => set('title', e.target.value) })),
    React.createElement(Field, { label: 'Description' }, React.createElement('textarea', { value: form.description, onChange: e => set('description', e.target.value), rows: 2 })),
    React.createElement(Field, { label: 'Project' },
      React.createElement('select', { value: form.project?._id || form.project || '', onChange: e => set('project', e.target.value) },
        React.createElement('option', { value: '' }, '— Select Project —'),
        projects.map(p => React.createElement('option', { key: p._id, value: p._id }, p.title))
      )
    ),
    React.createElement('div', { className: 'grid2' },
      React.createElement(Field, { label: 'Severity' },
        React.createElement('select', { value: form.severity, onChange: e => set('severity', e.target.value) },
          ['Minor', 'Major', 'Critical'].map(v => React.createElement('option', { key: v, value: v }, v))
        )
      ),
      React.createElement(Field, { label: 'Status' },
        React.createElement('select', { value: form.status, onChange: e => set('status', e.target.value) },
          ['Open', 'In Progress', 'Resolved', 'Closed'].map(v => React.createElement('option', { key: v, value: v }, v))
        )
      )
    ),
    React.createElement(Field, { label: 'Assigned To' },
      React.createElement('select', { value: form.assignedTo?._id || form.assignedTo || '', onChange: e => set('assignedTo', e.target.value) },
        React.createElement('option', { value: '' }, '— Unassigned —'),
        users.map(u => React.createElement('option', { key: u._id, value: u._id }, u.name))
      )
    ),
    React.createElement('div', { style: { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 } },
      React.createElement('button', { className: 'btn btn-ghost', onClick: onClose }, 'Cancel'),
      React.createElement('button', { className: 'btn', onClick: () => onSave(form) }, 'Save')
    )
  );
}

function Bugs({ setPage }) {
  const { user } = useAuth();
  const toast = useToast();
  const [bugs, setBugs]         = React.useState([]);
  const [loading, setLoading]   = React.useState(true);
  const [modal, setModal]       = React.useState(null);
  const [projects, setProjects] = React.useState([]);
  const [users, setUsers]       = React.useState([]);
  const [filter, setFilter]     = React.useState({ project: '', severity: '', status: '' });
  const canDelete = user?.role === 'Manager' || user?.role === 'Admin';

  const load = () => {
    setLoading(true);
    const q = new URLSearchParams();
    if (filter.project)  q.set('project',  filter.project);
    if (filter.severity) q.set('severity', filter.severity);
    if (filter.status)   q.set('status',   filter.status);
    api.get('/bugs?' + q).then(d => { if (Array.isArray(d)) setBugs(d); setLoading(false); });
  };

  React.useEffect(() => {
    api.get('/projects').then(d => Array.isArray(d) && setProjects(d));
    api.get('/users').then(d   => Array.isArray(d) && setUsers(d));
  }, []);
  React.useEffect(() => { load(); }, [filter]);

  const save = async form => {
    const clean = { ...form, project: form.project?._id || form.project || undefined, assignedTo: form.assignedTo?._id || form.assignedTo || undefined };
    const r = modal && modal._id ? await api.put('/bugs/' + modal._id, clean) : await api.post('/bugs', clean);
    if (r._id) { toast('Bug saved'); setModal(null); load(); } else toast(r.message || 'Error', 'error');
  };
  const close = async id => { await api.patch('/bugs/' + id + '/close'); toast('Bug closed'); load(); };
  const del   = async id => { if (!confirm('Delete?')) return; await api.del('/bugs/' + id); toast('Deleted'); load(); };

  const sevColor = { Minor: 'var(--text3)', Major: 'var(--orange)', Critical: 'var(--red)' };

  return React.createElement('div', null,
    React.createElement(PageHeader, {
      title: 'Bug Tracker', subtitle: bugs.length + ' bugs',
      action: React.createElement('button', { className: 'btn', onClick: () => setModal('new') }, '+ Report Bug')
    }),
    React.createElement('div', { style: { display: 'flex', gap: 10, marginBottom: 20 } },
      React.createElement('select', { style: { width: 180 }, value: filter.project, onChange: e => setFilter(f => ({ ...f, project: e.target.value })) },
        React.createElement('option', { value: '' }, 'All Projects'),
        projects.map(p => React.createElement('option', { key: p._id, value: p._id }, p.title))
      ),
      React.createElement('select', { style: { width: 130 }, value: filter.severity, onChange: e => setFilter(f => ({ ...f, severity: e.target.value })) },
        React.createElement('option', { value: '' }, 'All Severity'),
        ['Minor', 'Major', 'Critical'].map(s => React.createElement('option', { key: s, value: s }, s))
      ),
      React.createElement('select', { style: { width: 130 }, value: filter.status, onChange: e => setFilter(f => ({ ...f, status: e.target.value })) },
        React.createElement('option', { value: '' }, 'All Statuses'),
        ['Open', 'In Progress', 'Resolved', 'Closed'].map(s => React.createElement('option', { key: s, value: s }, s))
      )
    ),

    loading ? React.createElement(Spinner) :
    bugs.length === 0 ? React.createElement(Empty, { icon: '⬡', text: 'No bugs found' }) :
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 130px 100px 120px 120px 140px', gap: 12, padding: '6px 14px', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 600, borderBottom: '1px solid var(--border)' } },
        React.createElement('div', null, 'Title'),
        React.createElement('div', null, 'Project'),
        React.createElement('div', null, 'Severity'),
        React.createElement('div', null, 'Status'),
        React.createElement('div', null, 'Assigned'),
        React.createElement('div', null, '')
      ),
      bugs.map(b =>
        React.createElement('div', { key: b._id, style: { display: 'grid', gridTemplateColumns: '1fr 130px 100px 120px 120px 140px', gap: 12, padding: '10px 14px', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)', alignItems: 'center' } },
          React.createElement('div', null,
            React.createElement('div', { style: { fontWeight: 500, fontSize: 13 } }, b.title),
            b.description && React.createElement('div', { style: { fontSize: 11, color: 'var(--text3)', marginTop: 1 } }, b.description.slice(0, 60) + (b.description.length > 60 ? '...' : ''))
          ),
          React.createElement('div', { style: { fontSize: 12, color: 'var(--text3)' } }, b.project?.title || '—'),
          React.createElement('span', { style: { fontSize: 11, color: sevColor[b.severity], fontFamily: "'DM Mono',monospace", fontWeight: 500 } }, b.severity),
          React.createElement(StatusBadge, { status: b.status }),
          React.createElement('div', { style: { fontSize: 12, color: 'var(--text2)' } }, b.assignedTo?.name || '—'),
          React.createElement('div', { style: { display: 'flex', gap: 4, justifyContent: 'flex-start', alignItems: 'center', flexWrap: 'wrap' } },
            React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => setModal(b) }, 'Edit'),
            b.status !== 'Closed' && React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => close(b._id) }, 'Close'),
            canDelete && React.createElement('button', { className: 'btn btn-danger btn-sm', onClick: () => del(b._id) }, 'Del')
          )
        )
      )
    ),

    modal && React.createElement(Modal, { title: modal === 'new' ? 'Report Bug' : 'Edit Bug', onClose: () => setModal(null) },
      React.createElement(BugForm, { initial: modal !== 'new' ? modal : null, projects, users, onSave: save, onClose: () => setModal(null) })
    )
  );
}
