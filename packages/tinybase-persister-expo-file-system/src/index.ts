import * as FileSystem from 'expo-file-system';
import type { MergeableStore, Store } from 'tinybase';
import type { PersistedContent, Persister, PersisterListener } from 'tinybase/persisters';
import { Persists, createCustomPersister } from 'tinybase/persisters';

export interface ExpoFileSystemPersister extends Persister<Persists.StoreOrMergeableStore> {
  /// FilePersister.getFilePath
  getFilePath(): string;
}

// Inline JSON utilities
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

export const createExpoFileSystemPersister = (
  store: Store | MergeableStore,
  filePath: string,
  onIgnoredError?: (error: any) => void,
): ExpoFileSystemPersister => {
  const file = new FileSystem.File(filePath);

  const getPersisted = async (): Promise<PersistedContent<Persists.StoreOrMergeableStore>> => {
    try {
      const content = await file.text();
      return jsonParseWithUndefined(content);
    } catch (_error) {
      // File doesn't exist or can't be read
      return [{}, {}];
    }
  };

  const setPersisted = async (
    getContent: () => PersistedContent<Persists.StoreOrMergeableStore>,
  ): Promise<void> => {
    await file.write(jsonStringWithUndefined(getContent()));
  };

  // Expo FileSystem - use a polling approach
  let intervalId: NodeJS.Timeout | null = null;
  let lastModified: number | null = null;

  const addPersisterListener = (
    listener: PersisterListener<Persists.StoreOrMergeableStore>,
  ): NodeJS.Timeout => {
    // Ensure file exists asynchronously
    (async () => {
      try {
        if (!file.exists) {
          await file.write('');
        }
      } catch (error: any) {
        onIgnoredError?.(error);
      }
    })();

    // Poll for changes every 1 second
    intervalId = setInterval(async () => {
      try {
        const info = new FileSystem.File(filePath).info();
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

  // Since the persister object is frozen, we need to create a new object
  // that includes all the persister methods plus our custom getFilePath method
  return Object.create(Object.getPrototypeOf(persister), {
    ...Object.getOwnPropertyDescriptors(persister),
    getFilePath: {
      value: () => filePath,
      writable: true,
      enumerable: true,
      configurable: true,
    },
  }) as ExpoFileSystemPersister;
};
