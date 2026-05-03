// ThemeContext.js — light/dark theme toggle
const ThemeCtx = React.createContext(null);

function ThemeProvider({ children }) {
  const [theme, setTheme] = React.useState(() => localStorage.getItem('dt_theme') || 'dark');

  React.useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('dt_theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return React.createElement(ThemeCtx.Provider, { value: { theme, toggle } }, children);
}

const useTheme = () => React.useContext(ThemeCtx);
