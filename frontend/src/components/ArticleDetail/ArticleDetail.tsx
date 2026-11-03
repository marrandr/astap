import './ArticleDetail.css';
import '../Home/Home.css';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, FileText, Link as LinkIcon, FileCheck2, ShieldCheck, MapPin, CalendarDays, User } from 'lucide-react';
import { api } from '../../lib/api';
import type { ArticleDetail as ArticleDetailData } from '../../types/api';
import SiteNavbar from '../SiteNavbar';

const verdictLabel = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return { label: 'VRAI', cls: 'status-true', symbol: '✓' };
    case 'CONTRADICTED':
    case 'MISLEADING':
      return { label: 'FAUX', cls: 'status-false', symbol: '✕' };
    default:
      return { label: 'À VÉRIFIER', cls: 'status-pending', symbol: '!' };
  }
};

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));

const verdictFr = (verdict: string) => (verdict === 'CONFIRMED' ? 'Confirmé' : 'Contesté');

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<ArticleDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const articleId = Number(id);
    if (!Number.isInteger(articleId) || articleId < 1) {
      setError('Identifiant d’article invalide.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    api.getArticle(articleId)
      .then((data) => { if (!cancelled) setArticle(data); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Article introuvable'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return <div className="Home ArticleDetail"><SiteNavbar/><main className="detail-container"><p className="empty-results">Chargement du dossier…</p></main></div>;
  }

  if (error || !article) {
    return (
      <div className="Home ArticleDetail"><SiteNavbar/>
        <main className="detail-container">
          <p className="empty-results">{error || 'Article introuvable.'}</p>
          <Link to="/" className="primary-button" style={{ marginTop: 16 }}><ArrowLeft size={16}/> Retour au fil</Link>
        </main>
      </div>
    );
  }

  const verdict = verdictLabel(article.status);

  const detailCover = article.coverImageUrl ?? article.images?.[0]?.fileUrl ?? null;

  return (
    <div className="Home ArticleDetail">
      <SiteNavbar/>
      <main className="detail-container">
        <Link to="/" className="back-link"><ArrowLeft size={16}/> Retour au fil</Link>

        <header className="detail-header">
          <div className="article-meta">
            <span className={`status-badge ${verdict.cls}`}><span aria-hidden="true">{verdict.symbol}</span> {verdict.label}</span>
            <span className="article-category">{article.topic?.label ?? 'Général'}</span>
          </div>
          <h1>{article.title}</h1>
          <div className="detail-meta">
            <span><User size={15}/> {article.author?.name}</span>
            <span><CalendarDays size={15}/> {fmtDate(article.publishedAt)}</span>
            {article.location && <span><MapPin size={15}/> {article.location}</span>}
          </div>
        </header>

        {detailCover && (
          <div className="detail-cover"><img src={detailCover} alt={`Illustration : ${article.title}`}/></div>
        )}

        <article className="detail-content">
          {article.content.split(/\n{2,}/).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </article>

        {article.images?.length > 0 && (
          <section className="detail-section">
            <h2><FileText size={18}/> Images du dossier</h2>
            <div className="detail-gallery">
              {article.images.map((image) => (
                <a key={image.id} href={image.fileUrl} target="_blank" rel="noreferrer">
                  <img src={image.fileUrl} alt="Pièce jointe du dossier" loading="lazy"/>
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="detail-section">
          <h2><ShieldCheck size={18}/> Vérifications ({article.verifications?.length ?? 0})</h2>
          {article.verifications?.length ? (
            <ul className="detail-verifications">
              {article.verifications.map((v) => (
                <li key={v.id}>
                  <div className="detail-verification-head">
                    <span className={`status-badge ${v.verdict === 'CONFIRMED' ? 'status-true' : 'status-false'}`}>{verdictFr(v.verdict)}</span>
                    <span className="detail-verification-author">{v.user?.name} · {fmtDate(v.verifiedAt)}</span>
                  </div>
                  <p>{v.justification}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="detail-empty">Aucune vérification enregistrée pour ce dossier.</p>
          )}
        </section>

        <section className="detail-section">
          <h2><FileCheck2 size={18}/> Preuves ({article.evidences?.length ?? 0})</h2>
          {article.evidences?.length ? (
            <ul className="detail-evidences">
              {article.evidences.map((evidence) => (
                <li key={evidence.id}>
                  <span className="evidence-type">{evidence.type.replace(/_/g, ' ')}</span>
                  {evidence.description && <span>{evidence.description}</span>}
                  {evidence.url && <a href={evidence.url} target="_blank" rel="noreferrer"><LinkIcon size={14}/> Voir la source</a>}
                  {evidence.file && <a href={evidence.file} target="_blank" rel="noreferrer"><LinkIcon size={14}/> Voir le fichier</a>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="detail-empty">Aucune preuve ajoutée pour ce dossier.</p>
          )}
        </section>
      </main>
    </div>
  );
}
