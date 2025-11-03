import { createExpoFileSystemPersister } from '@mote-software/tinybase-persister-expo-file-system';
import * as FileSystem from 'expo-file-system';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { type Store, createStore } from 'tinybase';

export default function App() {
  const [count, setCount] = useState(0);
  const [persisterStatus, setPersisterStatus] = useState('Not initialized');

  // Keep a ref to the store so it's accessible in callbacks
  const storeRef = useRef<Store | null>(null);

  useEffect(() => {
    const initStore = async () => {
      try {
        const store = createStore();
        storeRef.current = store;

        // Expo file path
        const filePath = `${new FileSystem.Directory(FileSystem.Paths.document).uri}/tinybase-store.json`;

        // Create the persister
        const persister = createExpoFileSystemPersister(store, filePath, (error) => {
          console.error('Persister error:', error);
        });

        // Load any existing data (before auto-save)
        await persister.startAutoLoad();
        await persister.startAutoSave();

        // Initialize if empty
        const initialCount = (store.getCell('data', 'app', 'count') as number) ?? 0;
        if (!store.hasTable('data')) {
          store.setCell('data', 'app', 'count', 0);
        }

        setCount(initialCount);

        // Listen to changes
        store.addCellListener(
          'data',
          'app',
          'count',
          (_store, _tableId, _rowId, _cellId, newCell) => {
            setCount(newCell as number);
          },
        );

        setPersisterStatus(`✓ Persister ready (${filePath})`);
      } catch (error) {
        console.error(error);
      }
    };

    initStore();
  }, []);

  // ✅ Increment handler using storeRef
  const handleIncrement = useCallback(() => {
    const store = storeRef.current;
    if (!store) return;
    const currentCount = (store.getCell('data', 'app', 'count') as number) || 0;
    store.setCell('data', 'app', 'count', currentCount + 1);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TinyBase + Expo FileSystem</Text>
      <Text style={styles.status}>{persisterStatus}</Text>
      <View style={styles.counterContainer}>
        <Text style={styles.counter}>{count}</Text>
        <Button title="Increment" onPress={handleIncrement} />
      </View>
      <Text style={styles.instructions}>
        The counter is persisted to the device filesystem.{'\n'}
        Try closing and reopening the app!
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
  counterContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  counter: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
  },
  instructions: {
    textAlign: 'center',
    color: '#666',
    marginTop: 30,
  },
});
