import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { ArrowRight, BadgeCheck, CheckCircle2, ChevronDown, ImagePlus, Link2, Plus, X } from 'lucide-react';
import { saveLocalPost } from './postStorage';
import './CreatePost.css';

const categories = [
  ['politique', 'Politique'], ['economie', 'Économie'], ['societe', 'Société'],
  ['sante', 'Santé'], ['education', 'Éducation'], ['technologie', 'Technologie'], ['autre', 'Autre'],
];
const acceptedTypes = ['image/png', 'image/jpeg', 'image/webp'];
type Source = { id: string; url: string };
const emptySource = (): Source => ({ id: crypto.randomUUID(), url: '' });

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [sources, setSources] = useState<Source[]>(() => [emptySource()]);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [imageError, setImageError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedTitle, setSavedTitle] = useState('');
  const [saveError, setSaveError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const dragDepth = useRef(0);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Créer une publication — Hamarino.io';
    return () => { document.title = previousTitle; };
  }, []);

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  function selectImage(files: FileList | null) {
    if (!files?.length) return;
    if (files.length > 1) {
      setImageError('Veuillez sélectionner une seule image.');
      return;
    }
    const file = files[0];
    if (!acceptedTypes.includes(file.type)) {
      setImageError('Choisissez une image au format PNG, JPG ou WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('L’image ne doit pas dépasser 5 Mo.');
      return;
    }
    setImageError('');
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setSavedTitle('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const nextErrors: Record<string, string> = {};
    if (title.trim().length < 10) nextErrors.title = 'Le titre doit contenir au moins 10 caractères.';
    if (!category) nextErrors.category = 'Sélectionnez une catégorie.';
    if (!content.trim()) nextErrors.content = 'Rédigez le contenu de votre publication.';
    for (const source of sources) {
      if (!source.url.trim()) continue;
      try {
        const url = new URL(source.url.trim());
        if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Invalid protocol');
      } catch {
        nextErrors[`source-${source.id}`] = 'Saisissez une adresse valide commençant par https:// ou http://.';
      }
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const field = formRef.current?.elements.namedItem(Object.keys(nextErrors)[0]);
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    setSaving(true);
    setSaveError('');
    setSavedTitle('');
    try {
      await saveLocalPost({
        id: crypto.randomUUID(), title: title.trim(), category, content: content.trim(),
        sources: sources.map(source => source.url.trim()).filter(Boolean), image,
        createdAt: new Date().toISOString(),
      });
      setSavedTitle(title.trim());
      setTitle(''); setCategory(''); setContent(''); setSources([emptySource()]);
      setImage(null); setImageError(''); setPreview('');
      if (fileInput.current) fileInput.current.value = '';
    } catch {
      setSaveError('L’enregistrement a échoué. Vos champs sont conservés : veuillez réessayer ou vérifier que le stockage du navigateur est disponible.');
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
              <h1 id="create-post-title">Créer une publication</h1>
              <span className="certified-badge"><BadgeCheck size={14} aria-hidden="true" />Journaliste certifié</span>
            </div>
            <p>Publiez une information vérifiable et documentée pour la communauté Hamarino.io.</p>
          </header>

          {savedTitle && <div className="post-success" role="status"><CheckCircle2 size={20} aria-hidden="true" /><div><strong>Article enregistré sur cet appareil</strong><p>« {savedTitle} » a été sauvegardé dans votre navigateur. Il n’est pas encore publié en ligne.</p></div></div>}

          <form ref={formRef} className="create-post-form" noValidate onSubmit={submit} onChange={() => setSavedTitle('')}>
            <fieldset disabled={saving}>
              <div className="post-field">
                <label htmlFor="post-title">Titre de la publication <span className="required-mark">*</span></label>
                <input id="post-title" name="title" value={title} onChange={event => setTitle(event.target.value)} placeholder="Donnez un titre à votre publication…" required minLength={10} aria-invalid={!!errors.title} aria-describedby={errors.title ? 'title-error' : undefined} />
                {errors.title && <p className="post-error" id="title-error">{errors.title}</p>}
              </div>

              <div className="post-field">
                <label htmlFor="post-category">Catégorie <span className="required-mark">*</span></label>
                <div className="post-select-wrapper">
                  <select id="post-category" name="category" value={category} onChange={event => setCategory(event.target.value)} required aria-invalid={!!errors.category} aria-describedby={errors.category ? 'category-error' : undefined}>
                    <option value="" disabled>Sélectionnez une catégorie</option>
                    {categories.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                  </select>
                  <ChevronDown size={17} aria-hidden="true" />
                </div>
                {errors.category && <p className="post-error" id="category-error">{errors.category}</p>}
              </div>

              <div className="post-field">
                <label htmlFor="post-content">Contenu <span className="required-mark">*</span></label>
                <textarea id="post-content" name="content" value={content} onChange={event => setContent(event.target.value)} rows={6} required placeholder="Que souhaitez-vous partager ?" aria-invalid={!!errors.content} aria-describedby={errors.content ? 'content-error' : undefined} />
                {errors.content && <p className="post-error" id="content-error">{errors.content}</p>}
              </div>

              <div className="post-field">
                <div className="post-label-row"><label htmlFor="post-image">Image</label><span>Optionnel</span></div>
                <div className={`post-dropzone${dragging ? ' is-dragging' : ''}${image ? ' has-image' : ''}`}
                  onDragEnter={event => { event.preventDefault(); dragDepth.current += 1; setDragging(true); }}
                  onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; }}
                  onDragLeave={event => { event.preventDefault(); dragDepth.current -= 1; if (dragDepth.current <= 0) setDragging(false); }}
                  onDrop={event => { event.preventDefault(); dragDepth.current = 0; setDragging(false); if (!saving) selectImage(event.dataTransfer.files); }}>
                  <input ref={fileInput} id="post-image" type="file" accept="image/png,image/jpeg,image/webp" className="post-file-input" aria-describedby={`image-help${imageError ? ' image-error' : ''}`} aria-invalid={!!imageError} onChange={event => { selectImage(event.target.files); event.target.value = ''; }} />
                  {image ? <>
                    <label htmlFor="post-image" className="post-image-preview">
                      {preview && <img src={preview} alt="Aperçu de l’image sélectionnée" />}
                      <span className="post-image-name">{image.name}</span><span className="post-image-change">Cliquez pour remplacer l’image</span>
                    </label>
                    <button type="button" className="post-remove-image" aria-label="Supprimer l’image" onClick={() => { setImage(null); setPreview(''); setImageError(''); }}><X size={16} aria-hidden="true" /></button>
                  </> : <label htmlFor="post-image" className="post-upload-label">
                    <span className="post-upload-icon"><ImagePlus size={22} aria-hidden="true" /></span>
                    <span><strong>Cliquez pour importer</strong> ou glissez-déposez</span>
                    <span id="image-help" className="post-image-help">PNG, JPG ou WEBP (max. 5 Mo)</span>
                  </label>}
                  {image && <span id="image-help" className="post-image-help">PNG, JPG ou WEBP (max. 5 Mo)</span>}
                </div>
                {imageError && <p className="post-error" id="image-error" role="alert">{imageError}</p>}
              </div>

              <div className="post-field">
                <div className="post-label-row"><label htmlFor={`source-${sources[0].id}`}>Sources</label><span>Documentation factuelle</span></div>
                <div className="post-source-list">
                  {sources.map((source, index) => <div key={source.id}>
                    <div className="post-source-row">
                      <div className="post-source-input"><Link2 size={17} aria-hidden="true" /><input type="url" id={`source-${source.id}`} name={`source-${source.id}`} aria-label={`Source ${index + 1}`} placeholder="https://exemple.com/source" value={source.url} onChange={event => setSources(current => current.map(item => item.id === source.id ? { ...item, url: event.target.value } : item))} aria-invalid={!!errors[`source-${source.id}`]} aria-describedby={errors[`source-${source.id}`] ? `error-${source.id}` : undefined} /></div>
                      {sources.length > 1 && <button type="button" className="post-remove-source" aria-label={`Supprimer la source ${index + 1}`} onClick={() => setSources(current => current.filter(item => item.id !== source.id))}><X size={17} aria-hidden="true" /></button>}
                    </div>
                    {errors[`source-${source.id}`] && <p id={`error-${source.id}`} className="post-error">{errors[`source-${source.id}`]}</p>}
                  </div>)}
                </div>
                <button type="button" className="post-add-source" onClick={() => { const source = emptySource(); setSources(current => [...current, source]); requestAnimationFrame(() => document.getElementById(`source-${source.id}`)?.focus()); }}><Plus size={15} aria-hidden="true" />Ajouter une source</button>
              </div>

              {saveError && <p className="post-error" role="alert">{saveError}</p>}
              <div className="post-actions">
                <Link to="/" className={`post-cancel${saving ? ' is-disabled' : ''}`} aria-disabled={saving} onClick={event => { if (saving) event.preventDefault(); }}>Annuler</Link>
                <button className="post-submit" type="submit">{saving ? 'Enregistrement…' : 'Publier'}<ArrowRight size={17} aria-hidden="true" /></button>
              </div>
            </fieldset>
          </form>
        </section>
        <p className="post-footer">Seuls les journalistes accrédités peuvent publier sur <strong>Hamarino.io</strong>.</p>
      </div>
    </main>
  );
}
