import { useEffect, useState } from 'react';
import { CheckCircle2, Search, ShieldAlert, XCircle } from 'lucide-react';
import { Link } from 'react-router';
import { useGetAdminUserQuery, useListPendingUsersQuery, useValidateUserMutation } from '../../store/api';
import './AdminDashboard.css';

const fmtDate = (iso: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));

export default function AdminDashboard() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const { data: users = [], isLoading: loadingList, refetch: loadUsers } = useListPendingUsersQuery();
  const { data: user, isLoading: loadingUser } = useGetAdminUserQuery(selectedId ?? 0, { skip: !selectedId });
  const [validateUser, { isLoading: saving }] = useValidateUserMutation();
  const filteredUsers = users.filter((item) => `${item.name} ${item.email}`.toLocaleLowerCase('fr').includes(userSearch.trim().toLocaleLowerCase('fr')));

  useEffect(() => {
    if (users.length && (!selectedId || !users.some(item => item.id === selectedId))) setSelectedId(users[0].id);
  }, [selectedId, users]);

  const applyDecision = async (status: 'VALIDATE' | 'REFUSED') => {
    if (!selectedId) return;
    setError('');
    try {
      await validateUser({ id_user: selectedId, status }).unwrap();
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de mettre à jour le statut');
    }
  };

  return (
    <main className="admin-dashboard-page">
      <header className="admin-page-heading">
        <h1>Administration</h1>
        <p>Examinez les demandes et vérifiez les informations avant validation.</p>
      </header>
      <div className="admin-dashboard-shell">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-header">
            <h2>Comptes à valider <span>{users.length}</span></h2>
            <Link to="/" className="admin-home-link">Accueil</Link>
          </div>

          <label className="admin-search">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Rechercher un compte</span>
            <input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Nom ou adresse e-mail" />
          </label>

          {loadingList ? (
            <p className="admin-state-text">Chargement…</p>
          ) : users.length === 0 ? (
            <p className="admin-state-text">Aucun compte en attente.</p>
          ) : filteredUsers.length === 0 ? (
            <p className="admin-state-text">Aucun compte ne correspond à cette recherche.</p>
          ) : (
            <ul className="admin-user-list">
              {filteredUsers.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`admin-user-item ${selectedId === item.id ? 'is-selected' : ''}`}
                  >
                    <strong>{item.name}</strong>
                    <span>{item.email}</span>
                    <small>{fmtDate(item.registeredAt)}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="admin-detail-panel">
          {error && <p className="admin-error-banner">{error}</p>}

          {!selectedId ? (
            <p className="admin-state-text">Sélectionnez un compte à examiner.</p>
          ) : loadingUser ? (
            <p className="admin-state-text">Chargement du dossier…</p>
          ) : user ? (
            <>
              <div className="admin-profile-header">
                <div>
                  <h2>{user.name}</h2>
                  <p>{user.email}</p>
                </div>
                <span className="admin-status-badge">{user.status}</span>
              </div>

              <div className="admin-metrics-grid">
                <div className="admin-metric-card">
                  <small>Rôle</small>
                  <div>{user.role}</div>
                </div>
                <div className="admin-metric-card">
                  <small>Inscription</small>
                  <div>{fmtDate(user.registeredAt)}</div>
                </div>
                <div className="admin-metric-card">
                  <small>Réputation</small>
                  <div>{user.reputation}</div>
                </div>
              </div>

              <div className="admin-documents-block">
                <h3>Pièces d’identité</h3>
                <div className="admin-documents-grid">
                  {user.proofFrontUrl ? (
                    <div className="admin-document-card">
                      <p>Recto</p>
                      <img src={user.proofFrontUrl} alt="Preuve recto" />
                    </div>
                  ) : <p className="admin-empty-doc">Aucun recto</p>}

                  {user.proofBackUrl ? (
                    <div className="admin-document-card">
                      <p>Verso</p>
                      <img src={user.proofBackUrl} alt="Preuve verso" />
                    </div>
                  ) : <p className="admin-empty-doc">Aucun verso</p>}
                </div>
              </div>

              <div className="admin-actions-row">
                <button type="button" disabled={saving} onClick={() => void applyDecision('VALIDATE')} className="admin-action-button success">
                  <CheckCircle2 size={16} /> Valider
                </button>
                <button type="button" disabled={saving} onClick={() => void applyDecision('REFUSED')} className="admin-action-button danger">
                  <XCircle size={16} /> Refuser
                </button>
                <button type="button" disabled={saving} onClick={() => void loadUsers()} className="admin-action-button neutral">
                  <ShieldAlert size={16} /> Rafraîchir
                </button>
              </div>
            </>
          ) : (
            <p className="admin-state-text">Compte introuvable.</p>
          )}
        </section>
      </div>
    </main>
  );
}
