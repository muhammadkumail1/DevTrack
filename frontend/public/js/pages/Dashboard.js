// pages/Dashboard.js
function Dashboard() {
  const [stats, setStats] = React.useState(null);
  const [progress, setProgress] = React.useState([]);

  React.useEffect(() => {
    api.get('/reports/dashboard').then(d => !d.message && setStats(d));
    api.get('/reports/progress').then(d => Array.isArray(d) && setProgress(d));
  }, []);

  const statCards = [
    { label: 'Active Projects',   value: stats?.activeProjects  ?? '—', color: 'var(--accent)'  },
    { label: 'Tasks In Progress', value: stats?.activeTasks     ?? '—', color: 'var(--yellow)'  },
    { label: 'Tasks Completed',   value: stats?.completedTasks  ?? '—', color: 'var(--green)'   },
    { label: 'Open Bugs',         value: stats?.openBugs        ?? '—', color: 'var(--red)'     },
    { label: 'Critical Bugs',     value: stats?.criticalBugs    ?? '—', color: 'var(--orange)'  },
  ];

  return React.createElement('div', null,
    React.createElement(PageHeader, { title: 'Dashboard', subtitle: 'Overview of all projects and activity' }),

    // Stat cards
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 28 } },
      statCards.map(s =>
        React.createElement('div', { key: s.label, className: 'card', style: { padding: 16 } },
          React.createElement('div', { style: { fontSize: 24, fontWeight: 600, color: s.color, fontFamily: "'DM Mono',monospace" } }, s.value),
          React.createElement('div', { style: { fontSize: 12, color: 'var(--text3)', marginTop: 4 } }, s.label)
        )
      )
    ),

    React.createElement('h2', { style: { fontSize: 11, fontWeight: 600, color: 'var(--text2)', marginBottom: 12, letterSpacing: '.5px', textTransform: 'uppercase' } }, 'Project Progress'),

    progress.length === 0
      ? React.createElement(Empty, { icon: '◈', text: 'No projects yet' })
      : React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 } },
          progress.map(p =>
            React.createElement('div', { key: p._id, className: 'card' },
              React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 } },
                React.createElement('div', { style: { fontWeight: 500, fontSize: 14 } }, p.title),
                React.createElement(StatusBadge, { status: p.status })
              ),
              React.createElement('div', { style: { display: 'flex', gap: 16, marginBottom: 10 } },
                React.createElement('span', { style: { fontSize: 12, color: 'var(--text3)' } }, p.tasksCompleted + '/' + p.tasksTotal + ' tasks'),
                React.createElement('span', { style: { fontSize: 12, color: 'var(--text3)' } }, p.bugsCount + ' bugs')
              ),
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
                React.createElement('div', { style: { flex: 1 } }, React.createElement(ProgressBar, { pct: p.progress })),
                React.createElement('span', { style: { fontSize: 12, fontFamily: "'DM Mono',monospace", color: 'var(--text2)', minWidth: 32, textAlign: 'right' } }, p.progress + '%')
              )
            )
          )
        )
  );
}
