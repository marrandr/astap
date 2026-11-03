export function validatePressCard(file: { type: string; size: number }): string {
  if (!['image/png', 'image/jpeg', 'application/pdf'].includes(file.type)) {
    return 'Choisissez un fichier PNG, JPG ou PDF.';
  }
  if (file.size === 0) return 'Le fichier sélectionné est vide.';
  if (file.size > 10 * 1024 ** 2) return 'Le fichier ne doit pas dépasser 10 Mo.';
  return '';
}
