export type LocalPost = {
  id: string;
  title: string;
  category: string;
  content: string;
  sources: string[];
  media?: File[];
  parentPostId?: string | null;
  originalPostId?: string | null;
  // Preserve images saved by the first version of the form.
  image?: File | null;
  createdAt: string;
};
export type PostSummary = Pick<LocalPost, 'id' | 'title' | 'category' | 'createdAt'>;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('hamarino', 2);
    let blocked = false;
    request.onupgradeneeded = () => {
      const database = request.result;
      const store = database.objectStoreNames.contains('posts')
        ? request.transaction!.objectStore('posts')
        : database.createObjectStore('posts', { keyPath: 'id' });
      if (!store.indexNames.contains('createdAt')) store.createIndex('createdAt', 'createdAt');
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => { blocked = true; reject(new Error('Fermez les autres onglets Hamarino puis réessayez.')); };
    request.onsuccess = () => {
      const database = request.result;
      if (blocked) { database.close(); return; }
      database.onversionchange = () => database.close();
      resolve(database);
    };
  });
}

// Resolve only when the full transaction (including the media) is committed.
async function withStore<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore, result: (value: T) => void) => void): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    let result: T;
    try {
      const transaction = database.transaction('posts', mode);
      transaction.oncomplete = () => { database.close(); resolve(result); };
      transaction.onabort = () => { database.close(); reject(transaction.error); };
      action(transaction.objectStore('posts'), value => { result = value; });
    } catch (error) {
      database.close(); reject(error);
    }
  });
}

export function saveLocalPost(post: LocalPost): Promise<void> {
  return saveLocalPosts([post]);
}

export function saveLocalPosts(posts: LocalPost[]): Promise<void> {
  return withStore('readwrite', store => {
    for (const post of posts) store.put(post);
  });
}

export function listLocalPosts(limit = 10): Promise<{ posts: PostSummary[]; total: number }> {
  return withStore('readonly', (store, result) => {
    const posts: PostSummary[] = [];
    let total = 0;
    store.count().onsuccess = event => { total = (event.target as IDBRequest<number>).result; };
    store.index('createdAt').openCursor(null, 'prev').onsuccess = event => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
      if (cursor && posts.length < limit) {
        const { id, title, category, createdAt } = cursor.value as LocalPost;
        posts.push({ id, title, category, createdAt });
        cursor.continue();
      } else result({ posts, total });
    };
  });
}

export function getLocalPost(id: string): Promise<LocalPost | undefined> {
  return withStore('readonly', (store, result) => {
    store.get(id).onsuccess = event => result((event.target as IDBRequest<LocalPost | undefined>).result);
  });
}

export function getArticle(id: string): Promise<LocalPost | undefined> {
  return getLocalPost(id);
}

export function listChildPosts(parentId: string): Promise<LocalPost[]> {
  return withStore('readonly', (store, result) => {
    const posts: LocalPost[] = [];
    store.openCursor().onsuccess = event => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
      if (cursor) {
        const post = cursor.value as LocalPost;
        if (post.parentPostId === parentId) posts.push(post);
        cursor.continue();
      } else {
        result(posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    };
  });
}
