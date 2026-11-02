export const MEDIA_ACCEPT = 'image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime';
const imageTypes = ['image/png', 'image/jpeg', 'image/webp'];
const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

export function validateMediaSelection(existing: File[], added: File[]): string {
  if (existing.length + added.length > 20) return 'Vous pouvez joindre jusqu’à 20 fichiers par article.';
  for (const file of added) {
    if (![...imageTypes, ...videoTypes].includes(file.type)) return `${file.name} : format non pris en charge (PNG, JPG, WEBP, MP4, WEBM ou MOV).`;
    const isVideo = videoTypes.includes(file.type);
    if (file.size > (isVideo ? 100 : 5) * 1024 ** 2) return `${file.name} : maximum ${isVideo ? 100 : 5} Mo par ${isVideo ? 'vidéo' : 'image'}.`;
  }
  if ([...existing, ...added].reduce((total, file) => total + file.size, 0) > 200 * 1024 ** 2) return 'Les fichiers d’un article ne doivent pas dépasser 200 Mo au total.';
  return '';
}
