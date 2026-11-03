import './NavBar.css';
import '../Home/Home.css';
import { useState } from 'react';
import { Bell, ShieldCheck, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  
  return (
    <header className="home-navbar">
      <div className="home-container nav-inner">
        <a href="/" className="home-brand" aria-label="Hamarino.io, accueil">
          <span className="brand-icon"><ShieldCheck size={23}/></span>
          <span>hamarino<span className="accent">.io</span></span>
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