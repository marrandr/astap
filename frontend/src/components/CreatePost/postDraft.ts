export type Source = { id: string; url: string };
export type PostDraft = {
  id: string;
  title: string;
  category: string;
  content: string;
  sources: Source[];
  media: { id: string; file: File }[];
};

export const emptySource = (): Source => ({ id: crypto.randomUUID(), url: '' });

export function createPostDraft(): PostDraft {
  return { id: crypto.randomUUID(), title: '', category: '', content: '', sources: [emptySource()], media: [] };
}

export function validatePostDraft(article: PostDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  if (article.title.trim().length < 10) errors.title = 'Le titre doit contenir au moins 10 caractères.';
  if (!article.category) errors.category = 'Sélectionnez une catégorie.';
  if (!article.content.trim()) errors.content = 'Rédigez le contenu de votre publication.';
  for (const source of article.sources) {
    if (!source.url.trim()) continue;
    try {
      const url = new URL(source.url.trim());
      if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Invalid protocol');
    } catch {
      errors[`source-${source.id}`] = 'Saisissez une adresse valide commençant par https:// ou http://.';
    }
  }
  return errors;
}
