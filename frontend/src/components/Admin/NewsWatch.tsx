import { useEffect, useState } from 'react';
import { ExternalLink, Newspaper, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { adminApi } from '../../lib/admin-api';
import type { NewsWatchItem } from '../../types/api';
import { useAuth } from '../../lib/auth';
import './NewsWatch.css';

const formatDate = (value: string | null) => value
  ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : 'Date inconnue';

export default function NewsWatch() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [items, setItems] = useState<NewsWatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [syncMessage, setSyncMessage] = useState('');

  const loadItems = async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await adminApi.listWatchArticles());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger la veille.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadItems(); }, []);

  const synchronize = async () => {
    setSyncing(true);
    setError('');
    setSyncMessage('');
    try {
      const result = await adminApi.syncWatchArticles();
      setItems(result.items);
      setSyncMessage(`${result.received} résultat(s) reçus, ${result.saved} article(s) synchronisé(s).`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'La synchronisation a échoué.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <main className="news-watch-page">
      <header className="news-watch-header">
        <div>
          <strong>Hamarino · Administration</strong>
          <nav>
            <Link to="/admin">Validation</Link>
            <Link to="/admin/watch" aria-current="page">Veille Madagascar</Link>
            <Link to="/">Accueil</Link>
          </nav>
        </div>
        <button type="button" className="news-watch-logout" onClick={() => { logout(); navigate('/auth/login'); }}>
          Déconnexion
        </button>
      </header>

      <section className="news-watch-content">
        <div className="news-watch-title-row">
          <div>
            <p className="news-watch-eyebrow">SURVEILLANCE MÉDIATIQUE</p>
            <h1>Veille Madagascar</h1>
            <p>Articles récents repérés par NewsData.io. Les résultats sont des pistes à vérifier.</p>
          </div>
          <button type="button" className="news-watch-sync" onClick={() => void synchronize()} disabled={syncing}>
            <RefreshCw size={17} className={syncing ? 'news-watch-spin' : ''} />
            {syncing ? 'Synchronisation…' : 'Synchroniser'}
          </button>
        </div>

        {syncMessage && <p className="news-watch-success">{syncMessage}</p>}
        {error && <p className="news-watch-error">{error}</p>}

        {loading ? <p className="news-watch-empty">Chargement des articles…</p> : items.length === 0 ? (
          <div className="news-watch-empty-card">
            <Newspaper size={28} />
            <h2>Aucun article dans la veille</h2>
            <p>Lancez une synchronisation. La clé NEWSDATA_API_KEY doit être configurée dans l’environnement du backend.</p>
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
                    {item.sentiment && <small>Sentiment API : {item.sentiment}</small>}
                  </div>
                  <a href={item.link} target="_blank" rel="noreferrer">
                    Lire chez la source <ExternalLink size={15} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
