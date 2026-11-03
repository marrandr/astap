import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, FileCheck2, MessageCircle, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router";
import "./Home.css";
import NavBar from "../NavBar/NavBar";
import { api } from "../../lib/api";
import type { ArticleSummary, ArticleVerdict } from "../../types/api";

type SortKey = "recent" | "verifications" | "comments";
type Filter = "Toutes les vérifications" | "Confirmées" | "À vérifier" | "Contestées";

const verdictLabel = (status: ArticleVerdict): "VRAI" | "FAUX" | "À VÉRIFIER" => {
  switch (status) {
    case "CONFIRMED":
    case "PARTIALLY_TRUE":
      return "VRAI";
    case "CONTRADICTED":
    case "MISLEADING":
      return "FAUX";
    default:
      return "À VÉRIFIER";
  }
};

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

const excerptOf = (content: string, max = 220) =>
  content.length > max ? `${content.slice(0, max).trimEnd()}…` : content;

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

function StatusBadge({ status }: { status: ArticleVerdict }) {
  const verdict = verdictLabel(status);

  return (
    <span className={`status-badge ${verdict === "VRAI" ? "status-true" : verdict === "FAUX" ? "status-false" : "status-pending"}`}>
      <span aria-hidden="true">{verdict === "VRAI" ? "✓" : verdict === "FAUX" ? "✕" : "!"}</span> {verdict}
    </span>
  );
}

function getImageAiScores(images?: ArticleSummary["images"]) {
  return images?.flatMap((image) => image.analyses?.map((analysis) => analysis.aiScore) ?? [])
    .filter((score) => Number.isFinite(score)) ?? [];
}

