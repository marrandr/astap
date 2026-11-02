import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { ArrowRight, BadgeCheck, CheckCircle2, Plus, X } from 'lucide-react';
import { saveLocalPosts } from './postStorage';
import { createPostDraft, validatePostDraft } from './postDraft';
import ArticleFields from './ArticleFields';
import SavedPosts from './SavedPosts';
import './CreatePost.css';

export default function CreatePost() {
  const [articles, setArticles] = useState(() => [createPostDraft()]);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  const [savedVersion, setSavedVersion] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Créer une publication — Hamarino.io';
    return () => { document.title = previousTitle; };
  }, []);

  function addArticle() {
    const article = createPostDraft();
    setArticles(current => [...current, article]);
    setSavedCount(0);
    requestAnimationFrame(() => document.getElementById(`post-title-${article.id}`)?.focus());
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const nextErrors = Object.fromEntries(articles.map(article => [article.id, validatePostDraft(article)]));
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(fields => Object.keys(fields).length)) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setSaving(true);
    setSaveError('');
    setSavedCount(0);
    try {
      const createdAt = new Date().toISOString();
      await saveLocalPosts(articles.map(article => ({
        id: article.id, title: article.title.trim(), category: article.category, content: article.content.trim(),
        sources: article.sources.map(source => source.url.trim()).filter(Boolean),
        media: article.media.map(item => item.file), createdAt,
      })));
      setSavedCount(articles.length);
      setArticles([createPostDraft()]);
      setErrors({});
      setSavedVersion(current => current + 1);
    } catch {
      setSaveError('L’enregistrement a échoué. Vos articles sont conservés : veuillez réessayer ou vérifier que le stockage du navigateur est disponible.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="create-post-page">
      <div className="create-post-container">
        <section className="create-post-card" aria-labelledby="create-post-title">
          <header className="create-post-header">
            <div className="create-post-heading">
              <h1 id="create-post-title">Créer des articles</h1>
              <span className="certified-badge"><BadgeCheck size={14} aria-hidden="true" />Journaliste certifié</span>
            </div>
            <p>Préparez un ou plusieurs articles vérifiables et documentés pour la communauté Hamarino.io.</p>
          </header>
          {savedCount > 0 && <div className="post-success" role="status"><CheckCircle2 size={20} aria-hidden="true" /><div>
            <strong>{savedCount === 1 ? 'Article enregistré sur cet appareil' : `${savedCount} articles enregistrés sur cet appareil`}</strong>
            <p>{savedCount === 1 ? 'Votre article est sauvegardé dans votre navigateur. Il n’est pas encore publié en ligne.' : 'Vos articles sont sauvegardés dans votre navigateur. Ils ne sont pas encore publiés en ligne.'}</p>
          </div></div>}
          <form ref={formRef} className="create-post-form" noValidate onSubmit={submit} onChange={() => setSavedCount(0)}>
            <fieldset disabled={saving}>
              {articles.map((article, index) => <section className="post-article" key={article.id} aria-labelledby={`article-heading-${article.id}`}>
                <div className="post-article-heading">
                  <h2 id={`article-heading-${article.id}`}>Article {index + 1}</h2>
                  {articles.length > 1 && <button type="button" className="post-remove-article" aria-label={`Supprimer l’article ${index + 1}`} onClick={() => {
                    setArticles(current => current.filter(item => item.id !== article.id));
                    setSavedCount(0);
                  }}><X size={16} aria-hidden="true" />Retirer</button>}
                </div>
                <ArticleFields draft={article} saving={saving} errors={errors[article.id] ?? {}} onChange={update => {
                  setArticles(current => current.map(item => item.id === article.id ? update(item) : item));
                  setSavedCount(0);
                }} />
              </section>)}
              <button type="button" className="post-add-article" onClick={addArticle}><Plus size={18} aria-hidden="true" />Ajouter un article</button>
              {saveError && <p className="post-error" role="alert">{saveError}</p>}
              <div className="post-actions">
                <Link to="/" className={`post-cancel${saving ? ' is-disabled' : ''}`} aria-disabled={saving} onClick={event => { if (saving) event.preventDefault(); }}>Annuler</Link>
                <button className="post-submit" type="submit">{saving ? 'Enregistrement…' : articles.length === 1 ? 'Enregistrer l’article' : `Enregistrer les ${articles.length} articles`}<ArrowRight size={17} aria-hidden="true" /></button>
              </div>
            </fieldset>
          </form>
        </section>
        <SavedPosts refreshKey={savedVersion} />
        <p className="post-footer">Seuls les journalistes accrédités peuvent publier sur <strong>Hamarino.io</strong>.</p>
      </div>
    </main>
  );
}
