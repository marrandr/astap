import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Menu, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../lib/auth';

export default function SiteNavbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  return <header className="home-navbar">
    <div className="home-container nav-inner">
      <Link to="/" className="home-brand" aria-label="Hamarino.io, accueil"><span className="brand-icon"><ShieldCheck size={23}/></span><span>hamarino<span className="accent">.io</span></span></Link>
      <nav className="desktop-nav" aria-label="Navigation principale"><Link to="/">Accueil</Link><a href="/#verifications">Vérifications</a><a href="/#a-propos">À propos</a></nav>
      <div className="nav-actions">
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            logout();
            navigate('/auth/login');
          }}
          style={{ marginLeft: 12 }}
        >
          Déconnexion
        </button>
      </div>
      <button className="menu-toggle" type="button" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
    </div>
    {open && <nav className="mobile-nav" aria-label="Navigation mobile"><Link to="/" onClick={() => setOpen(false)}>Accueil</Link><a href="/#verifications" onClick={() => setOpen(false)}>Vérifications</a><a href="/#a-propos" onClick={() => setOpen(false)}>À propos</a></nav>}
  </header>;
}
