import test from 'ava';
import { createStore } from 'tinybase';
import type { MergeableStore, Store } from 'tinybase';
import type { PersistedContent, PersisterListener } from 'tinybase/persisters';
import { Persists, createCustomPersister } from 'tinybase/persisters';

// Mock storage
const mockFiles = new Map<string, { content: string; exists: boolean; modificationTime: number }>();

// Mock File class
class MockFile {
  constructor(private path: string) {
    if (!mockFiles.has(path)) {
      mockFiles.set(path, { content: '', exists: false, modificationTime: Date.now() });
    }
  }

  get exists(): boolean {
    return mockFiles.get(this.path)?.exists ?? false;
  }

  async text(): Promise<string> {
    const file = mockFiles.get(this.path);
    if (!file || !file.exists) {
      throw new Error('File does not exist');
    }
    return file.content;
  }

  async write(content: string): Promise<void> {
    mockFiles.set(this.path, { content, exists: true, modificationTime: Date.now() });
  }
}

const mockGetInfoAsync = async (path: string) => {
  const file = mockFiles.get(path);
  if (!file || !file.exists) {
    return { exists: false, isDirectory: false, uri: path };
  }
  return {
    exists: true,
    isDirectory: false,
    uri: path,
    size: file.content.length,
    modificationTime: file.modificationTime,
  };
};

// Copy of the implementation with mock FileSystem
const jsonParseWithUndefined = (json: string): any => {
  return JSON.parse(json, (_key, value) => {
    return value === null ? undefined : value;
  });
};

const jsonStringWithUndefined = (obj: any): string => {
  return JSON.stringify(obj, (_key, value) => {
    return value === undefined ? null : value;
  });
};

const createExpoFileSystemPersister = (
  store: Store | MergeableStore,
  filePath: string,
  onIgnoredError?: (error: any) => void,
) => {
  const file = new MockFile(filePath);

  const getPersisted = async (): Promise<PersistedContent<Persists.StoreOrMergeableStore>> => {
    try {
      const content = await file.text();
      return jsonParseWithUndefined(content);
    } catch (_error) {
      return [{}, {}];
    }
  };

  const setPersisted = async (
    getContent: () => PersistedContent<Persists.StoreOrMergeableStore>,
  ): Promise<void> => {
    await file.write(jsonStringWithUndefined(getContent()));
  };

  let intervalId: NodeJS.Timeout | null = null;
  let lastModified: number | null = null;

  const addPersisterListener = (
    listener: PersisterListener<Persists.StoreOrMergeableStore>,
  ): NodeJS.Timeout => {
    try {
      if (!file.exists) {
        file.write('');
      }
    } catch (error: any) {
      onIgnoredError?.(error);
    }

    intervalId = setInterval(async () => {
      try {
        const info = await mockGetInfoAsync(filePath);
        if (info.exists && 'modificationTime' in info) {
          const currentModified = info.modificationTime;
          if (lastModified !== null && currentModified !== lastModified) {
            listener();
          }
          lastModified = currentModified ?? null;
        }
      } catch (error) {
        onIgnoredError?.(error);
      }
    }, 1000);

    return intervalId;
  };

  const delPersisterListener = (intervalId: NodeJS.Timeout): void => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  const persister = createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    Persists.StoreOrMergeableStore,
  );

  return {
    ...persister,
    getFilePath: () => filePath,
  };
};

// Setup and teardown
test.beforeEach(() => {
  mockFiles.clear();
});

test.afterEach(() => {
  mockFiles.clear();
});

test('createExpoFileSystemPersister exports a function', (t) => {
  t.is(typeof createExpoFileSystemPersister, 'function');
});

test('createExpoFileSystemPersister creates a persister', (t) => {
  const store = createStore();
  const filePath = 'test-store.json';

  const persister = createExpoFileSystemPersister(store, filePath);

  t.truthy(persister);
  t.is(typeof persister.getFilePath, 'function');
  t.is(persister.getFilePath(), filePath);
});

test('persister saves store data to file', async (t) => {
  const store = createStore();
  const filePath = 'test-save.json';

  store.setTables({ pets: { fido: { species: 'dog' } } });

  const persister = createExpoFileSystemPersister(store, filePath);
  await persister.save();

  const file = mockFiles.get(filePath);
  t.truthy(file);
  t.is(file?.exists, true);
  t.truthy(file?.content.includes('pets'));
  t.truthy(file?.content.includes('fido'));
});

test('persister loads store data from file', async (t) => {
  const store = createStore();
  const filePath = 'test-load.json';

  mockFiles.set(filePath, {
    content: JSON.stringify([{ pets: { fido: { species: 'dog' } } }, {}]),
    exists: true,
    modificationTime: Date.now(),
  });

  const persister = createExpoFileSystemPersister(store, filePath);
  await persister.load();

  t.is(store.getCell('pets', 'fido', 'species'), 'dog');
});

test('persister handles non-existent file on load', async (t) => {
  const store = createStore();
  const filePath = 'test-nonexistent.json';

  mockFiles.delete(filePath);

  const persister = createExpoFileSystemPersister(store, filePath);
  await t.notThrowsAsync(persister.load());
});

test('persister handles undefined values', async (t) => {
  const store = createStore();
  const filePath = 'test-undefined.json';

  store.setTables({ users: { alice: { name: 'Alice' } } });

  const persister = createExpoFileSystemPersister(store, filePath);
  await persister.save();

  const newStore = createStore();
  const newPersister = createExpoFileSystemPersister(newStore, filePath);
  await newPersister.load();

  t.is(newStore.getCell('users', 'alice', 'name'), 'Alice');
  t.is(newStore.getCell('users', 'alice', 'age'), undefined);
});

test('persister autoSave persists changes automatically', async (t) => {
  const store = createStore();
  const filePath = 'test-autosave.json';

  const persister = createExpoFileSystemPersister(store, filePath);
  await persister.startAutoSave();

  store.setCell('pets', 'fido', 'species', 'dog');

  await new Promise((resolve) => setTimeout(resolve, 100));

  const file = mockFiles.get(filePath);
  t.truthy(file);
  t.truthy(file?.content.includes('fido'));

  await persister.stopAutoSave();
});
