import { useEffect, useRef } from 'react';

export default function MediaPreview({ file }: { file: File }) {
  const image = useRef<HTMLImageElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    const element = video.current ?? image.current;
    if (element) element.src = objectUrl;
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return file.type.startsWith('video/')
    ? <video ref={video} controls preload="metadata" aria-label={`Aperçu : ${file.name}`}>Votre navigateur ne peut pas lire cette vidéo.</video>
    : <img ref={image} alt={`Aperçu : ${file.name}`} loading="lazy" />;
}
