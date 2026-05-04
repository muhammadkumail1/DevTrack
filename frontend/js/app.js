// app.js — root App component and entry point
function App() {
  const { user, loading } = useAuth();
  const [page, setPageRaw] = React.useState('dashboard');

  // Role-gated navigation: prevent unauthorized page access
  const setPage = (p) => {
    const isAdmin   = user?.role === 'Admin';
    const isManager = user?.role === 'Manager';
    if (p === 'roles'  && !isAdmin)            return; // Admin only
    if (p === 'team'   && !isAdmin && !isManager) return; // Manager + Admin
    setPageRaw(p);
  };

  if (loading) return React.createElement('div', {
    style: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }
  }, React.createElement(Spinner));

  if (!user) return React.createElement(AuthPage);

  const pages = {
    dashboard:  Dashboard,
    projects:   Projects,
    tasks:      Tasks,
    bugs:       Bugs,
    sprints:    Sprints,
    milestones: Milestones,
    reports:    Reports,
    team:       Team,
    worklogs:   WorkLogs,
    roles:      Roles,
  };

  const Page = pages[page] || Dashboard;

  return React.createElement(Layout, { page, setPage },
    React.createElement(Page, { setPage }),
    // AI Assistant mounted at root level — has access to setPage for full navigation
    React.createElement(AIAssistant, { setPage })
  );
}

// Mount the app
ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(AuthProvider, null,
    React.createElement(ToastProvider, null,
      React.createElement(App)
    )
  )
);
