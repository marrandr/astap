import './Signup.css';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import user from '../../assets/user.png';
import check from '../../assets/check.png';
import Input from '../Input/Input';
import verso from '../../assets/verso.svg';
import recto from '../../assets/recto.svg';
import { api } from '../../lib/api';
import { setPendingEmail } from '../../lib/auth';

interface AddCardItemProps {
  classList: string;
  icon: string;
  size: number;
  children: string;
  name: string;
  onFileSelect: (name: string, file: File | null) => void;
}

const AddCardItem = ({ classList, icon, size, children, name, onFileSelect }: AddCardItemProps) => {
  const [preview, setPreview] = useState<string>(icon);
  const [loaded, setLoaded] = useState<boolean>(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onFileSelect(name, file);

    if (file) {
      setPreview(URL.createObjectURL(file));
      setLoaded(true);
    }
  };

  return (
    <div className={'AddCardItem ' + classList}>
      {!loaded ? (
        <>
          <div className='icon'>
            <img src={preview} width={size} height={size} />
          </div>
          <p>{children}</p>
          <label>
            <input
              accept='image/*'
              id={name}
              name={name}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              type='file'
            />
            importer
          </label>
        </>
      ) : (
        <>
          <div className='image'>
            <img src={preview} />
            <label
              onClick={() => {
                setLoaded(false);
                setPreview(icon);
                onFileSelect(name, null);
              }}
            >
              enlever
            </label>
          </div>
        </>
      )}
    </div>
  );
};

const AddCard = ({ onFileSelect }: { onFileSelect: (name: string, file: File | null) => void }) => {
  return (
    <div className='AddCard'>
      <AddCardItem
        icon={verso}
        size={24}
        name='front'
        classList='left'
        onFileSelect={onFileSelect}
      >
        Recto de la carte
      </AddCardItem>
      <AddCardItem
        icon={recto}
        size={24}
        name='back'
        classList='right'
        onFileSelect={onFileSelect}
      >
        Verso de la carte
      </AddCardItem>
    </div>
  );
};

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [files, setFiles] = useState<Record<string, File | null>>({
    front: null,
    back: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (name: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [name]: file }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Tous les champs sont obligatoires');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!files.front || !files.back) {
      setError('Vous devez importer le recto et le verso de la carte');
      return;
    }

    setLoading(true);

    try {
      const response = await api.register(
        {
          name,
          email,
          password,
        },
        {
          front: files.front ?? undefined,
          back: files.back ?? undefined,
        },
      );

      setPendingEmail(email);
      navigate('/auth/verify-email');
      console.log(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l’inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className='Signup' onSubmit={handleSubmit}>
      <div className='SignupLeft'></div>
      <div className='SignupRight'>
        <p className='title'>Créer un compte</p>
        <Input icon={user} name='name' type='text' holder='Saisissez votre nom et prénom' value={name} onChange={setName}>
          Nom et prénom
        </Input>
        <Input icon={user} name='email' type='email' holder='Saisissez votre adresse e-mail' value={email} onChange={setEmail}>
          Adresse email
        </Input>
        <Input icon={user} name='password' type='password' holder='Saisissez votre mot de passe' value={password} onChange={setPassword}>
          Mot de passe
        </Input>
        <Input icon={check} name='confirmPassword' type='password' holder='Confirmez votre mot de passe' value={confirmPassword} onChange={setConfirmPassword}>
          Confirmer le mot de passe
        </Input>
        <AddCard onFileSelect={handleFileSelect} />

        {error && <p style={{ color: 'crimson', marginBottom: 12 }}>{error}</p>}

        <button type='submit' disabled={loading}>
          {loading ? 'Création...' : 'Créer mon compte'}
        </button>
      </div>
    </form>
  );
};

export default Signup;
