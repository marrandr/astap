//import './Home.css';
//import { Outlet } from 'react-router'


//const Home = () => (
//  <div className="Home">
//	<Outlet />
//  </div>
//);

//export default Home;

import { useMemo, useState, type FormEvent } from "react";
import { Bell, Check, Eye, FileCheck2, Menu, MessageCircle, Search, Share2, ShieldCheck, ArrowUpRight, X } from "lucide-react";
import { useNavigate } from 'react-router';
import { useAuth } from '../../lib/auth';
import "./Home.css";

type Verdict = "FAUX" | "À VÉRIFIER" | "VRAI";
type Filter = "Toutes les vérifications" | "Récentes" | "Plus partagées";
type Article = {
  id: number; title: string; excerpt: string; verdict: Verdict; author: string;
  date: string; category: string; image: string; imageLabel: string;
  sources: string[]; views: number; shares: number; comments: number;
};

const articles: Article[] = [
  { id: 1, title: "Une nouvelle hausse des tarifs de l’électricité annoncée pour novembre ?", excerpt: "Une publication largement relayée affirme qu'une augmentation immédiate des tarifs est prévue. Voici les éléments à examiner et les sources à consulter.", verdict: "À VÉRIFIER", author: "Rédaction Hamarino", date: "2 novembre 2026", category: "Économie", image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=900&q=85", imageLabel: "ENQUÊTE EN COURS", sources: ["Communiqués de l'opérateur", "Textes réglementaires", "Déclarations publiques"], views: 1240, shares: 86, comments: 14 },
  { id: 2, title: "Cette photographie montre-t-elle réellement les dégâts du dernier cyclone ?", excerpt: "Une image spectaculaire circule sur les réseaux sociaux. L'analyse de son origine permet d'évaluer le contexte dans lequel elle a été prise.", verdict: "FAUX", author: "Rédaction Hamarino", date: "1 novembre 2026", category: "Environnement", image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=900&q=85", imageLabel: "IMAGE HORS CONTEXTE", sources: ["Recherche d'image inversée", "Archives photographiques", "Données météorologiques"], views: 3200, shares: 231, comments: 38 },
  { id: 3, title: "Le calendrier officiel des examens a-t-il été modifié ?", excerpt: "Des messages contradictoires annoncent un changement de dates. Nous comparons les publications disponibles aux documents de référence.", verdict: "VRAI", author: "Rédaction Hamarino", date: "30 octobre 2026", category: "Éducation", image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=900&q=85", imageLabel: "DOCUMENT CONSULTÉ", sources: ["Calendrier administratif", "Note d'information", "Publication institutionnelle"], views: 980, shares: 64, comments: 9 },
  { id: 4, title: "Que sait-on des chiffres qui circulent sur le prix du riz ?", excerpt: "Plusieurs publications comparent des prix relevés à différentes périodes sans préciser les marchés ni les unités utilisées.", verdict: "À VÉRIFIER", author: "Rédaction Hamarino", date: "29 octobre 2026", category: "Société", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=85", imageLabel: "DONNÉES À RECROISER", sources: ["Relevés de prix", "Statistiques publiques", "Observations de marché"], views: 740, shares: 42, comments: 6 },
];


const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

function StatusBadge({ verdict }: { verdict: Verdict }) {
  return <span className={`status-badge ${verdict === "VRAI" ? "status-true" : verdict === "FAUX" ? "status-false" : "status-pending"}`}>
    <span aria-hidden="true">{verdict === "VRAI" ? "✓" : verdict === "FAUX" ? "✕" : "!"}</span> {verdict}
  </span>;
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  return <header className="home-navbar">
    <div className="home-container nav-inner">
      <a href="/" className="home-brand" aria-label="Hamarino.io, accueil"><span className="brand-icon"><ShieldCheck size={23}/></span><span>hamarino<span className="accent">.io</span></span></a>
      <nav className="desktop-nav" aria-label="Navigation principale"><a href="/" aria-current="page">Accueil</a><a href="#verifications">Vérifications</a><a href="#a-propos">À propos</a></nav>
      <div className="nav-actions">
        <button type="button" className="icon-button" aria-label="Notifications"><Bell size={19}/></button>
        <span className="nav-avatar" aria-label="Profil de démonstration">RH</span>
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
      <button className="menu-toggle" type="button" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
    </div>
    {open && <nav className="mobile-nav" aria-label="Navigation mobile"><a href="/">Accueil</a><a href="#verifications" onClick={() => setOpen(false)}>Vérifications</a><a href="#a-propos" onClick={() => setOpen(false)}>À propos</a></nav>}
  </header>;
}



function ArticleCard({ article }: { article: Article }) {
  return <article className="article-card">
    <div className="article-summary">
      <div className="article-meta"><StatusBadge verdict={article.verdict}/><span>{article.date}</span></div>
      <span className="article-category">{article.category}</span>
      <h3><a href={`/articles/${article.id}`}>{article.title}</a></h3>
      <p className="article-excerpt">{article.excerpt}</p>
      <div className="article-bottom"><p>Par {article.author}</p><div className="article-stats"><span><Eye size={15}/>{fmt(article.views)}</span><span><Share2 size={15}/>{fmt(article.shares)}</span><span><MessageCircle size={15}/>{fmt(article.comments)}</span></div></div>
    </div>
    <div className="article-image"><img src={article.image} alt={`Illustration de démonstration : ${article.category}`} loading="lazy"/><span>{article.imageLabel}</span></div>
    <aside className="article-sources"><h4><FileCheck2 size={19}/> Sources et éléments examinés</h4><ul>{article.sources.map(source => <li key={source}><Check size={16} aria-hidden="true"/>{source}</li>)}</ul><a className="primary-button dossier-link" href={`/articles/${article.id}`}>Voir le dossier complet <ArrowUpRight size={17}/></a></aside>
  </article>;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("Toutes les vérifications");
  const [sort, setSort] = useState("recent");
  const [visible, setVisible] = useState(3);
  const results = useMemo(() => {
    const normalized = search.toLocaleLowerCase("fr");
    const list = articles.filter(a => `${a.title} ${a.excerpt} ${a.category}`.toLocaleLowerCase("fr").includes(normalized));
    if (filter === "Plus partagées" || sort === "shares") return [...list].sort((a,b) => b.shares - a.shares);
    if (sort === "views") return [...list].sort((a,b) => b.views - a.views);
    return [...list].sort((a,b) => a.id - b.id);
  }, [search, filter, sort]);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSearch(query.trim()); setVisible(3);
    document.getElementById("verifications")?.scrollIntoView({ behavior: "smooth" });
  }


   return <div className="Home">
    <Navbar/>
    <main>
      <section className="home-hero">
        <div className="hero-content">
          <div className="hero-eyebrow"><ShieldCheck size={16}/> L’information, examinée avec rigueur</div>
          <h1>Vérifiez <span>avant de partager.</span></h1>
          <p>Des faits vérifiés et documentés par des journalistes professionnels pour une information plus fiable.</p>
          <form className="home-search" role="search" onSubmit={submit}>
            <Search size={20} aria-hidden="true"/>
            <input aria-label="Rechercher une information" placeholder="Rechercher une information à vérifier..." value={query} onChange={e => setQuery(e.target.value)}/>
            <button type="submit" className="primary-button">Rechercher</button>
          </form>
          <div className="trending"><span>TENDANCES :</span>{["Irma", "Covid-19", "Cyclone", "Jirama", "PrixDuRiz"].map(tag => <button type="button" key={tag} onClick={() => { setQuery(tag); setSearch(tag); setVisible(3); }}>#{tag}</button>)}</div>
        </div>
      </section>
      <section className="home-feed home-container" id="verifications">
        <div className="feed-heading"><div><span className="section-kicker">LE FIL DES VÉRIFICATIONS</span><h2>Vérifications récentes et alertes</h2><p>Consultez les analyses et les éléments examinés.</p></div>
          <div className="feed-controls"><span className="case-count">{articles.length} dossiers de démonstration</span><label className="sr-only" htmlFor="home-sort">Trier les vérifications</label><select id="home-sort" value={sort} onChange={e => setSort(e.target.value)}><option value="recent">Plus récentes</option><option value="shares">Plus partagées</option><option value="views">Plus consultées</option></select></div>
        </div>
        <div className="feed-filters">{(["Toutes les vérifications", "Récentes", "Plus partagées"] as Filter[]).map(f => <button key={f} type="button" className={filter === f ? "active" : ""} aria-pressed={filter === f} onClick={() => { setFilter(f); setVisible(3); }}>{f}</button>)}</div>
        <div className="article-list">{results.slice(0,visible).map(a => <ArticleCard key={a.id} article={a}/>)}</div>
        {results.length === 0 && <p className="empty-results">Aucune vérification ne correspond à votre recherche.</p>}
        {visible < results.length && <div className="load-more"><button type="button" onClick={() => setVisible(v => v + 3)}>Charger plus de vérifications</button></div>}
      </section>
    </main>
    <footer id="a-propos" className="home-footer"><div className="home-container footer-inner"><div><strong>Hamarino.io</strong> © 2026 · Fact-checking Madagascar <span className="demo-label">Prototype — données fictives</span></div><nav aria-label="Liens institutionnels"><a href="/methodologie">Méthodologie</a><a href="/charte-editoriale">Charte éditoriale</a><a href="/transparence">Transparence des sources</a><a href="https://www.poynter.org/ifcn/">Principes IFCN ↗</a></nav></div></footer>
  </div>;
}

