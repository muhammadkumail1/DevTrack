// pages/WorkLogs.js
function WorkLogs({ setPage }) {
  const { user } = useAuth();
  const toast = useToast();
  const [worklogs, setWorklogs] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  const [tasks, setTasks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [modal, setModal] = React.useState(null);
  const [form, setForm] = React.useState({ user: '', task: '', hours: '', date: '' });
  const canManage = user?.role === 'Manager' || user?.role === 'Admin';

  const load = async () => {
    setLoading(true);
    const [wl, us, ts] = await Promise.all([
      api.get('/worklogs'),
      api.get('/users'),
      api.get('/tasks'),
    ]);
    if (Array.isArray(wl)) setWorklogs(wl);
    if (Array.isArray(us)) setUsers(us);
    if (Array.isArray(ts)) setTasks(ts);
    setLoading(false);
  };

  React.useEffect(() => { load(); }, []);

  const openNew = () => {
    setForm({
      // Developers default to themselves; Manager/Admin can pick anyone
      user: canManage ? '' : (user?._id || ''),
      task: '',
      hours: '',
      date: new Date().toISOString().split('T')[0],
    });
    setModal('new');
  };

  const openEdit = (entry) => {
    setForm({
      user: entry.user?._id || '',
      task: entry.task?._id || '',
      hours: entry.hours || '',
      date: entry.date ? entry.date.split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setModal(entry);
  };

  const save = async () => {
    if (!form.task || !form.hours || !form.date) {
      toast('Task, hours, and date are required', 'error');
      return;
    }

    const payload = {
      user: form.user,
      task: form.task,
      hours: Number(form.hours),
      date: form.date,
    };

    const res = modal === 'new'
      ? await api.post('/worklogs', payload)
      : await api.put('/worklogs/' + modal._id, payload);

    if (res._id) {
      toast('Work log saved', 'success');
      setModal(null);
      load();
    } else {
      toast(res.message || 'Error saving work log', 'error');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this work log entry?')) return;
    const res = await api.del('/worklogs/' + id);
    if (res.message === 'Work log deleted') {
      toast('Deleted successfully', 'success');
      load();
    } else {
      toast(res.message || 'Error deleting work log', 'error');
    }
  };

  return React.createElement('div', null,
    React.createElement(PageHeader, {
      title: 'Work Logs',
      subtitle: worklogs.length + ' time entries',
      action: React.createElement('button', { className: 'btn', onClick: openNew }, '+ New Entry')
    }),

    loading ? React.createElement(Spinner) :
      React.createElement('div', { style: { display: 'grid', gap: 14 } },
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr', gap: 12, padding: '6px 12px', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 600, borderBottom: '1px solid var(--border)', alignItems: 'center' } },
          React.createElement('div', null, 'Member'),
          React.createElement('div', null, 'Task'),
          React.createElement('div', null, 'Hours'),
          React.createElement('div', null, 'Date'),
          React.createElement('div', null, 'Actions')
        ),
        worklogs.length === 0 ? React.createElement(Empty, { icon: '⌛', text: 'No work logs recorded yet' }) :
          worklogs.map((entry) =>
            React.createElement('div', { key: entry._id, className: 'tbl-row', style: { display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr', gap: 12, padding: '10px 12px', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)', alignItems: 'center' } },
              React.createElement('div', null, entry.user?.name || 'Unknown'),
              React.createElement('div', null, entry.task?.title || 'Unassigned'),
              React.createElement('div', null, entry.hours + 'h'),
              React.createElement('div', null, fmt(entry.date)),
              React.createElement('div', { style: { display: 'flex', gap: 4 } },
                React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => openEdit(entry) }, 'Edit'),
                canManage && React.createElement('button', { className: 'btn btn-danger btn-sm', onClick: () => remove(entry._id) }, 'Del')
              )
            )
          )
      ),

    modal && React.createElement(Modal, { title: modal === 'new' ? 'New Work Log' : 'Edit Work Log', onClose: () => setModal(null) },
      React.createElement(Field, { label: 'Team Member' },
        canManage
          ? React.createElement('select', {
              value: form.user,
              onChange: (e) => setForm((prev) => ({ ...prev, user: e.target.value }))
            },
              React.createElement('option', { value: '' }, 'Select member'),
              users.map((u) => React.createElement('option', { key: u._id, value: u._id }, u.name + ' (' + u.role + ')'))
            )
          : React.createElement('input', { value: user?.name || '', disabled: true, style: { opacity: 0.6 } })
      ),
      React.createElement(Field, { label: 'Task' },
        React.createElement('select', {
          value: form.task,
          onChange: (e) => setForm((prev) => ({ ...prev, task: e.target.value }))
        },
          React.createElement('option', { value: '' }, 'Select task'),
          tasks.map((t) => React.createElement('option', { key: t._id, value: t._id }, t.title))
        )
      ),
      React.createElement(Field, { label: 'Hours' },
        React.createElement('input', {
          type: 'number',
          min: 0.25,
          step: 0.25,
          value: form.hours,
          onChange: (e) => setForm((prev) => ({ ...prev, hours: e.target.value }))
        })
      ),
      React.createElement(Field, { label: 'Date' },
        React.createElement('input', {
          type: 'date',
          value: form.date,
          onChange: (e) => setForm((prev) => ({ ...prev, date: e.target.value }))
        })
      ),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 } },
        React.createElement('button', { className: 'btn btn-ghost', onClick: () => setModal(null) }, 'Cancel'),
        React.createElement('button', { className: 'btn', onClick: save }, 'Save')
      )
    )
  );
}
