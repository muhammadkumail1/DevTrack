// pages/Projects.js
function ProjectForm({ initial, onSave, onClose }) {
  const [form, setForm] = React.useState(initial || { title: '', description: '', status: 'Active', startDate: '', endDate: '', members: [] });
  const [allUsers, setAllUsers] = React.useState([]);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  React.useEffect(() => {
    api.get('/users').then(d => Array.isArray(d) && setAllUsers(d));
    // Pre-populate members from initial (they arrive as objects with _id)
    if (initial?.members) {
      setForm(p => ({
        ...p,
        members: initial.members.map(m => m._id || m)
      }));
    }
  }, []);

  const toggleMember = (uid) => {
    setForm(p => ({
      ...p,
      members: p.members.includes(uid)
        ? p.members.filter(id => id !== uid)
        : [...p.members, uid]
    }));
  };

  return React.createElement('div', null,
    React.createElement(Field, { label: 'Title' }, React.createElement('input', { value: form.title, onChange: e => set('title', e.target.value), placeholder: 'Project title' })),
    React.createElement(Field, { label: 'Description' }, React.createElement('textarea', { value: form.description, onChange: e => set('description', e.target.value), rows: 2, style: { resize: 'vertical' } })),
    React.createElement('div', { className: 'grid2' },
      React.createElement(Field, { label: 'Start Date' }, React.createElement('input', { type: 'date', value: form.startDate?.split('T')[0] || '', onChange: e => set('startDate', e.target.value) })),
      React.createElement(Field, { label: 'End Date' },   React.createElement('input', { type: 'date', value: form.endDate?.split('T')[0]   || '', onChange: e => set('endDate', e.target.value) }))
    ),
    React.createElement(Field, { label: 'Status' },
      React.createElement('select', { value: form.status, onChange: e => set('status', e.target.value) },
        ['Active', 'Completed', 'Archived'].map(s => React.createElement('option', { key: s, value: s }, s))
      )
    ),
    React.createElement(Field, { label: 'Team Members' },
      React.createElement('div', null,
        // Chips for selected members
        form.members.length > 0 && React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 } },
          form.members.map(uid => {
            const u = allUsers.find(x => (x._id || x) === uid);
            return u ? React.createElement('span', {
              key: uid,
              style: { display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 20, padding: '2px 8px', fontSize: 11, color: 'var(--text2)' }
            },
              u.name,
              React.createElement('span', { style: { cursor: 'pointer', color: 'var(--text3)', fontWeight: 700, marginLeft: 2 }, onClick: () => toggleMember(uid) }, '×')
            ) : null;
          })
        ),
        React.createElement('select', {
          value: '',
          onChange: e => { if (e.target.value) toggleMember(e.target.value); },
          style: { width: '100%' }
        },
          React.createElement('option', { value: '' }, '— Add a member —'),
          allUsers.filter(u => !form.members.includes(u._id)).map(u =>
            React.createElement('option', { key: u._id, value: u._id }, u.name + ' (' + u.role + ')')
          )
        )
      )
    ),
    React.createElement('div', { style: { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 } },
      React.createElement('button', { className: 'btn btn-ghost', onClick: onClose }, 'Cancel'),
      React.createElement('button', { className: 'btn', onClick: () => onSave(form) }, 'Save')
    )
  );
}

function Projects({ setPage }) {
  const { user } = useAuth();
  const toast = useToast();
  const [projects, setProjects] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [modal, setModal] = React.useState(null);
  const [activeProject, setActiveProject] = React.useState(null);
  const isAdmin   = user?.role === 'Admin';
  const isManager = user?.role === 'Manager';
  const canManage = isManager || isAdmin; // can create / edit / archive

  const load = () => {
    setLoading(true);
    api.get('/projects').then(d => { if (Array.isArray(d)) setProjects(d); setLoading(false); });
  };
  React.useEffect(() => { load(); }, []);

  const save = async (form) => {
    const res = modal && modal._id ? await api.put('/projects/' + modal._id, form) : await api.post('/projects', form);
    if (res._id) { toast('Project saved'); setModal(null); load(); } else toast(res.message || 'Error', 'error');
  };
  const archive = async id => { await api.patch('/projects/' + id + '/archive'); toast('Archived'); load(); };
  const del = async id => { if (!confirm('Delete this project?')) return; await api.del('/projects/' + id); toast('Deleted'); load(); };

  if (activeProject) {
    return React.createElement(window.ProjectDashboard, { project: activeProject, onBack: () => { setActiveProject(null); load(); } });
  }

  return React.createElement('div', null,
    React.createElement(PageHeader, {
      title: 'Projects', subtitle: projects.length + ' total',
      action: canManage && React.createElement('button', { className: 'btn', onClick: () => setModal('create') }, '+ New Project')
    }),

    loading ? React.createElement(Spinner) :
    projects.length === 0 ? React.createElement(Empty, { icon: '◈', text: 'No projects found' }) :
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 12 } },
      projects.map(p =>
        React.createElement('div', { key: p._id, className: 'card' },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 } },
            React.createElement('div', { style: { fontWeight: 600, fontSize: 15 } }, p.title),
            React.createElement(StatusBadge, { status: p.status })
          ),
          p.description && React.createElement('p', { style: { fontSize: 12, color: 'var(--text3)', marginBottom: 10, lineHeight: 1.4 } }, p.description),
          React.createElement('div', { style: { display: 'flex', gap: 16, marginBottom: 12 } },
            React.createElement('span', { style: { fontSize: 12, color: 'var(--text3)' } }, p.tasksCompleted + '/' + p.tasksTotal + ' tasks'),
            React.createElement('span', { style: { fontSize: 12, color: 'var(--text3)' } }, p.bugsCount + ' bugs')
          ),
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 } },
            React.createElement('div', { style: { flex: 1 } }, React.createElement(ProgressBar, { pct: p.progress || 0 })),
            React.createElement('span', { style: { fontSize: 12, fontFamily: "'DM Mono',monospace", color: 'var(--text2)' } }, p.progress + '%')
          ),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
            React.createElement('span', { style: { fontSize: 11, color: 'var(--text3)' } }, p.manager?.name || '—'),
            React.createElement('div', { style: { display: 'flex', gap: 6 } },
              React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => setActiveProject(p) }, 'Open'),
              // Managers can only edit/archive projects they own; Admin can edit all
              canManage && (isAdmin || p.manager?._id === user?._id || p.manager === user?._id) && React.createElement(React.Fragment, null,
                React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => setModal(p) }, 'Edit'),
                p.status !== 'Archived' && React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => archive(p._id) }, 'Archive')
              ),
              // Only Admin can permanently delete
              isAdmin && React.createElement('button', { className: 'btn btn-danger btn-sm', onClick: () => del(p._id) }, 'Del')
            )
          )
        )
      )
    ),

    modal && React.createElement(Modal, { title: modal === 'create' ? 'New Project' : 'Edit Project', onClose: () => setModal(null) },
      React.createElement(ProjectForm, { initial: modal !== 'create' ? modal : null, onSave: save, onClose: () => setModal(null) })
    )
  );
}
