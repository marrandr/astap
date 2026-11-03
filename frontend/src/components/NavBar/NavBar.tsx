import './NavBar.css';
import '../Home/Home.css';
import { useRef, useState, useEffect } from 'react';
import { Bell, Menu, X, UserRound, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import hamarinoLogo from '../../assets/hamarino-io-logo-2048x518.svg';
import { useAuth } from '../../lib/auth';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { logout, isAdmin } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/auth/login');
  };

  return (
    <header className="home-navbar">
      <div className="home-container nav-inner">
        <a href="/" className="home-brand" aria-label="Hamarino.io, accueil">
          <img src={hamarinoLogo} alt="Hamarino.io" width={2048} height={518} />
        </a>
        <nav className="desktop-nav" aria-label="Navigation principale">
          <Link to="/" aria-current={pathname === '/' ? 'page' : undefined}>Accueil</Link>
          <Link to="/verification">Vérifications</Link>
          <a href="/articles/new">Publier</a>
          {isAdmin && <Link to="/admin">Administration</Link>}
        </nav>
        <div className="nav-actions" ref={menuRef}>
          <button type="button" className="icon-button" aria-label="Notifications">
            <Bell size={19} />
          </button>

          <div className="nav-profile-menu">
            <button
              type="button"
              className="nav-avatar-button"
              aria-label="Ouvrir le menu du profil"
              aria-expanded={open}
              aria-haspopup="menu"
              onClick={() => setOpen((previous) => !previous)}
            >
              <span className="nav-avatar" aria-label="Profil de démonstration">RH</span>
            </button>

            {open && (
              <div className="nav-dropdown" role="menu" aria-label="Menu utilisateur">
                <Link to="/profile/demo" className="nav-dropdown-item" role="menuitem" onClick={() => setOpen(false)}>
                  <UserRound size={16} />
                  <span>Voir mon profil</span>
                </Link>
                <button type="button" className="nav-dropdown-item danger" role="menuitem" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Se déconnecter</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <button className="menu-toggle" type="button" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <nav className="mobile-nav" aria-label="Navigation mobile">
          <Link to="/" onClick={() => setOpen(false)}>Accueil</Link>
          <Link to="/verification" onClick={() => setOpen(false)}>Vérifications</Link>
          <a href="#a-propos" onClick={() => setOpen(false)}>À propos</a>
          <Link to="/profile/demo" onClick={() => setOpen(false)}>Mon profil</Link>
          {isAdmin && <Link to="/admin" onClick={() => setOpen(false)}>Administration</Link>}
          <button type="button" className="mobile-logout" onClick={handleLogout}>Se déconnecter</button>
        </nav>
      )}
    </header>
  );
}
