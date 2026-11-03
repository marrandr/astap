import './NavBar.css';
import '../Home/Home.css';
import { useState } from 'react';
import { Bell, Menu, X } from 'lucide-react';
import hamarinoLogo from '../../assets/hamarino-io-logo-2048x518.png';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  
  return (
    <header className="home-navbar">
      <div className="home-container nav-inner">
        <a href="/" className="home-brand" aria-label="Hamarino.io, accueil">
          <img src={hamarinoLogo} alt="Hamarino.io" width={2048} height={518} />
        </a>
        <nav className="desktop-nav" aria-label="Navigation principale">
          <a href="/" aria-current="page">Accueil</a>
          <a href="#verifications">Vérifications</a>
          <a href="#a-propos">À propos</a>
        </nav>
        <div className="nav-actions">
          <button type="button" className="icon-button" aria-label="Notifications">
            <Bell size={19}/>
          </button>
          <span className="nav-avatar" aria-label="Profil de démonstration">RH</span>
        </div>
        <button className="menu-toggle" type="button" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X/> : <Menu/>}
        </button>
      </div>
    {open && <nav className="mobile-nav" aria-label="Navigation mobile"><a href="/">Accueil</a><a href="#verifications" onClick={() => setOpen(false)}>Vérifications</a><a href="#a-propos" onClick={() => setOpen(false)}>À propos</a></nav>}
    </header>
  );
}
