# TinyBase Persister for Expo FileSystem

A [TinyBase](https://tinybase.org) persister that uses [Expo FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/) for persistent storage in React Native Expo apps.

<p align="center">
  <img src="https://raw.githubusercontent.com/Mote-Software/tinybase-persister-expo-file-system/main/visual.png" alt="TinyBase + Expo FileSystem Demo" width="300">
</p>

## Features

- Persists TinyBase stores to the device filesystem using [Expo FileSystem API (v54)](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- Auto-save and auto-load capabilities for seamless data synchronization
- Full TypeScript support with complete type definitions
- Compatible with both `Store` and `MergeableStore`
- Built on TinyBase v6+ with zero additional runtime dependencies
- Automatic file change polling for multi-instance synchronization

## What is Persistence?

TinyBase Stores exist only in memory by default. Persisters solve this by enabling you to save and load your Store data to various storage backends. This is essential for:

- Maintaining application state across app restarts and device reboots
- Preserving user data between sessions
- Creating offline-first mobile applications
- Synchronizing data with external storage

Learn more about [TinyBase persistence](https://tinybase.org/guides/persistence/an-intro-to-persistence/).

## Usage

> Assumes your Expo app already has Tinybase installed.

```bash
# npm
npm install @mote-software/tinybase-persister-expo-file-system

# pnpm
pnpm add @mote-software/tinybase-persister-expo-file-system

# yarn
yarn add @mote-software/tinybase-persister-expo-file-system
```

### Peer Dependencies

This package requires:
- `tinybase` ^6.0.0
- `expo-file-system` ^19.0.17

## Usage

```typescript
import { createStore } from 'tinybase';
import { createExpoFileSystemPersister } from '@mote-software/tinybase-persister-expo-file-system';
import * as FileSystem from 'expo-file-system';

// Create a TinyBase store
const store = createStore();

// Define the file path (using Expo FileSystem v19+ API)
const filePath = `${new FileSystem.Directory(FileSystem.Paths.document).uri}/my-store.json`;

// Create the persister
const persister = createExpoFileSystemPersister(
  store,
  filePath,
  (error) => {
    console.error('Persister error:', error);
  }
);

// Load existing data and start auto-saving
await persister.startAutoLoad();
await persister.startAutoSave();

// Now your store is automatically persisted!
store.setCell('pets', 'fido', 'species', 'dog');
// This change is automatically saved to the file system
```

## API Reference

### `createExpoFileSystemPersister`

Creates a new persister instance that uses Expo FileSystem for storage.

```typescript
function createExpoFileSystemPersister(
  store: Store | MergeableStore,
  filePath: string,
  onIgnoredError?: (error: any) => void
): ExpoFileSystemPersister
```

**Parameters:**
- `store` - The TinyBase Store or MergeableStore to persist
- `filePath` - Absolute path to the file (e.g., `` `${new FileSystem.Directory(FileSystem.Paths.document).uri}/store.json` ``)
- `onIgnoredError` - Optional callback for handling non-critical errors

**Returns:** An `ExpoFileSystemPersister` instance with all standard [TinyBase Persister methods](https://tinybase.org/api/persisters/interfaces/persister/persister/).

### `ExpoFileSystemPersister`

Extends the standard TinyBase `Persister` interface with an additional method:

#### `getFilePath()`

Returns the file path used by this persister.

```typescript
const filePath = persister.getFilePath();
```

## Common Methods

All standard TinyBase Persister methods are available:

```typescript
// Manual operations
await persister.save();    // Manually save store to file
await persister.load();    // Manually load store from file

// Automatic synchronization
await persister.startAutoSave();  // Auto-save on store changes
await persister.startAutoLoad();  // Auto-load on file changes
await persister.stopAutoSave();
await persister.stopAutoLoad();

// Status
const stats = persister.getStats();  // Get persistence statistics
```

## File Change Detection

This persister uses a polling mechanism (checking every 1 second) to detect external file changes when `startAutoLoad()` is active. This enables synchronization between multiple app instances or external file modifications.

## Example Project

Check out the complete example app in the [apps/example](./apps/example) directory of this repository for a working demonstration with a persistent counter.

## Contributing

See [CONTRIBUTORS.md](./CONTRIBUTORS.md) for development setup, building, testing, and contribution guidelines.

## Resources

- [TinyBase Documentation](https://tinybase.org)
- [TinyBase Persistence Guide](https://tinybase.org/guides/persistence/an-intro-to-persistence/)
- [Expo FileSystem Documentation (v54)](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- [GitHub Repository](https://github.com/mote-software/tinybase-persister-expo-file-system)

## License

MIT
