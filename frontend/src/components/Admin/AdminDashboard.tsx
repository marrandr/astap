import { useEffect, useState } from 'react';
import { CheckCircle2, ShieldAlert, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { adminApi } from '../../lib/admin-api';
import { useAuth } from '../../lib/auth';
import type { AdminPendingUser, AdminUserDetail } from '../../types/admin';

const fmtDate = (iso: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
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
    <main style={{ minHeight: '100vh', background: '#f3f6fb', padding: 24 }}>
      <header style={{ maxWidth: 1200, margin: '0 auto 20px', background: '#fff', borderRadius: 18, boxShadow: '0 10px 30px rgba(15, 23, 42, .08)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <strong style={{ fontSize: 18 }}>Admin</strong>
          <nav style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 600 }}>Accueil</Link>
            <Link to="/admin" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 600 }}>Dashboard</Link>
            <Link to="/admin" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 700 }}>Validation</Link>
          </nav>
        </div>

        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/auth/login');
          }}
          style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}
        >
          Déconnexion
        </button>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
        <aside style={{ background: '#fff', borderRadius: 18, boxShadow: '0 10px 30px rgba(15, 23, 42, .08)', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ margin: 0 }}>À valider</h2>
            <Link to="/" style={{ color: '#2563eb', textDecoration: 'none' }}>Accueil</Link>
          </div>

          {loadingList ? (
            <p>Chargement…</p>
          ) : users.length === 0 ? (
            <p>Aucun compte en attente.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
              {users.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      border: selectedId === item.id ? '1px solid #2563eb' : '1px solid #e2e8f0',
                      borderRadius: 12,
                      background: selectedId === item.id ? '#eff6ff' : '#fff',
                      padding: 12,
                      cursor: 'pointer',
                    }}
                  >
                    <strong style={{ display: 'block' }}>{item.name}</strong>
                    <span style={{ display: 'block', color: '#475569', fontSize: 13 }}>{item.email}</span>
                    <small style={{ display: 'block', marginTop: 6, color: '#64748b' }}>{fmtDate(item.registeredAt)}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section style={{ background: '#fff', borderRadius: 18, boxShadow: '0 10px 30px rgba(15, 23, 42, .08)', padding: 24 }}>
          {error && <p style={{ color: '#b91c1c', marginBottom: 16 }}>{error}</p>}

          {!selectedId ? (
            <p>Sélectionnez un compte à examiner.</p>
          ) : loadingUser ? (
            <p>Chargement du dossier…</p>
          ) : user ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div>
                  <h2 style={{ margin: 0 }}>{user.name}</h2>
                  <p style={{ margin: '6px 0 0', color: '#475569' }}>{user.email}</p>
                </div>
                <span style={{ background: '#f0fdf4', color: '#166534', padding: '6px 10px', borderRadius: 999, fontWeight: 700 }}>
                  {user.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16 }}>
                  <small style={{ color: '#64748b' }}>Rôle</small>
                  <div style={{ fontWeight: 700 }}>{user.role}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16 }}>
                  <small style={{ color: '#64748b' }}>Inscription</small>
                  <div style={{ fontWeight: 700 }}>{fmtDate(user.registeredAt)}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16 }}>
                  <small style={{ color: '#64748b' }}>Réputation</small>
                  <div style={{ fontWeight: 700 }}>{user.reputation}</div>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <h3 style={{ marginBottom: 12 }}>Pièces d’identité</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
                  {user.proofFrontUrl ? (
                    <div>
                      <p style={{ marginBottom: 8 }}>Recto</p>
                      <img src={user.proofFrontUrl} alt="Preuve recto" style={{ width: '100%', borderRadius: 12, border: '1px solid #e2e8f0', maxHeight: 300, objectFit: 'cover' }} />
                    </div>
                  ) : <p>Aucun recto</p>}

                  {user.proofBackUrl ? (
                    <div>
                      <p style={{ marginBottom: 8 }}>Verso</p>
                      <img src={user.proofBackUrl} alt="Preuve verso" style={{ width: '100%', borderRadius: 12, border: '1px solid #e2e8f0', maxHeight: 300, objectFit: 'cover' }} />
                    </div>
                  ) : <p>Aucun verso</p>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button type="button" disabled={saving} onClick={() => void applyDecision('VALIDATE')} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 16px', fontWeight: 700, cursor: 'pointer' }}>
                  <CheckCircle2 size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Valider
                </button>
                <button type="button" disabled={saving} onClick={() => void applyDecision('REFUSED')} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 16px', fontWeight: 700, cursor: 'pointer' }}>
                  <XCircle size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Refuser
                </button>
                <button type="button" disabled={saving} onClick={() => void loadUsers()} style={{ background: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: 10, padding: '12px 16px', fontWeight: 700, cursor: 'pointer' }}>
                  <ShieldAlert size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Rafraîchir
                </button>
              </div>
            </>
          ) : (
            <p>Compte introuvable.</p>
          )}
        </section>
      </div>
    </main>
  );
}
