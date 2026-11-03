import { useRef, useState, type DragEvent } from 'react';
import { ImagePlus, LoaderCircle, ShieldCheck, Upload, X } from 'lucide-react';
import { useAnalyzeImageMutation } from '../../store/api';
import './ImageVerification.css';

const MAX_SIZE = 5 * 1024 * 1024;

export default function ImageVerification() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [analyzeImage, { isLoading }] = useAnalyzeImageMutation();

  function chooseImage(image?: File) {
    setError('');
    setResult(null);
    if (!image) return;
    if (!['image/jpeg', 'image/png'].includes(image.type)) {
      setError('Choisissez une image au format JPEG ou PNG.');
      return;
    }
    if (image.size > MAX_SIZE) {
      setError('La taille maximale autorisée est de 5 Mo.');
      return;
    }
    setFile(image);
    setPreview(URL.createObjectURL(image));
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragging(false);
    chooseImage(event.dataTransfer.files[0]);
  }

  async function verify() {
    if (!file || isLoading) return;
    setError('');
    try {
      const response = await analyzeImage(file).unwrap();
      setResult(Math.max(0, Math.min(100, response.aiScore * 100)));
    } catch (failure) {
      const message = failure && typeof failure === 'object' && 'data' in failure
        ? (failure.data as { message?: unknown })?.message
        : null;
      setError(typeof message === 'string' ? message : 'L’analyse a échoué. Vérifiez votre connexion puis réessayez.');
    }
  }

  function clearImage() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview('');
    setResult(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <main className="image-verification-page">
      <section className="image-verification-card" aria-labelledby="image-verification-title">
        <div className="image-verification-icon"><ShieldCheck size={25} aria-hidden="true" /></div>
        <p className="image-verification-kicker">OUTIL DE VÉRIFICATION</p>
        <h1 id="image-verification-title">Vérifier une image</h1>
        <p className="image-verification-intro">Importez une image pour estimer la probabilité qu’elle ait été générée par une intelligence artificielle.</p>

        {!file ? (
          <button type="button" className={`image-dropzone${dragging ? ' is-dragging' : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)} onDrop={handleDrop}
            aria-label="Déposer une image ou cliquer pour la choisir">
            <span className="image-dropzone-icon"><Upload size={23} aria-hidden="true" /></span>
            <strong>Glissez-déposez votre image ici</strong>
            <span>ou cliquez pour choisir un fichier</span>
            <small>JPEG ou PNG · 5 Mo maximum</small>
          </button>
        ) : (
          <div className="image-selected">
            <img src={preview} alt="Aperçu de l’image à vérifier" />
            <div className="image-selected-meta"><ImagePlus size={17} aria-hidden="true" /><span title={file.name}>{file.name}</span>
              <button type="button" onClick={clearImage} aria-label="Retirer l’image" disabled={isLoading}><X size={17} /></button>
            </div>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/jpeg,image/png" className="image-file-input" onChange={(event) => chooseImage(event.target.files?.[0])} />

        {error && <p className="image-verification-error" role="alert">{error}</p>}
        {file && <button type="button" className="image-verify-button" onClick={verify} disabled={isLoading}>
          {isLoading ? <><LoaderCircle className="image-spinner" size={18} /> Analyse en cours…</> : 'Analyser l’image'}
        </button>}

        {result !== null && <section className={`image-result${result > 50 ? ' is-high' : ''}`} aria-live="polite">
          <div className="image-result-heading"><span>Probabilité d’image générée par IA</span><strong>{Math.round(result)}%</strong></div>
          <div className="image-result-track"><span style={{ width: `${result}%` }} /></div>
          <p>{result > 50 ? 'Score supérieur à 50 % : l’image est signalée comme probablement générée par IA.' : 'Score de 50 % ou moins : l’image est moins susceptible d’avoir été générée par IA.'}</p>
        </section>}
        <p className="image-verification-note">Ce résultat est une estimation automatique et ne constitue pas, à lui seul, une preuve de l’origine de l’image.</p>
      </section>
    </main>
  );
}
