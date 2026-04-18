// app.js — root App component and entry point
function App() {
  const { user, loading } = useAuth();
  const [page, setPage] = React.useState('dashboard');

  if (loading) return React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' } },
    React.createElement(Spinner)
  );

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
  };

  const Page = pages[page] || Dashboard;

  return React.createElement(Layout, { page, setPage },
    React.createElement(Page)
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
