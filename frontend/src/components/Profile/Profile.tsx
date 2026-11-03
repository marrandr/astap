import { Link, useParams } from 'react-router';
import { Award, BookOpenText, Camera, CheckCircle2, MapPin, ShieldCheck } from 'lucide-react';
import './Profile.css';

type ProfileData = {
  id: string;
  name: string;
  role: string;
  location: string;
  bio: string;
  email: string;
  avatar: string;
  badge: string;
  stats: {
    articles: number;
    verifications: number;
    followers: number;
    credibility: number;
  };
  highlights: string[];
  recentArticles: Array<{
    title: string;
    type: string;
    date: string;
    verified: boolean;
  }>;
};

const profiles: Record<string, ProfileData> = {
  demo: {
    id: 'demo',
    name: 'Rova Hery',
    role: 'Journaliste fact-checking',
    location: 'Antananarivo, Madagascar',
    bio: 'Journaliste spécialisé dans la vérification des informations et l’analyse des contenus à fort impact public. S’investit dans la documentation des faits, les sources et l’accès aux preuves.',
    email: 'rova.hery@hamarino.io',
    avatar: 'RH',
    badge: 'Vérificateur certifié',
    stats: {
      articles: 24,
      verifications: 142,
      followers: 4890,
      credibility: 96,
    },
    highlights: ['Données publiques', 'Sources vérifiées', 'Analyse documentaire'],
    recentArticles: [
      { title: 'Une campagne de désinformation sur les réseaux sociaux', type: 'Analyse', date: '12 septembre 2026', verified: true },
      { title: 'Le cadre légal des évènements publics à Madagascar', type: 'Reportage', date: '28 août 2026', verified: true },
      { title: 'Les chiffres clés de la couverture médiatique locale', type: 'Dossier', date: '10 août 2026', verified: false },
    ],
  },
  marie: {
    id: 'marie',
    name: 'Marie Andrianina',
    role: 'Rédactrice en chef',
    location: 'Fianarantsoa, Madagascar',
    bio: 'Rédactrice spécialisée dans les enquêtes d’intérêt public, la cartographie des sources et le cadrage éditorial de contenus sensibles.',
    email: 'marie.andrianina@hamarino.io',
    avatar: 'MA',
    badge: 'Éditrice',
    stats: {
      articles: 31,
      verifications: 205,
      followers: 6320,
      credibility: 98,
    },
    highlights: ['Éditorial', 'Documentation', 'Validation des sources'],
    recentArticles: [
      { title: 'Les zones les plus exposées à la désinformation', type: 'Enquête', date: '6 septembre 2026', verified: true },
      { title: 'La couverture locale avant les élections', type: 'Reportage', date: '19 août 2026', verified: true },
      { title: 'Les nouvelles pratiques de vérification en ligne', type: 'Analyse', date: '2 août 2026', verified: true },
    ],
  },
};

export default function ProfilePage() {
  const { id = 'demo' } = useParams();
  const profile = profiles[id] ?? profiles.demo;

  return (
    <div className="Profile">
      <main className="profile-page">
        <div className="profile-shell">
          <section className="profile-hero">
            <div className="profile-cover" aria-hidden="true" />

            <div className="profile-main">
              <div className="profile-avatar" aria-label={`Avatar de ${profile.name}`}>
                {profile.avatar}
              </div>

              <div className="profile-summary">
                <div className="profile-badge-row">
                  <span className="profile-badge">{profile.badge}</span>
                  <span className="profile-status"><CheckCircle2 size={14} /> En ligne</span>
                </div>

                <h1>{profile.name}</h1>
                <p className="profile-role">{profile.role}</p>

                <div className="profile-meta">
                  <span><MapPin size={15} /> {profile.location}</span>
                  <span><Camera size={15} /> {profile.email}</span>
                </div>
              </div>

              <Link to="/" className="profile-back-link">Retour à l’accueil</Link>
            </div>
          </section>

          <section className="profile-content">
            <div className="profile-main-column">
              <div className="profile-stats-grid">
                <div className="profile-stat">
                  <span className="profile-stat-label"><BookOpenText size={16} /> Articles</span>
                  <strong>{profile.stats.articles}</strong>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-label"><ShieldCheck size={16} /> Vérifications</span>
                  <strong>{profile.stats.verifications}</strong>
                </div>
            </div>

              <div className="profile-card profile-activity">
                <div className="profile-card-header">
                  <h2>Activité récente</h2>
                  <span className="profile-chip"><Award size={14} /> Profil vérifié</span>
                </div>

                <ul className="profile-article-list">
                  {profile.recentArticles.map((article) => (
                    <li key={article.title} className="profile-article-item">
                      <div>
                        <p className="article-type">{article.type}</p>
                        <h3>{article.title}</h3>
                        <time>{article.date}</time>
                      </div>
                      <span className={`article-state ${article.verified ? 'verified' : 'pending'}`}>
                        {article.verified ? 'Validé' : 'En cours'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
