// AuthContext.js — authentication state management
const AuthCtx = React.createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const u = localStorage.getItem('dt_user');
    if (u && localStorage.getItem('dt_token')) setUser(JSON.parse(u));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('dt_token', data.token);
      localStorage.setItem('dt_user', JSON.stringify(data));
      setUser(data);
      return true;
    }
    return data.message || 'Login failed';
  };

  const register = async (name, email, password, role) => {
    const data = await api.post('/auth/register', { name, email, password, role });
    if (data.token) {
      localStorage.setItem('dt_token', data.token);
      localStorage.setItem('dt_user', JSON.stringify(data));
      setUser(data);
      return true;
    }
    return data.message || 'Register failed';
  };

  const logout = () => {
    localStorage.removeItem('dt_token');
    localStorage.removeItem('dt_user');
    setUser(null);
  };

  return React.createElement(AuthCtx.Provider, { value: { user, login, register, logout, loading } }, children);
}

const useAuth = () => React.useContext(AuthCtx);
