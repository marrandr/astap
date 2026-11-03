import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../../lib/api';
import { clearPendingEmail, getPendingEmail, getStoredToken, useAuth } from '../../lib/auth';

export default function EmailVerification() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const pendingEmail = getPendingEmail();
    if (pendingEmail) {
      setEmail(pendingEmail);
      return;
    }

    const storedToken = getStoredToken();
    if (storedToken) {
      navigate('/', { replace: true });
      return;
    }

    navigate('/auth/login', { replace: true });
  }, [navigate]);

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!code) {
      setError('Veuillez renseigner le code à 6 chiffres.');
      return;
    }

    if (!email) {
      setError('Email introuvable. Veuillez recommencer la création du compte.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.verifyEmail({ email, code });
      if (response.access_token) {
        login(response.access_token);
      }
      clearPendingEmail();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResendLoading(true);
    setError('');

    try {
      await api.resendVerification(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de renvoyer le code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f7fb',
      padding: 20,
    }}>
      <form
        onSubmit={handleVerify}
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08)',
        }}
      >
        <h2 style={{ margin: '0 0 12px', fontSize: 28 }}>Vérification email</h2>
        <p style={{ margin: '0 0 20px', color: '#475569' }}>
          Un code à 6 chiffres a été envoyé à <strong>{email || 'votre adresse email'}</strong>.
        </p>

        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Code de vérification</label>
        <input
          type='text'
          inputMode='numeric'
          maxLength={6}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder='123456'
          autoFocus
          style={{ width: '100%', padding: '12px 14px', marginBottom: 16, borderRadius: 10, border: '1px solid #cbd5e1' }}
        />

        {error && <p style={{ color: '#dc2626', marginBottom: 16 }}>{error}</p>}

        <button
          type='submit'
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: 'none',
            borderRadius: 10,
            background: '#1d4ed8',
            color: '#fff',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Vérification...' : 'Vérifier mon email'}
        </button>

        <button
          type='button'
          onClick={handleResend}
          disabled={resendLoading}
          style={{
            width: '100%',
            marginTop: 12,
            padding: '12px 16px',
            border: '1px solid #cbd5e1',
            borderRadius: 10,
            background: '#fff',
            color: '#0f172a',
            fontWeight: 600,
            cursor: resendLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {resendLoading ? 'Envoi...' : 'Renvoyer le code'}
        </button>
      </form>
    </div>
  );
}