function ArticleCard({ article }: { article: ArticleSummary }) {
  const imageSrc = article.coverImageUrl ?? article.images?.[0]?.fileUrl ?? null;
  const forCount = article.commentCounts?.for ?? 0;
  const againstCount = article.commentCounts?.against ?? 0;
  const aiScores = getImageAiScores(article.images);
  const averageAiScore = aiScores.length
    ? aiScores.reduce((total, score) => total + score, 0) / aiScores.length
    : null;

  return (
    <article className="article-card">
      <div className="article-summary">
        <div className="article-meta">
          <StatusBadge status={article.status} />
          <span>{fmtDate(article.publishedAt)}</span>
        </div>
        <span className="article-category">{article.topic?.label ?? "Général"}</span>
        <h3>
          <Link to={`/articles/${article.id}`}>{article.title}</Link>
        </h3>
        <p className="article-excerpt">{excerptOf(article.content)}</p>
        <div className="article-bottom">
          <p>Par {article.author?.name ?? "Rédaction Hamarino"}</p>
          <div className="article-stats">
            <span title="Vérifications"><ShieldCheck size={15} />{fmt(article._count.verifications)}</span>
            <span title="Preuves"><FileCheck2 size={15} />{fmt(article._count.evidences)}</span>
            <span title="Commentaires"><MessageCircle size={15} />{fmt(article.commentsCount ?? article._count.comments)}</span>
          </div>
        </div>
        <div className="comment-stance-summary" aria-label="Répartition des commentaires">
          <span className="stance-pill for-pill">Pour {fmt(forCount)}</span>
          <span className="stance-pill against-pill">Contre {fmt(againstCount)}</span>
        </div>
        {averageAiScore !== null && (
          <div className="article-ai-score">
            <div className="article-ai-score-heading">
              <span><Sparkles size={15} /> Score IA moyen</span>
              <strong>{Math.round(averageAiScore * 100)}%</strong>
            </div>
            <div className="article-ai-score-track" aria-label={`Confiance IA moyenne : ${Math.round(averageAiScore * 100)}%`}>
              <span style={{ width: `${Math.max(0, Math.min(100, averageAiScore * 100))}%` }} />
            </div>
            <small>{aiScores.length} image{aiScores.length > 1 ? 's' : ''} analysée{aiScores.length > 1 ? 's' : ''}</small>
          </div>
        )}
        <Link className="secondary-button comments-link" to={`/articles/${article.id}`}>
          Voir les commentaires
        </Link>
      </div>

      <div className="article-image">
        {imageSrc ? (
          <img src={imageSrc} alt={`Illustration de ${article.title}`} loading="lazy" />
        ) : (
          <div className="article-image-placeholder">Dossier</div>
        )}
        <span>{article.location ?? "Analyse"}</span>
      </div>

      <aside className="article-sources">
        <div className="insight-header">
          <h4><FileCheck2 size={19} /> État du dossier</h4>
          <span className="insight-pill">{verdictLabel(article.status)}</span>
        </div>

        <div className="ai-stats">
          <div className="ai-stat">
            <span>Type</span>
            <strong>{article.relationType ? article.relationType : "Dossier"}</strong>
          </div>
          <div className="ai-stat">
            <span>Publication</span>
            <strong>{fmtDate(article.publishedAt)}</strong>
          </div>
          <div className="ai-stat">
            <span>Source</span>
            <strong>{article.location ?? "–"}</strong>
          </div>
        </div>

        <ul className="source-list">
          <li><Check size={16} aria-hidden="true" /> Analyse de vérification disponible</li>
        </ul>

        <Link className="primary-button dossier-link" to={`/articles/${article.id}`}>
          Voir le dossier complet <ArrowUpRight size={17} />
        </Link>
      </aside>
    </article>
  );
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
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    api.listArticles({ page: 1, limit: 50 })
      .then((data) => {
        if (cancelled) return;
        setArticles(data.items);
        setTotal(data.total);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Impossible de charger les vérifications");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase("fr");
    let list = articles.filter((a) => {
      const haystack = `${a.title} ${a.content} ${a.topic?.label ?? ""}`.toLocaleLowerCase("fr");
      return haystack.includes(normalized);
    });

    if (filter === "Confirmées") list = list.filter((a) => verdictLabel(a.status) === "VRAI");
    else if (filter === "À vérifier") list = list.filter((a) => verdictLabel(a.status) === "À VÉRIFIER");
    else if (filter === "Contestées") list = list.filter((a) => verdictLabel(a.status) === "FAUX");

    if (sort === "verifications") return [...list].sort((a, b) => b._count.verifications - a._count.verifications);
    if (sort === "comments") return [...list].sort((a, b) => b._count.comments - a._count.comments);
    return [...list].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }, [articles, search, filter, sort]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(query.trim());
    setVisible(5);
    document.getElementById("verifications")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="Home">
      <NavBar />
      <main>
        <section className="home-hero">
          <div className="hero-content">
            {/* <div className="hero-eyebrow"><ShieldCheck size={16} /> L’information, examinée avec rigueur</div> */}
            <h1>
              Vérifiez <span>avant de partager.</span>
            </h1>
            <p>Des faits vérifiés et documentés par des journalistes professionnels pour une information plus fiable.</p>
            <form className="home-search" role="search" onSubmit={submit}>
              <Search size={20} aria-hidden="true" />
              <input
                aria-label="Rechercher une information"
                placeholder="Rechercher une information à vérifier..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="primary-button">Rechercher</button>
            </form>
            {/* <div className="trending">
              <span>TENDANCES :</span>
              {['Jirama', 'PrixDuRiz', 'Cyclone', 'Électricité', 'Examens'].map((tag) => (
                <button type="button" key={tag} onClick={() => { setQuery(tag); setSearch(tag); setVisible(5); }}>
                  #{tag}
                </button>
              ))}
            </div> */}
          </div>
        </section>

        <section className="home-feed home-container" id="verifications">
          <div className="feed-heading">
            <div>
              <span className="section-kicker">LE FIL DES VÉRIFICATIONS</span>
              <h2>Vérifications récentes et alertes</h2>
              <p>Consultez les analyses et les éléments examinés.</p>
            </div>
            <div className="feed-controls">
              <span className="case-count">{fmt(total)} dossier{total === 1 ? "" : "s"}</span>
              <label className="sr-only" htmlFor="home-sort">Trier les vérifications</label>
              <select id="home-sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                <option value="recent">Plus récentes</option>
                <option value="verifications">Plus vérifiées</option>
                <option value="comments">Plus commentées</option>
              </select>
            </div>
          </div>

          <div className="feed-filters">
            {(["Toutes les vérifications", "Confirmées", "À vérifier", "Contestées"] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                className={filter === f ? "active" : ""}
                aria-pressed={filter === f}
                onClick={() => { setFilter(f); setVisible(5); }}
              >
                {f}
              </button>
            ))}
          </div>

          {loading && <p className="empty-results">Chargement des vérifications…</p>}

          {!loading && error && (
            <div className="empty-results">
              <p>{error}</p>
              <button type="button" className="primary-button" style={{ marginTop: 12 }} onClick={() => window.location.reload()}>
                Réessayer
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="article-list">
                {results.slice(0, visible).map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
              {results.length === 0 && <p className="empty-results">Aucune vérification ne correspond à votre recherche.</p>}
              {visible < results.length && (
                <div className="load-more">
                  <button type="button" onClick={() => setVisible((v) => v + 5)}>
                    Charger plus de vérifications
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <footer id="a-propos" className="home-footer">
        <div className="home-container footer-inner">
          <div>
            <strong>Hamarino.io</strong> © 2026 · Fact-checking Madagascar
          </div>
          <nav aria-label="Liens institutionnels">
            <a href="mailto:contact@hamarino.io">contact@hamarino.io</a>
            <a href="https://www.poynter.org/ifcn/">Principes IFCN ↗</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
