// pages/Dashboard.js
function Dashboard({ setPage }) {
  const [stats, setStats] = React.useState(null);
  const [progress, setProgress] = React.useState([]);

  React.useEffect(() => {
    api.get('/reports/dashboard').then(d => !d.message && setStats(d));
    api.get('/reports/progress').then(d => Array.isArray(d) && setProgress(d));
  }, []);

  if (!stats) return React.createElement('div', null, React.createElement(Empty, { icon: '⟳', text: 'Loading...' }));

  // Overview cards with navigation
  const overviewCards = [
    {
      title: 'Projects',
      icon: '📁',
      stats: [
        { label: 'Active', value: stats.projects?.active ?? 0, color: 'var(--accent)' },
        { label: 'Total', value: stats.projects?.total ?? 0, color: 'var(--text2)' }
      ],
      action: () => setPage('projects')
    },
    {
      title: 'Tasks',
      icon: '✓',
      stats: [
        { label: 'In Progress', value: stats.tasks?.inProgress ?? 0, color: 'var(--yellow)' },
        { label: 'Completed', value: stats.tasks?.completed ?? 0, color: 'var(--green)' },
        { label: 'Total', value: stats.tasks?.total ?? 0, color: 'var(--text2)' }
      ],
      action: () => setPage('tasks')
    },
    {
      title: 'Bugs',
      icon: '🐛',
      stats: [
        { label: 'Open', value: stats.bugs?.open ?? 0, color: 'var(--red)' },
        { label: 'Critical', value: stats.bugs?.critical ?? 0, color: 'var(--orange)' },
        { label: 'Total', value: stats.bugs?.total ?? 0, color: 'var(--text2)' }
      ],
      action: () => setPage('bugs')
    },
    {
      title: 'Sprints',
      icon: '🏃',
      stats: [
        { label: 'Active', value: stats.sprints?.active ?? 0, color: 'var(--accent)' },
        { label: 'Total', value: stats.sprints?.total ?? 0, color: 'var(--text2)' }
      ],
      action: () => setPage('sprints')
    },
    {
      title: 'Milestones',
      icon: '🎯',
      stats: [
        { label: 'Completed', value: stats.milestones?.completed ?? 0, color: 'var(--green)' },
        { label: 'Total', value: stats.milestones?.total ?? 0, color: 'var(--text2)' }
      ],
      action: () => setPage('milestones')
    },
    {
      title: 'Requirements',
      icon: '📋',
      stats: [
        { label: 'Total', value: stats.requirements?.total ?? 0, color: 'var(--accent)' }
      ],
      action: () => setPage('reports')
    },
    {
      title: 'Change Requests',
      icon: '♻️',
      stats: [
        { label: 'Open', value: stats.changeRequests?.open ?? 0, color: 'var(--yellow)' },
        { label: 'Total', value: stats.changeRequests?.total ?? 0, color: 'var(--text2)' }
      ],
      action: () => setPage('reports')
    },
    {
      title: 'Work Logs',
      icon: '⏱️',
      stats: [
        { label: 'Total', value: stats.workLogs?.total ?? 0, color: 'var(--accent)' }
      ],
      action: () => setPage('worklogs')
    },
    {
      title: 'Team',
      icon: '👥',
      stats: [
        { label: 'Members', value: stats.team?.total ?? 0, color: 'var(--accent)' }
      ],
      action: () => setPage('team')
    }
  ];

  return React.createElement('div', null,
    React.createElement(PageHeader, { title: 'Dashboard', subtitle: 'Overview of all projects and activity' }),

    // Overview Grid
    React.createElement('h2', { style: { fontSize: 11, fontWeight: 600, color: 'var(--text2)', marginBottom: 12, letterSpacing: '.5px', textTransform: 'uppercase' } }, 'Quick Overview'),

    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 12, marginBottom: 28 } },
      overviewCards.map(card =>
        React.createElement('div', {
          key: card.title,
          className: 'card',
          style: {
            padding: 16,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '1px solid var(--border)',
            ':hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
          },
          onClick: card.action,
          onMouseEnter: (e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)',
          onMouseLeave: (e) => e.currentTarget.style.boxShadow = 'none'
        },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 } },
            React.createElement('div', { style: { fontSize: 18, fontWeight: 600, color: 'var(--text1)' } }, card.title),
            React.createElement('div', { style: { fontSize: 24 } }, card.icon)
          ),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(80px,1fr))', gap: 10 } },
            card.stats.map(stat =>
              React.createElement('div', { key: stat.label },
                React.createElement('div', { style: { fontSize: 20, fontWeight: 700, color: stat.color, fontFamily: "'DM Mono',monospace" } }, stat.value),
                React.createElement('div', { style: { fontSize: 11, color: 'var(--text3)', marginTop: 2 } }, stat.label)
              )
            )
          )
        )
      )
    ),

    // Project Progress Section
    React.createElement('h2', { style: { fontSize: 11, fontWeight: 600, color: 'var(--text2)', marginBottom: 12, letterSpacing: '.5px', textTransform: 'uppercase' } }, 'Project Progress'),

    progress.length === 0
      ? React.createElement(Empty, { icon: '◈', text: 'No projects yet' })
      : React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 } },
          progress.map(p =>
            React.createElement('div', {
              key: p._id,
              className: 'card',
              style: { cursor: 'pointer' },
              onClick: () => setPage('projects')
            },
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
