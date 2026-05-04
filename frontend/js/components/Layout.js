// Layout.js — Sidebar and main layout wrapper
function Sidebar({ page, setPage }) {
  const { user, logout } = useAuth();
  const canManage = user?.role === 'Manager' || user?.role === 'Admin';
  const isAdmin = user?.role === 'Admin';

  const navItems = [
    { id: 'dashboard',  icon: 'fa-solid fa-gauge',           label: 'Dashboard'  },
    { id: 'projects',   icon: 'fa-solid fa-folder-open',     label: 'Projects'   },
    { id: 'tasks',      icon: 'fa-solid fa-list-check',      label: 'Tasks'      },
    { id: 'bugs',       icon: 'fa-solid fa-bug',             label: 'Bugs'       },
    { id: 'sprints',    icon: 'fa-solid fa-rotate',          label: 'Sprints'    },
    { id: 'milestones', icon: 'fa-solid fa-flag-checkered',  label: 'Milestones' },
    { id: 'reports',    icon: 'fa-solid fa-chart-bar',       label: 'Reports'    },
    { id: 'worklogs',   icon: 'fa-solid fa-clock',           label: 'Work Logs'  },
    ...(canManage ? [{ id: 'team',  icon: 'fa-solid fa-users', label: 'Team'  }] : []),
    ...(isAdmin   ? [{ id: 'roles', icon: 'fa-solid fa-gear',  label: 'Roles' }] : []),
  ];

  return React.createElement('aside', {
    style: {
      width: 200, minHeight: '100vh', background: 'var(--bg2)',
      borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50
    }
  },
    // Logo
    React.createElement('div', { style: { padding: '20px 16px', borderBottom: '1px solid var(--border)' } },
      React.createElement('div', {
        style: { fontFamily: "'DM Mono',monospace", fontSize: 15, fontWeight: 500, letterSpacing: '1px', color: 'var(--accent)' }
      }, 'DevTrack'),
      React.createElement('div', { style: { fontSize: 11, color: 'var(--text3)', marginTop: 2 } }, 'SPMIS')
    ),

    // Nav items
    React.createElement('nav', { style: { flex: 1, padding: '8px', overflowY: 'auto' } },
      navItems.map(item =>
        React.createElement('button', {
          key: item.id,
          onClick: () => setPage(item.id),
          style: {
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 10px', marginBottom: 2,
            background: page === item.id ? 'var(--bg3)' : 'transparent',
            color: page === item.id ? 'var(--text)' : 'var(--text2)',
            borderRadius: 6, border: 'none', cursor: 'pointer',
            textAlign: 'left', fontSize: 13,
            borderLeft: page === item.id ? '2px solid var(--accent)' : '2px solid transparent',
            transition: 'all .12s'
          }
        },
          React.createElement('i', {
            className: item.icon,
            style: {
              width: 16, textAlign: 'center', fontSize: 13, flexShrink: 0,
              color: page === item.id ? 'var(--accent)' : 'var(--text3)'
            }
          }),
          item.label
        )
      )
    ),

    // User info & logout
    React.createElement('div', { style: { padding: '12px', borderTop: '1px solid var(--border)' } },
      React.createElement('div', { style: { fontSize: 12, color: 'var(--text2)', marginBottom: 4, padding: '0 4px' } }, user?.name),
      React.createElement('div', { style: { marginBottom: 10, padding: '0 4px' } },
        React.createElement(StatusBadge, { status: user?.role || 'Developer' })
      ),
      React.createElement('button', {
        onClick: logout,
        style: {
          width: '100%', padding: '7px', background: 'transparent',
          color: 'var(--text3)', border: '1px solid var(--border)',
          borderRadius: 6, fontSize: 12, cursor: 'pointer'
        }
      }, 'Sign out')
    )
  );
}

function Layout({ children, page, setPage }) {
  return React.createElement('div', { style: { display: 'flex', minHeight: '100vh' } },
    React.createElement(Sidebar, { page, setPage }),
    React.createElement('main', { style: { marginLeft: 200, flex: 1, padding: '28px 32px', minWidth: 0 } }, children)
  );
}
