import './Home.css';
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from 'react-router';
import { FileCheck2, MessageCircle, Search, ShieldCheck, ArrowUpRight } from "lucide-react";
import { api } from '../../lib/api';
import type { ArticleSummary, ArticleVerdict } from '../../types/api';
import SiteNavbar from '../SiteNavbar';

type VerdictLabel = "VRAI" | "À VÉRIFIER" | "FAUX";
type Filter = "Toutes les vérifications" | "Confirmées" | "À vérifier" | "Contestées";
type SortKey = "recent" | "verifications" | "comments";

const verdictLabel = (status: ArticleVerdict): VerdictLabel => {
  switch (status) {
    case 'CONFIRMED':
      return 'VRAI';
    case 'CONTRADICTED':
    case 'MISLEADING':
      return 'FAUX';
    default:
      return 'À VÉRIFIER';
  }
};

const imageLabelOf = (status: ArticleVerdict): string => {
  switch (status) {
    case 'CONFIRMED':
      return 'INFORMATION CONFIRMÉE';
    case 'CONTRADICTED':
    case 'MISLEADING':
      return 'INFORMATION CONTESTÉE';
    default:
      return 'EN COURS D’EXAMEN';
  }
};

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

function ArticleCard({ article }: { article: ArticleSummary }) {
  const { _count } = article;

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
    {article.coverImageUrl && <div className="article-image"><img src={article.coverImageUrl} alt={`Illustration : ${article.title}`} loading="lazy"/><span>{imageLabelOf(article.status)}</span></div>}
    <aside className="article-sources">
      <h4><FileCheck2 size={19}/> Dossier de vérification</h4>
      <ul>
        <li><ShieldCheck size={16} aria-hidden="true"/>{_count.verifications} vérification{_count.verifications === 1 ? '' : 's'} enregistrée{_count.verifications === 1 ? '' : 's'}</li>
        <li><FileCheck2 size={16} aria-hidden="true"/>{_count.evidences} preuve{_count.evidences === 1 ? '' : 's'} ajoutée{_count.evidences === 1 ? '' : 's'}</li>
        <li><MessageCircle size={16} aria-hidden="true"/>{_count.comments} commentaire{_count.comments === 1 ? '' : 's'}</li>
      </ul>
      <Link className="primary-button dossier-link" to={`/articles/${article.id}`}>Voir le dossier complet <ArrowUpRight size={17}/></Link>
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
    <SiteNavbar/>
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
