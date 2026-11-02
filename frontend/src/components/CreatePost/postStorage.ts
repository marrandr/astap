export type LocalPost = {
  id: string;
  title: string;
  category: string;
  content: string;
  sources: string[];
  image: File | null;
  createdAt: string;
};

// IndexedDB keeps the optional image alongside the article without base64 conversion.
export function saveLocalPost(post: LocalPost): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('hamarino', 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains('posts')) {
        database.createObjectStore('posts', { keyPath: 'id' });
      }
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Stockage indisponible'));
    request.onsuccess = () => {
      const database = request.result;
      const transaction = database.transaction('posts', 'readwrite');
      transaction.objectStore('posts').add(post);
      transaction.oncomplete = () => { database.close(); resolve(); };
      transaction.onabort = () => { database.close(); reject(transaction.error); };
      transaction.onerror = () => { database.close(); reject(transaction.error); };
    };
  });
}
