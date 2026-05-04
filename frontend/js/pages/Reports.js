// pages/Reports.js
function Reports({ setPage }) {
  const [projects, setProjects] = React.useState([]);
  const [selected, setSelected] = React.useState('');
  const [report, setReport]     = React.useState(null);
  const [team, setTeam]         = React.useState([]);
  const [loading, setLoading]   = React.useState(false);

  React.useEffect(() => {
    api.get('/projects').then(d  => Array.isArray(d) && setProjects(d));
    api.get('/reports/team').then(d => Array.isArray(d) && setTeam(d));
  }, []);

  const loadReport = async id => {
    setLoading(true); setReport(null);
    const r = await api.get('/reports/project/' + id);
    if (r.project) setReport(r);
    setLoading(false);
  };

  return React.createElement('div', null,
    React.createElement(PageHeader, { title: 'Reports', subtitle: 'Project analytics and team performance' }),

    React.createElement('div', { style: { display: 'flex', gap: 12, marginBottom: 24 } },
      React.createElement('select', { style: { width: 260 }, value: selected, onChange: e => { setSelected(e.target.value); if (e.target.value) loadReport(e.target.value); } },
        React.createElement('option', { value: '' }, '— Select Project Report —'),
        projects.map(p => React.createElement('option', { key: p._id, value: p._id }, p.title))
      )
    ),

    loading && React.createElement(Spinner),

    report && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
      // Summary cards
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 } },
        [
          { label: 'Total Tasks', value: report.tasks.total,     color: 'var(--accent)'  },
          { label: 'Completed',   value: report.tasks.done,      color: 'var(--green)'   },
          { label: 'Total Bugs',  value: report.bugs.total,      color: 'var(--red)'     },
          { label: 'Progress',    value: report.progress + '%',  color: 'var(--yellow)'  },
        ].map(s =>
          React.createElement('div', { key: s.label, className: 'card', style: { padding: 16 } },
            React.createElement('div', { style: { fontSize: 28, fontWeight: 600, color: s.color, fontFamily: "'DM Mono',monospace" } }, s.value),
            React.createElement('div', { style: { fontSize: 12, color: 'var(--text3)', marginTop: 4 } }, s.label)
          )
        )
      ),
      // Task & Bug breakdown
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } },
        React.createElement('div', { className: 'card' },
          React.createElement('h3', { style: { fontSize: 13, color: 'var(--text2)', marginBottom: 12, fontWeight: 600 } }, 'Task Breakdown'),
          [['To Do', report.tasks.toDo, 'var(--text3)'], ['In Progress', report.tasks.inProgress, 'var(--yellow)'], ['Done', report.tasks.done, 'var(--green)']].map(([l, v, c]) =>
            React.createElement('div', { key: l, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
              React.createElement('span', { style: { fontSize: 13, color: c } }, l),
              React.createElement('span', { style: { fontFamily: "'DM Mono',monospace", fontSize: 13 } }, v)
            )
          )
        ),
        React.createElement('div', { className: 'card' },
          React.createElement('h3', { style: { fontSize: 13, color: 'var(--text2)', marginBottom: 12, fontWeight: 600 } }, 'Bugs by Severity'),
          [['Minor', report.bugs.bySeverity.Minor, 'var(--text3)'], ['Major', report.bugs.bySeverity.Major, 'var(--orange)'], ['Critical', report.bugs.bySeverity.Critical, 'var(--red)']].map(([l, v, c]) =>
            React.createElement('div', { key: l, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
              React.createElement('span', { style: { fontSize: 13, color: c } }, l),
              React.createElement('span', { style: { fontFamily: "'DM Mono',monospace", fontSize: 13 } }, v)
            )
          )
        )
      ),
      // Team workload
      report.teamWorkload.length > 0 && React.createElement('div', { className: 'card' },
        React.createElement('h3', { style: { fontSize: 13, color: 'var(--text2)', marginBottom: 12, fontWeight: 600 } }, 'Team Workload'),
        report.teamWorkload.map(m =>
          React.createElement('div', { key: m.name, style: { display: 'grid', gridTemplateColumns: '140px 1fr 60px', gap: 12, alignItems: 'center', marginBottom: 8 } },
            React.createElement('span', { style: { fontSize: 13 } }, m.name),
            React.createElement(ProgressBar, { pct: m.progress }),
            React.createElement('span', { style: { fontSize: 12, fontFamily: "'DM Mono',monospace", color: 'var(--text2)', textAlign: 'right' } }, m.done + '/' + m.total)
          )
        )
      )
    ),

    // Team performance table (shown when no project selected)
    !report && team.length > 0 && React.createElement('div', null,
      React.createElement('h2', { style: { fontSize: 11, color: 'var(--text2)', marginBottom: 12, fontWeight: 600, letterSpacing: '.4px', textTransform: 'uppercase' } }, 'Team Performance'),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 80px 80px', gap: 12, padding: '6px 12px', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 600, borderBottom: '1px solid var(--border)' } },
          React.createElement('div', null, 'Member'),
          React.createElement('div', null, 'Role'),
          React.createElement('div', null, 'Done'),
          React.createElement('div', null, 'Bugs'),
          React.createElement('div', null, 'Open'),
          React.createElement('div', null, 'Hours')
        ),
        team.map(m =>
          React.createElement('div', { key: m._id, style: { display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 80px 80px', gap: 12, padding: '10px 12px', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)', alignItems: 'center' } },
            React.createElement('span', { style: { fontWeight: 500 } }, m.name),
            React.createElement(StatusBadge, { status: m.role }),
            React.createElement('span', { style: { fontFamily: "'DM Mono',monospace", fontSize: 13, color: 'var(--green)' } }, m.tasksCompleted),
            React.createElement('span', { style: { fontFamily: "'DM Mono',monospace", fontSize: 13 } }, m.bugsAssigned),
            React.createElement('span', { style: { fontFamily: "'DM Mono',monospace", fontSize: 13, color: m.openBugs > 0 ? 'var(--red)' : 'var(--text3)' } }, m.openBugs),
            React.createElement('span', { style: { fontFamily: "'DM Mono',monospace", fontSize: 13, color: 'var(--accent)' } }, m.totalHours + 'h')
          )
        )
      )
    )
  );
}
