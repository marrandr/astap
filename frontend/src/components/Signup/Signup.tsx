import './Signup.css';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, AtSign, CreditCard, Eye, EyeOff, FileText, LockKeyhole, UserRound, X } from 'lucide-react';
import hamarinoLogo from '../../assets/hamarino-io-logo-2048x518.png';
import googleLogo from '../Login/Google.svg';
import { useRegisterMutation } from '../../store/api';
import { setPendingEmail } from '../../lib/auth';
import { validatePressCard } from './signupFiles';

function Brand({ mobile = false }: { mobile?: boolean }) {
  return <Link to='/' className={`signup-brand${mobile ? ' signup-brand-mobile' : ''}`} aria-label='Hamarino.io, accueil'><img src={hamarinoLogo} width={2048} height={518} alt='Hamarino.io' /></Link>;
}

function PressCardUpload({ side, file, disabled, onChange, onError }: {
  side: 'front' | 'back'; file: File | null; disabled: boolean;
  onChange: (file: File | null) => void; onError: (message: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const previewImage = useRef<HTMLImageElement>(null);
  const [dragging, setDragging] = useState(false);
  const title = side === 'front' ? 'Recto de la carte' : 'Verso de la carte';

  useEffect(() => {
    if (!file || !previewImage.current) return;
    const url = URL.createObjectURL(file);
    previewImage.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function selectFile(selected?: File) {
    if (!selected || disabled) return;
    const error = validatePressCard(selected);
    onError(error);
    if (!error) onChange(selected);
  }

  return <div className={`signup-upload${dragging ? ' is-dragging' : ''}${file ? ' has-file' : ''}`}
    onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
    onDragLeave={() => setDragging(false)}
    onDrop={(event) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files[0]); }}>
    <input ref={input} className='signup-file-input' id={`signup-${side}`} name={side} type='file' disabled={disabled} accept='image/png,image/jpeg,application/pdf' onChange={(event) => { selectFile(event.target.files?.[0]); event.target.value = ''; }} />
    <button type='button' className='signup-upload-select' disabled={disabled} onClick={() => input.current?.click()} aria-label={`${file ? 'Remplacer' : 'Importer'} : ${title}`}>
      {file && file.type !== 'application/pdf' ? <img ref={previewImage} className='signup-card-preview' alt={`Aperçu : ${title}`} /> : file ? <FileText size={24} aria-hidden='true' /> : <CreditCard size={24} aria-hidden='true' />}
      <strong>{title}</strong>
      <span className='signup-file-name'>{file ? file.name : 'PNG, JPG, PDF · max 10 Mo'}</span>
    </button>
    {file && <button type='button' className='signup-upload-remove' disabled={disabled} aria-label={`Retirer : ${title}`} onClick={() => onChange(null)}><X size={16} aria-hidden='true' /></button>}
  </div>;
}

export default function Signup() {
  const [registerRequest, { isLoading: loading }] = useRegisterMutation();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [consent, setConsent] = useState(false);
  const [files, setFiles] = useState<{ front: File | null; back: File | null }>({ front: null, back: null });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const strength = password.length < 8 ? 1 : 1 + Number(/[a-z]/.test(password) && /[A-Z]/.test(password)) + Number(/\d/.test(password)) + Number(/[^a-zA-Z0-9]/.test(password));
  const strengthLabel = !password ? 'Au moins 8 caractères' : password.length < 8 ? 'Trop court · au moins 8 caractères' : ['Faible', 'Faible', 'Moyen', 'Bon', 'Fort'][strength];

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Inscription Journaliste — Hamarino.io';
    return () => { document.title = previousTitle; };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError(''); setNotice('');
    if (!name.trim() || !email.trim() || password.length < 8 || !consent) {
      setError('Renseignez tous les champs, un mot de passe de 8 caractères minimum et acceptez les conditions.'); return;
    }
    if (!files.front || !files.back) { setError('Importez le recto et le verso de votre carte de presse.'); return; }
    try {
      await registerRequest({ payload: { name: name.trim(), email: email.trim(), password }, files: { front: files.front, back: files.back } }).unwrap();
      setPendingEmail(email.trim());
      navigate('/auth/verify-email');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l’inscription');
    }
  }

  return <main className='signup-page'>
    <section className='signup-story' aria-labelledby='signup-headline'>
      <Brand />
      <svg className='signup-watermark' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'><path d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z' /></svg>
      <div className='signup-story-copy'><h1 id='signup-headline'>Face aux rumeurs,<br />choisissons les faits.</h1><p>Une plateforme collaborative pour vérifier les informations et lutter ensemble contre la désinformation.</p></div>
      {/*<p className='signup-story-footer'>Plateforme d’investigation et de fact-checking certifiée IFCN.</p>*/}
    </section>
    <section className='signup-panel' aria-labelledby='signup-title'>
      <div className='signup-container'>
        <Brand mobile />
        <header className='signup-header'><h2 id='signup-title'>Créer un compte journaliste</h2><p>Rejoignez le réseau des vérificateurs accrédités à Madagascar.</p></header>
        <form className='signup-form' onSubmit={handleSubmit} aria-busy={loading}>
          <div className='signup-field'>
            <label htmlFor='signup-name'>Nom complet <span>*</span></label>
            <div className='signup-input-wrap'><UserRound size={18} aria-hidden='true' /><input id='signup-name' name='name' autoComplete='name' placeholder='ex. Jean Rakoto' required value={name} onChange={(event) => setName(event.target.value)} /></div>
          </div>
          <div className='signup-field'>
            <label htmlFor='signup-email'>Adresse email professionnelle <span>*</span></label>
            <div className='signup-input-wrap'><AtSign size={18} aria-hidden='true' /><input id='signup-email' name='email' type='email' autoComplete='email' placeholder='nom@redaction.mg' required value={email} onChange={(event) => setEmail(event.target.value)} /></div>
          </div>
          <div className='signup-field'>
            <label htmlFor='signup-password'>Mot de passe <span>*</span></label>
            <div className='signup-input-wrap'><LockKeyhole size={18} aria-hidden='true' /><input id='signup-password' name='password' type={showPassword ? 'text' : 'password'} autoComplete='new-password' placeholder='Au moins 8 caractères' minLength={8} required aria-describedby='signup-strength' value={password} onChange={(event) => setPassword(event.target.value)} /><button type='button' className='signup-password-toggle' aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} aria-hidden='true' /> : <Eye size={18} aria-hidden='true' />}</button></div>
            <div className='signup-strength'><div className='signup-strength-bars' aria-hidden='true'>{[1, 2, 3, 4].map((bar) => <i key={bar} className={password && bar <= strength ? `active strength-${strength}` : ''} />)}</div><span id='signup-strength'>{strengthLabel}</span></div>
          </div>
          <fieldset className='signup-card-field'><legend>Carte de presse accréditée <span>*</span></legend><p className='signup-upload-hint'>Recto / Verso obligatoire</p><div className='signup-uploads'>{(['front', 'back'] as const).map((side) => <PressCardUpload key={side} side={side} file={files[side]} disabled={loading} onError={setError} onChange={(file) => setFiles((previous) => ({ ...previous, [side]: file }))} />)}</div></fieldset>
          <label className='signup-consent'><input type='checkbox' name='terms' required checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>J’accepte la <strong>charte déontologique IFCN</strong> et les conditions d’utilisation d’Hamarino.io.</span></label>
          {error && <p className='signup-error' role='alert'>{error}</p>}
          <button className='signup-submit' type='submit' disabled={loading}><span>{loading ? 'Création du compte…' : 'Créer mon compte'}</span>{!loading && <ArrowRight size={18} aria-hidden='true' />}</button>
          <div className='signup-divider'><span>OU S’INSCRIRE AVEC</span></div>
          <button className='signup-google' type='button' disabled={loading} onClick={() => setNotice('L’inscription avec Google n’est pas encore disponible. Utilisez le formulaire ci-dessus.')}><img src={googleLogo} width={18} height={18} alt='' />Continuer avec Google</button>
          {notice && <p className='signup-notice' role='status'>{notice}</p>}
          <p className='signup-login'>Vous avez déjà un compte ? <Link to='/auth/login'>Se connecter</Link></p>
        </form>
      </div>
    </section>
  </main>;
}
