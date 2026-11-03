import { useEffect, useState } from 'react';
import { CheckCircle2, ShieldAlert, XCircle } from 'lucide-react';
import { Link } from 'react-router';
import { adminApi } from '../../lib/admin-api';
import type { AdminPendingUser, AdminUserDetail } from '../../types/admin';
import './AdminDashboard.css';

const fmtDate = (iso: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminPendingUser[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingUser, setLoadingUser] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    setLoadingList(true);
    setError('');
    try {
      const data = await adminApi.listPendingUsers();
      setUsers(data);
      if (data.length && !selectedId) setSelectedId(data[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les comptes à valider');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setUser(null);
      return;
    }

    let active = true;
    setLoadingUser(true);
    adminApi.getUser(selectedId)
      .then((data) => {
        if (active) setUser(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Impossible de charger le profil');
      })
      .finally(() => {
        if (active) setLoadingUser(false);
      });

    return () => {
      active = false;
    };
  }, [selectedId]);

  const applyDecision = async (status: 'VALIDATE' | 'REFUSED') => {
    if (!selectedId) return;
    setSaving(true);
    setError('');
    try {
      await adminApi.validateUser({ id_user: selectedId, status });
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de mettre à jour le statut');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="admin-dashboard-page">
      <div className="admin-dashboard-shell">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-header">
            <h2>À valider</h2>
            <Link to="/" className="admin-home-link">Accueil</Link>
          </div>

          {loadingList ? (
            <p className="admin-state-text">Chargement…</p>
          ) : users.length === 0 ? (
            <p className="admin-state-text">Aucun compte en attente.</p>
          ) : (
            <ul className="admin-user-list">
              {users.map((item) => (
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
