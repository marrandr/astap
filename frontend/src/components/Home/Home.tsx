import { useMemo, useState, type FormEvent } from "react";
import { Check, Eye, FileCheck2, MessageCircle, Search, Share2, ShieldCheck, ArrowUpRight} from "lucide-react";
import "./Home.css";
import NavBar from "../NavBar/NavBar";

type Verdict = "FAUX" | "À VÉRIFIER" | "VRAI";
type Filter = "Toutes les vérifications" | "Récentes" | "Plus partagées";
type Article = {
  id: number; title: string; excerpt: string; verdict: Verdict; author: string;
  date: string; category: string; image: string; imageLabel: string;
  sources: string[]; views: number; shares: number; comments: number;
  ai: { textCoverage: number; mediaCoverage: number; sourceChecks: number; };
  media: { label: string; preview: string; type: 'image' | 'video' }[];
};

const articles: Article[] = [
  {
    id: 1,
    title: "Une nouvelle hausse des tarifs de l’électricité annoncée pour novembre ?",
    excerpt: "Une publication largement relayée affirme qu'une augmentation immédiate des tarifs est prévue. Voici les éléments à examiner et les sources à consulter.",
    verdict: "À VÉRIFIER",
    author: "Rédaction Hamarino",
    date: "2 novembre 2026",
    category: "Économie",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=900&q=85",
    imageLabel: "ENQUÊTE EN COURS",
    sources: ["Communiqués de l'opérateur", "Textes réglementaires", "Déclarations publiques"],
    views: 1240,
    shares: 86,
    comments: 14,
    ai: { textCoverage: 94, mediaCoverage: 82, sourceChecks: 3 },
    media: [
      { label: "Photo de contexte", preview: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=500&q=80", type: 'image' },
      { label: "Graphique de suivi", preview: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&q=80", type: 'image' },
    ],
  },
  {
    id: 2,
    title: "Cette photographie montre-t-elle réellement les dégâts du dernier cyclone ?",
    excerpt: "Une image spectaculaire circule sur les réseaux sociaux. L'analyse de son origine permet d'évaluer le contexte dans lequel elle a été prise.",
    verdict: "FAUX",
    author: "Rédaction Hamarino",
    date: "1 novembre 2026",
    category: "Environnement",
    image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=900&q=85",
    imageLabel: "IMAGE HORS CONTEXTE",
    sources: ["Recherche d'image inversée", "Archives photographiques", "Données météorologiques"],
    views: 3200,
    shares: 231,
    comments: 38,
    ai: { textCoverage: 91, mediaCoverage: 88, sourceChecks: 4 },
    media: [
      { label: "Image originale", preview: "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=500&q=80", type: 'image' },
      { label: "Image comparée", preview: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=500&q=80", type: 'image' },
    ],
  },
  {
    id: 3,
    title: "Le calendrier officiel des examens a-t-il été modifié ?",
    excerpt: "Des messages contradictoires annoncent un changement de dates. Nous comparons les publications disponibles aux documents de référence.",
    verdict: "VRAI",
    author: "Rédaction Hamarino",
    date: "30 octobre 2026",
    category: "Éducation",
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=900&q=85",
    imageLabel: "DOCUMENT CONSULTÉ",
    sources: ["Calendrier administratif", "Note d'information", "Publication institutionnelle"],
    views: 980,
    shares: 64,
    comments: 9,
    ai: { textCoverage: 97, mediaCoverage: 74, sourceChecks: 3 },
    media: [
      { label: "Document officiel", preview: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=500&q=80", type: 'image' },
      { label: "Tableau de dates", preview: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&q=80", type: 'image' },
    ],
  },
  {
    id: 4,
    title: "Que sait-on des chiffres qui circulent sur le prix du riz ?",
    excerpt: "Plusieurs publications comparent des prix relevés à différentes périodes sans préciser les marchés ni les unités utilisées.",
    verdict: "À VÉRIFIER",
    author: "Rédaction Hamarino",
    date: "29 octobre 2026",
    category: "Société",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=85",
    imageLabel: "DONNÉES À RECROISER",
    sources: ["Relevés de prix", "Statistiques publiques", "Observations de marché"],
    views: 740,
    shares: 42,
    comments: 6,
    ai: { textCoverage: 89, mediaCoverage: 71, sourceChecks: 5 },
    media: [
      { label: "Archive de prix", preview: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80", type: 'image' },
      { label: "Tableau comparatif", preview: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=500&q=80", type: 'image' },
    ],
  },
];

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));

const excerptOf = (content: string, max = 220) =>
  content.length > max ? `${content.slice(0, max).trimEnd()}…` : content;

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

function StatusBadge({ status }: { status: ArticleVerdict }) {
  const verdict = verdictLabel(status);
  return <span className={`status-badge ${verdict === "VRAI" ? "status-true" : verdict === "FAUX" ? "status-false" : "status-pending"}`}>
    <span aria-hidden="true">{verdict === "VRAI" ? "✓" : verdict === "FAUX" ? "✕" : "!"}</span> {verdict}
  </span>;
}

function ArticleCard({ article }: { article: Article }) {
  return <article className="article-card">
    <div className="article-summary">
      <div className="article-meta"><StatusBadge status={article.status}/><span>{fmtDate(article.publishedAt)}</span></div>
      <span className="article-category">{article.topic?.label ?? 'Général'}</span>
      <h3><Link to={`/articles/${article.id}`}>{article.title}</Link></h3>
      <p className="article-excerpt">{excerptOf(article.content)}</p>
      <div className="article-bottom"><p>Par {article.author?.name ?? 'Rédaction Hamarino'}</p>
        <div className="article-stats">
          <span title="Vérifications"><ShieldCheck size={15}/>{fmt(_count.verifications)}</span>
          <span title="Preuves"><FileCheck2 size={15}/>{fmt(_count.evidences)}</span>
          <span title="Commentaires"><MessageCircle size={15}/>{fmt(_count.comments)}</span>
        </div>
      </div>
    </div>
    <div className="article-image"><img src={article.image} alt={`Illustration de démonstration : ${article.category}`} loading="lazy"/><span>{article.imageLabel}</span></div>
    <aside className="article-sources">
      <div className="insight-header">
        <h4><FileCheck2 size={19}/> IA & médias</h4>
        <span className="insight-pill">Analyse</span>
      </div>

      <div className="ai-stats">
        <div className="ai-stat">
          <span>Texte</span>
          <strong>{article.ai.textCoverage}% IA</strong>
        </div>
        <div className="ai-stat">
          <span>Médias</span>
          <strong>{article.ai.mediaCoverage}% IA</strong>
        </div>
        <div className="ai-stat">
          <span>Sources</span>
          <strong>{article.ai.sourceChecks}</strong>
        </div>
      </div>

      <div className="media-summary">
        <p>Médias vérifiés</p>
        <div className="media-tiles">
          {article.media.map(item => (
            <div key={item.label} className="media-tile">
              <img src={item.preview} alt={item.label} loading="lazy" />
              <span>{item.type === 'video' ? 'Vidéo' : 'Image'}</span>
            </div>
          ))}
        </div>
      </div>

      <ul className="source-list">
        {article.sources.map(source => <li key={source}><Check size={16} aria-hidden="true"/>{source}</li>)}
      </ul>

      <a className="primary-button dossier-link" href={`/articles/${article.id}`}>Voir le dossier complet <ArrowUpRight size={17}/></a>
    </aside>
  </article>;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("Toutes les vérifications");
  const [sort, setSort] = useState<SortKey>("recent");
  const [visible, setVisible] = useState(5);

  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    api.listArticles({ page: 1, limit: 50 })
      .then((data) => {
        if (cancelled) return;
        setArticles(data.items);
        setTotal(data.total);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Impossible de charger les vérifications');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const results = useMemo(() => {
    const normalized = search.toLocaleLowerCase("fr");
    let list = articles.filter((a) =>
      `${a.title} ${a.content} ${a.topic?.label ?? ''}`.toLocaleLowerCase("fr").includes(normalized),
    );

    if (filter === "Confirmées") list = list.filter((a) => verdictLabel(a.status) === 'VRAI');
    else if (filter === "À vérifier") list = list.filter((a) => verdictLabel(a.status) === 'À VÉRIFIER');
    else if (filter === "Contestées") list = list.filter((a) => verdictLabel(a.status) === 'FAUX');

    if (sort === "verifications") return [...list].sort((a, b) => b._count.verifications - a._count.verifications);
    if (sort === "comments") return [...list].sort((a, b) => b._count.comments - a._count.comments);
    return [...list].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }, [articles, search, filter, sort]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSearch(query.trim()); setVisible(5);
    document.getElementById("verifications")?.scrollIntoView({ behavior: "smooth" });
  }


   return <div className="Home">
    <NavBar/>
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
          <div className="trending"><span>TENDANCES :</span>{["Jirama", "PrixDuRiz", "Cyclone", "Électricité", "Examens"].map(tag => <button type="button" key={tag} onClick={() => { setQuery(tag); setSearch(tag); setVisible(5); }}>#{tag}</button>)}</div>
        </div>
      </section>
      <section className="home-feed home-container" id="verifications">
        <div className="feed-heading"><div><span className="section-kicker">LE FIL DES VÉRIFICATIONS</span><h2>Vérifications récentes et alertes</h2><p>Consultez les analyses et les éléments examinés.</p></div>
          <div className="feed-controls">
            <span className="case-count">{fmt(total)} dossier{total === 1 ? '' : 's'}</span>
            <label className="sr-only" htmlFor="home-sort">Trier les vérifications</label>
            <select id="home-sort" value={sort} onChange={e => setSort(e.target.value as SortKey)}>
              <option value="recent">Plus récentes</option>
              <option value="verifications">Plus vérifiées</option>
              <option value="comments">Plus commentées</option>
            </select>
          </div>
        </div>
        <div className="feed-filters">{(["Toutes les vérifications", "Confirmées", "À vérifier", "Contestées"] as Filter[]).map(f => <button key={f} type="button" className={filter === f ? "active" : ""} aria-pressed={filter === f} onClick={() => { setFilter(f); setVisible(5); }}>{f}</button>)}</div>
        {loading && <p className="empty-results">Chargement des vérifications…</p>}
        {!loading && error && (
          <div className="empty-results">
            <p>{error}</p>
            <button type="button" className="primary-button" style={{ marginTop: 12 }} onClick={() => window.location.reload()}>Réessayer</button>
          </div>
        )}
        {!loading && !error && <>
          <div className="article-list">{results.slice(0, visible).map(a => <ArticleCard key={a.id} article={a}/>)}</div>
          {results.length === 0 && <p className="empty-results">Aucune vérification ne correspond à votre recherche.</p>}
          {visible < results.length && <div className="load-more"><button type="button" onClick={() => setVisible(v => v + 5)}>Charger plus de vérifications</button></div>}
        </>}
      </section>
    </main>
    <footer id="a-propos" className="home-footer"><div className="home-container footer-inner"><div><strong>Hamarino.io</strong> © 2026 · Fact-checking Madagascar</div><nav aria-label="Liens institutionnels"><a href="mailto:contact@hamarino.io">contact@hamarino.io</a><a href="https://www.poynter.org/ifcn/">Principes IFCN ↗</a></nav></div></footer>
  </div>;
}
