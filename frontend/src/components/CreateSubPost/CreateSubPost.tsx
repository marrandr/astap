import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowRight, BadgeCheck, CheckCircle2, ArrowLeft } from 'lucide-react';
import { getArticle, saveLocalPosts } from '../CreatePost/postStorage';
import { createPostDraft, validatePostDraft } from '../CreatePost/postDraft';
import ArticleFields from '../CreatePost/ArticleFields';
import SavedPosts from '../CreatePost/SavedPosts';
import './CreateSubPost.css';

export default function CreateSubPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(() => createPostDraft());
  const [parent, setParent] = useState<{ id: string; title: string; parentPostId?: string | null; originalPostId?: string | null } | null>(null);
  const [loadingParent, setLoadingParent] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedVersion, setSavedVersion] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoadingParent(false);
      return;
    }

    let active = true;
    getArticle(id)
      .then(post => {
        if (!active) return;
        if (!post) {
          setNotFound(true);
          setParent(null);
          return;
        }

        setParent({
          id: post.id,
          title: post.title,
          parentPostId: post.parentPostId ?? null,
          originalPostId: post.originalPostId ?? null,
        });
      })
      .catch(() => {
        if (active) {
          setNotFound(true);
          setParent(null);
        }
      })
      .finally(() => {
        if (active) setLoadingParent(false);
      });

    return () => { active = false; };
  }, [id]);

  const isReplyToReply = Boolean(parent && parent.parentPostId);
  const originalArticleLink = parent && parent.parentPostId ? `/articles/${parent.parentPostId}` : null;

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Créer un sous-post — Hamarino.io';
    return () => { document.title = previousTitle; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || !parent || isReplyToReply) return;

    const nextErrors = validatePostDraft(article);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }

    setSaving(true);
    setSaveError('');
    setSavedCount(0);

    try {
      const createdAt = new Date().toISOString();
      const childPost = {
        id: article.id,
        title: article.title.trim(),
        category: article.category,
        content: article.content.trim(),
        sources: article.sources.map(source => source.url.trim()).filter(Boolean),
        media: article.media.map(item => item.file),
        parentPostId: parent.id,
        originalPostId: parent.originalPostId ?? parent.id,
        createdAt,
      };

      await saveLocalPosts([childPost]);
      setSavedCount(1);
      setArticle(createPostDraft());
      setErrors({});
      setSavedVersion(current => current + 1);
      navigate(`/articles/${parent.id}`);
    } catch {
      setSaveError('L’enregistrement a échoué. Votre sous-post est conservé : veuillez réessayer ou vérifier que le stockage du navigateur est disponible.');
    } finally {
      setSaving(false);
    }
  }

  if (loadingParent) {
    return <main className="create-subpost-page"><div className="create-subpost-container"><section className="create-subpost-card"><p>Chargement du parent…</p></section></div></main>;
  }

  if (notFound || !parent) {
    return <main className="create-subpost-page"><div className="create-subpost-container"><section className="create-subpost-card"><h1>404 — Article introuvable</h1><p>Le parent demandé n’existe pas ou a été supprimé.</p><Link to="/verification" className="post-cancel">Retour aux vérifications</Link></section></div></main>;
  }

  return (
    <main className="create-subpost-page">
      <div className="create-subpost-container">
        <section className="create-subpost-card" aria-labelledby="create-subpost-title">
          <header className="create-post-header">
            <div className="create-post-heading">
              <h1 id="create-subpost-title">Créer un sous-post</h1>
              <span className="certified-badge"><BadgeCheck size={14} aria-hidden="true" />Journaliste certifié</span>
            </div>
            <p>Préparez un sous-post vérifiable et documenté pour la communauté Hamarino.io.</p>
          </header>

          {isReplyToReply ? (
            <div className="post-success post-warning" role="alert">
              <ArrowLeft size={20} aria-hidden="true" />
              <div>
                <strong>On ne peut répondre qu&apos;à un article original</strong>
                <p>Ce post est déjà une réponse. Pour continuer, retournez à l’article original.</p>
                {originalArticleLink && (
                  <Link to={originalArticleLink} className="post-cancel post-inline-link">Voir l’article original</Link>
                )}
              </div>
            </div>
          ) : (
            <div className="parent-article-banner">
              <span className="parent-article-label">Réponse à</span>
              <strong>{parent.title}</strong>
            </div>
          )}

          {savedCount > 0 && (
            <div className="post-success" role="status">
              <CheckCircle2 size={20} aria-hidden="true" />
              <div>
                <strong>Sous-post enregistré sur cet appareil</strong>
                <p>Votre sous-post est sauvegardé dans votre navigateur. Il n’est pas encore publié en ligne.</p>
              </div>
            </div>
          )}

          {isReplyToReply ? null : (
            <form ref={formRef} className="create-post-form" noValidate onSubmit={submit} onChange={() => setSavedCount(0)}>
              <fieldset disabled={saving}>
                <section className="post-article" aria-labelledby="subpost-heading">
                  <div className="post-article-heading">
                    <h2 id="subpost-heading">Sous-poste</h2>
                  </div>

                  <ArticleFields
                    draft={article}
                    saving={saving}
                    errors={errors}
                    onChange={update => {
                      setArticle(current => update(current));
                      setSavedCount(0);
                    }}
                  />
                </section>

                {saveError && <p className="post-error" role="alert">{saveError}</p>}

                <div className="post-actions">
                  <Link to={`/articles/${parent.id}`} className={`post-cancel${saving ? ' is-disabled' : ''}`} aria-disabled={saving} onClick={event => { if (saving) event.preventDefault(); }}>Annuler</Link>
                  <button className="post-submit" type="submit">{saving ? 'Enregistrement…' : 'Enregistrer le sous-post'}<ArrowRight size={17} aria-hidden="true" /></button>
                </div>
              </fieldset>
            </form>
          )}
        </section>

        <SavedPosts refreshKey={savedVersion} />
        <p className="post-footer">Seuls les journalistes accrédités peuvent publier sur <strong>Hamarino.io</strong>.</p>
      </div>
    </main>
  );
}
