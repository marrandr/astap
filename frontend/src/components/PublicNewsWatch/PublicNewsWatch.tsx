import { ExternalLink, Newspaper, RefreshCw } from 'lucide-react';
import { useGetPublicWatchArticlesQuery, useRefreshPublicWatchMutation } from '../../store/api';
import '../Home/Home.css';
import './PublicNewsWatch.css';

const formatDate = (value: string | null) => value
  ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : 'Date inconnue';

export default function PublicNewsWatch() {
  const { data: items = [], isLoading: loading, error: queryError } = useGetPublicWatchArticlesQuery();
  const [refresh, { isLoading: refreshing, error: refreshError }] = useRefreshPublicWatchMutation();
  const error = queryError || refreshError ? 'Impossible de rechercher les actualités. Réessayez dans un instant.' : '';

  return (
    <main className="news-watch-page">
      <section className="news-watch-content">
        <div className="news-watch-title-row">
          <div>
            <p className="news-watch-eyebrow">INFORMATIONS RÉCENTES</p>
            <h1>Veille Madagascar</h1>
            <p>Une sélection d’articles récents pour suivre l’actualité malgache.</p>
          </div>
          <button type="button" className="news-watch-sync" onClick={() => { void refresh(); }} disabled={loading || refreshing}>
            <RefreshCw size={17} className={loading || refreshing ? 'news-watch-spin' : ''} /> {refreshing ? 'Recherche…' : 'Actualiser'}
          </button>
        </div>

        {error && <p className="news-watch-error">{error}</p>}
        {loading ? <p className="news-watch-empty">Chargement des actualités…</p> : items.length === 0 ? (
          <div className="news-watch-empty-card">
            <Newspaper size={28} />
            <h2>Aucune actualité disponible pour le moment</h2>
            <p>Les dernières informations apparaîtront ici après la prochaine synchronisation de la veille.</p>
          </div>
        ) : (
          <div className="news-watch-list">
            {items.map((item) => (
              <article className={`news-watch-card${item.imageUrl ? '' : ' news-watch-card-no-image'}`} key={item.providerId}>
                {item.imageUrl && <img src={item.imageUrl} alt="" loading="lazy" />}
                <div className="news-watch-card-body">
                  <div className="news-watch-meta">
                    <span>{item.sourceName ?? item.sourceId ?? 'Source inconnue'}</span>
                    <time dateTime={item.publishedAt ?? item.fetchedAt}>{formatDate(item.publishedAt)}</time>
                  </div>
                  <h2>{item.title}</h2>
                  <p>{item.description || 'Résumé non disponible. Consultez l’article à la source pour lire son contenu.'}</p>
                  <div className="news-watch-tags">
                    {item.categories.map((category) => <span key={category}>{category}</span>)}
                    {item.sentiment && <small>Sentiment détecté : {item.sentiment}</small>}
                  </div>
                  <a href={item.link} target="_blank" rel="noreferrer">
                    Lire l’article à la source <ExternalLink size={15} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
        <p className="public-watch-note">Ces articles sont des liens de veille issus de médias externes. Leur présence ici ne signifie pas que leur contenu a été vérifié par Hamarino.</p>
      </section>
    </main>
  );
}
