import './ArticleDetail.css';
import '../Home/Home.css';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, FileText, Link as LinkIcon, FileCheck2, ShieldCheck, MapPin, CalendarDays, User, MessageSquareText } from 'lucide-react';
import { useCreateCommentMutation, useGetArticleQuery } from '../../store/api';
import type { ArticleImage } from '../../types/api';

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
const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n);
const imageAiScore = (image: ArticleImage) => image.analyses?.[0]?.aiScore;

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const articleId = Number(id);
  const validId = Number.isInteger(articleId) && articleId > 0;
  const { data: article, isLoading: loading, error: queryError } = useGetArticleQuery(articleId, { skip: !validId });
  const [createComment, { isLoading: submitting }] = useCreateCommentMutation();
  const error = validId ? (queryError ? 'Article introuvable' : '') : 'Identifiant d’article invalide.';
  const [commentForm, setCommentForm] = useState({
    stance: 'FOR' as 'FOR' | 'AGAINST',
    content: '',
    justification: '',
  });
  const [submitMessage, setSubmitMessage] = useState('');
  const [commentFilter, setCommentFilter] = useState<'ALL' | 'FOR' | 'AGAINST'>('ALL');
  const [newCommentId, setNewCommentId] = useState<number | null>(null);

  const handleSubmitComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;

    setSubmitMessage('');

    try {
      const result = await createComment({ articleId: Number(id), payload: {
        stance: commentForm.stance,
        content: commentForm.content.trim(),
        justification: commentForm.justification.trim(),
      } }).unwrap();

      setNewCommentId(result.comment.id);
      setCommentForm({ stance: 'FOR', content: '', justification: '' });
      setSubmitMessage('Commentaire ajouté avec succès.');
    } catch (err) {
      setSubmitMessage(err instanceof Error ? err.message : 'Impossible d’ajouter le commentaire.');
    }
  };

  if (loading) {
    return <div className="Home ArticleDetail"><main className="detail-container"><p className="empty-results">Chargement du dossier…</p></main></div>;
  }

  if (error || !article) {
    return (
      <div className="Home ArticleDetail">
        <main className="detail-container">
          <p className="empty-results">{error || 'Article introuvable.'}</p>
          <Link to="/verification" className="primary-button" style={{ marginTop: 16 }}><ArrowLeft size={16}/> Retour au fil</Link>
        </main>
      </div>
    );
  }

  const verdict = verdictLabel(article.status);
  const detailCover = article.coverImageUrl ?? article.images?.[0]?.fileUrl ?? null;
  const detailCoverImage = article.images?.find((image) => image.fileUrl === detailCover);
  const detailCoverAiScore = detailCoverImage ? imageAiScore(detailCoverImage) : undefined;
  const forCount = article.commentCounts?.for ?? 0;
  const againstCount = article.commentCounts?.against ?? 0;
  const visibleComments = article.comments?.filter((comment) => commentFilter === 'ALL' || comment.stance === commentFilter) ?? [];

  return (
    <div className="Home ArticleDetail">
      <main className="detail-container">
        <Link to="/verification" className="back-link"><ArrowLeft size={16}/> Retour au fil</Link>

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
          <div className="detail-cover">
            <img src={detailCover} alt={`Illustration : ${article.title}`}/>
            {detailCoverAiScore !== undefined && (
              <span className={`detail-cover-ai-score${detailCoverAiScore > 0.5 ? ' is-high' : ''}`}>Score IA {Math.round(detailCoverAiScore * 100)}%</span>
            )}
          </div>
        )}

        <article className="detail-content">
          {article.content.split(/\n{2,}/).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </article>

        <section className="detail-section">
          <h2><MessageSquareText size={18}/> Commentaires ({article.commentsCount ?? article.comments?.length ?? 0})</h2>
          <div className="comment-summary-bar">
            <span className="stance-pill for-pill">Confirme {fmt(forCount)}</span>
            <span className="stance-pill against-pill">Contredit {fmt(againstCount)}</span>
          </div>

          <form className="comment-form" onSubmit={handleSubmitComment}>
            <div className="comment-form-row">
              <fieldset className="comment-stance-fieldset">
                <legend>Avis</legend>
                <label className={`comment-stance-option comment-stance-confirm ${commentForm.stance === 'FOR' ? 'is-selected' : ''}`}>
                  <input type="checkbox" checked={commentForm.stance === 'FOR'} onChange={() => setCommentForm((prev) => ({ ...prev, stance: 'FOR' }))} />
                  <span>Confirme</span>
                </label>
                <label className={`comment-stance-option comment-stance-contradict ${commentForm.stance === 'AGAINST' ? 'is-selected' : ''}`}>
                  <input type="checkbox" checked={commentForm.stance === 'AGAINST'} onChange={() => setCommentForm((prev) => ({ ...prev, stance: 'AGAINST' }))} />
                  <span>Contredit</span>
                </label>
              </fieldset>
            </div>

            <label>
              Commentaire
              <textarea
                value={commentForm.content}
                onChange={(event) => setCommentForm((prev) => ({ ...prev, content: event.target.value }))}
                placeholder="Votre commentaire"
                minLength={3}
                maxLength={2000}
                required
              />
            </label>

            <label>
              Justification
              <textarea
                value={commentForm.justification}
                onChange={(event) => setCommentForm((prev) => ({ ...prev, justification: event.target.value }))}
                placeholder="Expliquez pourquoi vous confirmez ou contredisez cette information, avec une justification claire."
                minLength={10}
                maxLength={4000}
                required
              />
            </label>

            <div className="comment-form-actions">
              <button type="submit" className={`primary-button comment-submit-${commentForm.stance === 'FOR' ? 'confirm' : 'contradict'}`} disabled={submitting}>
                {submitting ? 'Envoi...' : 'Publier le commentaire'}
              </button>
            </div>

            {submitMessage && <p className="comment-submit-message">{submitMessage}</p>}
          </form>

          <label className="comment-filter">
            Afficher les avis
            <select value={commentFilter} onChange={(event) => setCommentFilter(event.target.value as 'ALL' | 'FOR' | 'AGAINST')}>
              <option value="ALL">Tous les avis</option>
              <option value="FOR">Confirme</option>
              <option value="AGAINST">Contredit</option>
            </select>
          </label>

          {visibleComments.length ? (
            <ul className="detail-comments">
              {visibleComments.map((comment) => (
                <li key={comment.id} className={`${comment.stance === 'FOR' ? 'comment-for' : 'comment-against'}${comment.id === newCommentId ? ' comment-new' : ''}`}>
                  <div className="detail-comment-head">
                    <span className={`stance-pill ${comment.stance === 'FOR' ? 'for-pill' : 'against-pill'}`}>
                      {comment.stance === 'FOR' ? 'Confirme' : 'Contredit'}
                    </span>
                    <span className="detail-verification-author">{comment.user?.name} · {fmtDate(comment.commentedAt)}</span>
                  </div>
                  <p className="detail-comment-content">{comment.content}</p>
                  <p className="detail-comment-justification"><strong>Justification :</strong> {comment.justification}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="detail-empty">{article.comments?.length ? 'Aucun avis dans cette catégorie.' : 'Aucun commentaire pour ce dossier.'}</p>
          )}
        </section>

        {article.images?.length > 0 && (
          <section className="detail-section">
            <h2><FileText size={18}/> Images du dossier</h2>
            <div className="detail-gallery">
              {article.images.map((image) => {
                const score = imageAiScore(image);
                return (
                  <figure className="detail-gallery-item" key={image.id}>
                    <a href={image.fileUrl} target="_blank" rel="noreferrer">
                      <img src={image.fileUrl} alt="Pièce jointe du dossier" loading="lazy"/>
                    </a>
                    <figcaption className={score !== undefined && score > 0.5 ? 'is-high' : undefined}>
                      {score === undefined ? 'Non analysée par IA' : `Score IA : ${Math.round(score * 100)}%`}
                    </figcaption>
                  </figure>
                );
              })}
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
