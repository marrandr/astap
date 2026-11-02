import { useEffect, useState } from 'react';
import { getLocalPost, listLocalPosts, type LocalPost, type PostSummary } from './postStorage';
import MediaPreview from './MediaPreview';

export default function SavedPosts({ refreshKey }: { refreshKey: number }) {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [selected, setSelected] = useState<LocalPost>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    let active = true;
    listLocalPosts(limit).then(result => {
      if (active) { setPosts(result.posts); setTotal(result.total); setError(''); }
    }).catch(() => { if (active) setError('Impossible de charger les articles enregistrés.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refreshKey, limit]);

  async function openPost(id: string) {
    setOpening(true);
    try {
      const post = await getLocalPost(id);
      if (!post) throw new Error('Article introuvable');
      setSelected(post); setError('');
    } catch { setError('Impossible d’ouvrir cet article. Veuillez réessayer.'); }
    finally { setOpening(false); }
  }

  return <section className="create-post-card saved-posts" aria-labelledby="saved-posts-title" aria-busy={loading}>
    <h2 id="saved-posts-title">Mes articles sur cet appareil ({total})</h2>
    <p className="post-image-help">Enregistrés dans ce navigateur, sans publication en ligne. Le nombre d’articles dépend de l’espace disponible sur cet appareil.</p>
    {error && <p className="post-error" role="alert">{error}</p>}
    {loading && <p role="status">Chargement…</p>}
    {!loading && !error && total === 0 && <p>Aucun article enregistré pour le moment.</p>}
    <ul className="saved-post-list">{posts.map(post => <li key={post.id}>
      <button type="button" disabled={opening} onClick={() => void openPost(post.id)}>{post.title}</button>
      <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleString('fr-FR')}</time>
    </li>)}</ul>
    {posts.length < total && <button type="button" className="post-add-source" disabled={loading} onClick={() => { setLoading(true); setLimit(current => current + 10); }}>Afficher plus d’articles</button>}
    {selected && <article className="saved-post-detail" aria-label="Article enregistré">
      <button type="button" className="post-add-source" onClick={() => setSelected(undefined)}>Fermer l’article</button>
      <h3>{selected.title}</h3>
      <p>{selected.category}</p>
      <div className="saved-post-content">{selected.content}</div>
      <ul className="post-media-grid">{(selected.media ?? (selected.image ? [selected.image] : [])).map((file, index) => <li className="post-media-item" key={`${selected.id}-${index}`}><MediaPreview file={file} /><span className="post-image-name">{file.name}</span></li>)}</ul>
      {selected.sources.length > 0 && <><h4>Sources</h4><ul>{selected.sources.map((url, index) => <li key={index}><a href={url} target="_blank" rel="noopener noreferrer">{url}</a></li>)}</ul></>}
    </article>}
  </section>;
}
