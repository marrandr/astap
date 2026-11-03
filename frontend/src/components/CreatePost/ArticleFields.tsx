import { useRef, useState, type SetStateAction } from 'react';
import { ChevronDown, ImagePlus, Link2, Plus, X } from 'lucide-react';
import { MEDIA_ACCEPT, validateMediaSelection } from './postMedia';
import { emptySource, type PostDraft } from './postDraft';
import MediaPreview from './MediaPreview';

const categories = [
  ['politique', 'Politique'], ['economie', 'Économie'], ['societe', 'Société'],
  ['sante', 'Santé'], ['education', 'Éducation'], ['technologie', 'Technologie'], ['autre', 'Autre'],
];

type Props = {
  draft: PostDraft;
  onChange: (update: (current: PostDraft) => PostDraft) => void;
  saving: boolean;
  errors: Record<string, string>;
};

export default function ArticleFields({ draft, onChange, saving, errors }: Props) {
  const { title, category, content, sources, media } = draft;
  const [imageError, setImageError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  function setField<K extends keyof PostDraft>(key: K, value: SetStateAction<PostDraft[K]>) {
    onChange(current => ({ ...current, [key]: typeof value === 'function'
      ? (value as (previous: PostDraft[K]) => PostDraft[K])(current[key]) : value }));
  }
  const setTitle = (value: string) => setField('title', value);
  const setCategory = (value: string) => setField('category', value);
  const setContent = (value: string) => setField('content', value);
  const setSources = (value: SetStateAction<PostDraft['sources']>) => setField('sources', value);
  const setMedia = (value: SetStateAction<PostDraft['media']>) => setField('media', value);

  function selectMedia(files: FileList | null) {
    if (!files?.length || saving) return;
    const added = Array.from(files);
    const error = validateMediaSelection(media.map(item => item.file), added);
    setImageError(error);
    if (error) return;
    setMedia(current => [...current, ...added.map(file => ({ id: crypto.randomUUID(), file }))]);
  }

  return <div className="post-article-fields">
              <div className="post-field">
                <label htmlFor={`post-title-${draft.id}`}>Titre de la publication <span className="required-mark">*</span></label>
                <input id={`post-title-${draft.id}`} name="title" value={title} onChange={event => setTitle(event.target.value)} placeholder="Donnez un titre à votre publication…" required minLength={10} aria-invalid={!!errors.title} aria-describedby={errors.title ? `title-error-${draft.id}` : undefined} />
                {errors.title && <p className="post-error" id={`title-error-${draft.id}`}>{errors.title}</p>}
              </div>

              <div className="post-field">
                <label htmlFor={`post-category-${draft.id}`}>Catégorie <span className="required-mark">*</span></label>
                <div className="post-select-wrapper">
                  <select id={`post-category-${draft.id}`} name="category" value={category} onChange={event => setCategory(event.target.value)} required aria-invalid={!!errors.category} aria-describedby={errors.category ? `category-error-${draft.id}` : undefined}>
                    <option value="" disabled>Sélectionnez une catégorie</option>
                    {categories.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                  </select>
                  <ChevronDown size={17} aria-hidden="true" />
                </div>
                {errors.category && <p className="post-error" id={`category-error-${draft.id}`}>{errors.category}</p>}
              </div>

              <div className="post-field">
                <label htmlFor={`post-content-${draft.id}`}>Contenu <span className="required-mark">*</span></label>
                <textarea id={`post-content-${draft.id}`} name="content" value={content} onChange={event => setContent(event.target.value)} rows={6} required placeholder="Que souhaitez-vous partager ?" aria-invalid={!!errors.content} aria-describedby={errors.content ? `content-error-${draft.id}` : undefined} />
                {errors.content && <p className="post-error" id={`content-error-${draft.id}`}>{errors.content}</p>}
              </div>

              <div className="post-field">
                <div className="post-label-row"><label htmlFor={`post-image-${draft.id}`}>Images et vidéos</label><span>Optionnel</span></div>
                <div className={`post-dropzone${dragging ? ' is-dragging' : ''}`}
                  onDragEnter={event => { event.preventDefault(); dragDepth.current += 1; setDragging(true); }}
                  onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; }}
                  onDragLeave={event => { event.preventDefault(); dragDepth.current -= 1; if (dragDepth.current <= 0) setDragging(false); }}
                  onDrop={event => { event.preventDefault(); dragDepth.current = 0; setDragging(false); if (!saving) selectMedia(event.dataTransfer.files); }}>
                  <input ref={fileInput} id={`post-image-${draft.id}`} type="file" multiple accept={MEDIA_ACCEPT} className="post-file-input" aria-describedby={`image-help-${draft.id}${imageError ? ` image-error-${draft.id}` : ''}`} aria-invalid={!!imageError} onChange={event => { selectMedia(event.target.files); event.target.value = ''; }} />
                  <label htmlFor={`post-image-${draft.id}`} className="post-upload-label">
                    <span className="post-upload-icon"><ImagePlus size={22} aria-hidden="true" /></span>
                    <span><strong>{media.length ? 'Ajouter des fichiers' : 'Cliquez pour importer'}</strong> ou glissez-déposez</span>
                    <span id={`image-help-${draft.id}`} className="post-image-help">20 fichiers maximum · Images PNG, JPG, WEBP : 5 Mo · Vidéos MP4, WEBM, MOV : 100 Mo · Total : 200 Mo</span>
                  </label>
                </div>
                {media.length > 0 && <>
                  <p className="post-image-help" role="status">{media.length} / 20 fichiers sélectionnés</p>
                  <ul className="post-media-grid">
                    {media.map(item => <li key={item.id} className="post-media-item">
                      <MediaPreview file={item.file} />
                      <span className="post-image-name">{item.file.name}</span>
                      <button type="button" className="post-remove-image" aria-label={`Supprimer ${item.file.name}`} onClick={() => { setMedia(current => current.filter(entry => entry.id !== item.id)); setImageError(''); }}><X size={16} aria-hidden="true" /></button>
                    </li>)}
                  </ul>
                </>}
                {imageError && <p className="post-error" id={`image-error-${draft.id}`} role="alert">{imageError}</p>}
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

  </div>;
}
