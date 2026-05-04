// pages/Tasks.js
function TaskForm({ initial, projects, users, sprints, onSave, onClose }) {
  const [form, setForm] = React.useState(initial || { title: '', description: '', project: '', sprint: '', assignedTo: '', priority: 'Medium', status: 'To Do', dueDate: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const projectSprints = sprints.filter(s => s.project?._id === form.project || s.project === form.project);

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
      React.createElement(Field, { label: 'Sprint' },
        React.createElement('select', { value: form.sprint?._id || form.sprint || '', onChange: e => set('sprint', e.target.value) },
          React.createElement('option', { value: '' }, '— None —'),
          projectSprints.map(s => React.createElement('option', { key: s._id, value: s._id }, s.name))
        )
      ),
      React.createElement(Field, { label: 'Assigned To' },
        React.createElement('select', { value: form.assignedTo?._id || form.assignedTo || '', onChange: e => set('assignedTo', e.target.value) },
          React.createElement('option', { value: '' }, '— Unassigned —'),
          users.map(u => React.createElement('option', { key: u._id, value: u._id }, u.name))
        )
      )
    ),
    React.createElement('div', { className: 'grid2' },
      React.createElement(Field, { label: 'Priority' },
        React.createElement('select', { value: form.priority, onChange: e => set('priority', e.target.value) },
          ['Low', 'Medium', 'High'].map(v => React.createElement('option', { key: v, value: v }, v))
        )
      ),
      React.createElement(Field, { label: 'Status' },
        React.createElement('select', { value: form.status, onChange: e => set('status', e.target.value) },
          ['To Do', 'In Progress', 'Done'].map(v => React.createElement('option', { key: v, value: v }, v))
        )
      )
    ),
    React.createElement(Field, { label: 'Due Date' }, React.createElement('input', { type: 'date', value: form.dueDate?.split('T')[0] || '', onChange: e => set('dueDate', e.target.value) })),
    React.createElement('div', { style: { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 } },
      React.createElement('button', { className: 'btn btn-ghost', onClick: onClose }, 'Cancel'),
      React.createElement('button', { className: 'btn', onClick: () => onSave(form) }, 'Save')
    )
  );
}

function Tasks({ setPage }) {
  const { user } = useAuth();
  const toast = useToast();
  const [tasks, setTasks]       = React.useState([]);
  const [loading, setLoading]   = React.useState(true);
  const [modal, setModal]       = React.useState(null);
  const [projects, setProjects] = React.useState([]);
  const [users, setUsers]       = React.useState([]);
  const [sprints, setSprints]   = React.useState([]);
  const [filter, setFilter]     = React.useState({ project: '', status: '' });
  const canDelete = user?.role === 'Manager' || user?.role === 'Admin';

  const load = () => {
    setLoading(true);
    const q = new URLSearchParams();
    if (filter.project) q.set('project', filter.project);
    if (filter.status)  q.set('status',  filter.status);
    api.get('/tasks?' + q).then(d => { if (Array.isArray(d)) setTasks(d); setLoading(false); });
  };

  React.useEffect(() => {
    api.get('/projects').then(d => Array.isArray(d) && setProjects(d));
    api.get('/users').then(d   => Array.isArray(d) && setUsers(d));
    api.get('/sprints').then(d => Array.isArray(d) && setSprints(d));
  }, []);
  React.useEffect(() => { load(); }, [filter]);

  const save = async form => {
    const clean = { ...form, project: form.project?._id || form.project || undefined, sprint: form.sprint?._id || form.sprint || undefined, assignedTo: form.assignedTo?._id || form.assignedTo || undefined };
    const r = modal && modal._id ? await api.put('/tasks/' + modal._id, clean) : await api.post('/tasks', clean);
    if (r._id) { toast('Task saved'); setModal(null); load(); } else toast(r.message || 'Error', 'error');
  };
  const del = async id => { if (!confirm('Delete?')) return; await api.del('/tasks/' + id); toast('Deleted'); load(); };

  const priorityColor = { Low: 'var(--text3)', Medium: 'var(--yellow)', High: 'var(--red)' };

  return React.createElement('div', null,
    React.createElement(PageHeader, {
      title: 'Tasks', subtitle: tasks.length + ' tasks',
      action: React.createElement('button', { className: 'btn', onClick: () => setModal('new') }, '+ New Task')
    }),
    React.createElement('div', { style: { display: 'flex', gap: 10, marginBottom: 20 } },
      React.createElement('select', { style: { width: 180 }, value: filter.project, onChange: e => setFilter(f => ({ ...f, project: e.target.value })) },
        React.createElement('option', { value: '' }, 'All Projects'),
        projects.map(p => React.createElement('option', { key: p._id, value: p._id }, p.title))
      ),
      React.createElement('select', { style: { width: 140 }, value: filter.status, onChange: e => setFilter(f => ({ ...f, status: e.target.value })) },
        React.createElement('option', { value: '' }, 'All Statuses'),
        ['To Do', 'In Progress', 'Done'].map(s => React.createElement('option', { key: s, value: s }, s))
      )
    ),

    loading ? React.createElement(Spinner) :
    tasks.length === 0 ? React.createElement(Empty, { icon: '◻', text: 'No tasks found' }) :
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 130px 120px 100px 120px 100px 120px', gap: 12, padding: '6px 12px', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 600, borderBottom: '1px solid var(--border)' } },
        React.createElement('div', null, 'Title'),
        React.createElement('div', null, 'Project'),
        React.createElement('div', null, 'Assigned'),
        React.createElement('div', null, 'Priority'),
        React.createElement('div', null, 'Status'),
        React.createElement('div', null, 'Due'),
        React.createElement('div', null, '')
      ),
      tasks.map(t =>
        React.createElement('div', { key: t._id, style: { display: 'grid', gridTemplateColumns: '1fr 130px 120px 100px 120px 100px 120px', gap: 12, padding: '10px 12px', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)', alignItems: 'center' } },
          React.createElement('div', null,
            React.createElement('div', { style: { fontWeight: 500, fontSize: 13 } }, t.title),
            t.description && React.createElement('div', { style: { fontSize: 11, color: 'var(--text3)', marginTop: 1 } }, t.description.slice(0, 60) + (t.description.length > 60 ? '...' : ''))
          ),
          React.createElement('div', { style: { fontSize: 12, color: 'var(--text3)' } }, t.project?.title || '—'),
          React.createElement('div', { style: { fontSize: 12, color: 'var(--text2)' } }, t.assignedTo?.name || '—'),
          React.createElement('span', { style: { fontSize: 11, color: priorityColor[t.priority] || 'var(--text3)', fontFamily: "'DM Mono',monospace" } }, t.priority),
          React.createElement(StatusBadge, { status: t.status }),
          React.createElement('div', { style: { fontSize: 11, color: 'var(--text3)' } }, fmt(t.dueDate)),
          React.createElement('div', { style: { display: 'flex', gap: 4, justifyContent: 'flex-start', alignItems: 'center' } },
            React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => setModal(t) }, 'Edit'),
            canDelete && React.createElement('button', { className: 'btn btn-danger btn-sm', onClick: () => del(t._id) }, 'Del')
          )
        )
      )
    ),

    modal && React.createElement(Modal, { title: modal === 'new' ? 'New Task' : 'Edit Task', onClose: () => setModal(null) },
      React.createElement(TaskForm, { initial: modal !== 'new' ? modal : null, projects, users, sprints, onSave: save, onClose: () => setModal(null) })
    )
  );
}
