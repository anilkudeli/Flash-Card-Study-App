import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

  function signOut() {
    logout();
    navigate('/');
  }

  return <>
    <header className="site-header">
      <div className="nav-wrap">
        <Link className="brand" to={user ? '/dashboard' : '/'} aria-label="Flash Card Study App home"><span className="brand-mark">F</span><span>Flash Card Study App<span className="brand-period">.</span></span></Link>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink className={linkClass} to="/" end>Home</NavLink>
          {user && <><NavLink className={linkClass} to="/decks">My decks</NavLink><NavLink className={linkClass} to="/study">Study</NavLink><NavLink className={linkClass} to="/progress">Progress</NavLink></>}
        </nav>
        <div className="nav-actions">
          {user ? <><span className="user-greeting">{user.name.split(' ')[0]}</span><button className="button button-small button-outline" onClick={signOut}>Log out</button></> : <><Link className="sign-in-link" to="/login">Log in</Link><Link className="button button-small" to="/register">Get started <span aria-hidden="true">↗</span></Link></>}
        </div>
      </div>
    </header>
    <main>{children}</main>
    <footer className="site-footer"><div className="footer-inner"><Link className="brand brand-light" to="/"><span className="brand-mark">F</span><span>Flash Card Study App<span className="brand-period">.</span></span></Link><span>Make a little progress, every day.</span><span>© {new Date().getFullYear()} Flash Card Study App</span></div></footer>
  </>;
}
