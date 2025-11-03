# Contributors Guide

Thank you for your interest in contributing to the TinyBase Persister for Expo FileSystem!

**All issues and pull requests are welcome!** Whether you're fixing a typo, improving documentation, adding tests, or implementing new features, we appreciate your contributions. This guide will help you get set up for development.

## Prerequisites

- Node.js >= 22.14.0
- pnpm >= 9.15.9

## Quick Start

```bash
# Install all dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint
```

## Project Structure

This is a pnpm monorepo with the following structure:

```
tinybase-persister-expo-file-system/
├── packages/
│   └── tinybase-persister-expo-file-system/   # Main NPM package
│       ├── src/
│       │   ├── index.ts                        # Persister implementation
│       │   └── index.spec.ts                   # Tests
│       ├── package.json
│       ├── tsconfig.json
│       └── tsup.config.ts                      # Build configuration
├── apps/
│   └── example/                                # Expo v54 example app
│       ├── App.tsx                             # Demo with persistent counter
│       └── package.json
├── .github/workflows/release.yml               # CI/CD workflow
├── package.json                                # Root workspace config
└── pnpm-workspace.yaml                         # Workspace definition
```

## Development Workflow

### Working on the Package

```bash
# Navigate to the package directory
cd packages/tinybase-persister-expo-file-system

# Watch mode - automatically rebuilds on changes
pnpm dev

# Run tests in watch mode
pnpm test --watch

# Type checking
pnpm type
```

### Running the Example App

The example app demonstrates the persister in action with a persistent counter:

```bash
cd apps/example

# Start the Expo development server
pnpm start

# Or run on specific platforms
pnpm ios      # iOS simulator
pnpm android  # Android emulator
pnpm web      # Web browser
```

**Note:** You need to build the package first (`pnpm build` from root) before running the example app, or run `pnpm dev` in the package directory for live updates.

## Code Quality

This project uses [Biome](https://biomejs.dev/) for ultra-fast linting and formatting:

```bash
# Check for linting issues
pnpm lint

# Auto-fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Check and fix everything
pnpm check:fix
```

## Testing

Tests use [AVA](https://github.com/avajs/ava), a modern test runner:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test src/index.spec.ts
```

## Building

The package uses [tsup](https://tsup.egoist.dev/) for bundling:

```bash
# Build the package
pnpm build

# Build in watch mode
pnpm dev
```

## Publishing

This project uses [semantic-release](https://semantic-release.gitbook.io/) for automated versioning and publishing. Releases are triggered automatically when code is pushed to the `master` branch.

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/) for automatic versioning:

```bash
# Patch release (0.0.x)
git commit -m "fix: resolve issue with file polling"

# Minor release (0.x.0)
git commit -m "feat: add support for custom polling interval"

# Major release (x.0.0)
git commit -m "feat: new API design

BREAKING CHANGE: renamed createPersister to createExpoFileSystemPersister"
```

## Key Technologies

- **pnpm** - Fast, efficient package manager with workspace support
- **Biome** - Ultra-fast linter and formatter (Rust-based)
- **tsup** - Zero-config bundler powered by esbuild
- **AVA** - Modern, concurrent test runner
- **semantic-release** - Automated versioning and publishing
- **TinyBase v6** - Peer dependancy - reactive data store
- **Expo FileSystem v19** - Peer dependancy - Expo file system API
- **Expo SDK 54**

## Implementation Notes

- The persister uses polling (1 second interval) for file change detection
- The package outputs both ESM and CommonJS formats for maximum compatibility

## Contributing Your Changes

We welcome all contributions! Here's how to submit your changes:

1. **Fork the repository** and create a new branch for your changes
2. **Make your changes** following the code quality guidelines above
3. **Test your changes** thoroughly
4. **Commit using conventional commits** (see format above)
5. **Submit a pull request** with a clear description of your changes

Don't worry if you're new to open source - we're here to help! If you're unsure about anything, feel free to:
- Open an issue to discuss your idea first
- Submit a draft PR to get early feedback
- Ask questions in your PR - we're happy to guide you

## Ideas for Contributions

Not sure where to start? Here are some ideas:

- **Documentation**: Improve examples, fix typos, add use cases
- **Tests**: Expand test coverage, add edge case tests
- **Features**: Custom polling intervals, batch operations, compression
- **Examples**: New demo apps, integration patterns
- **Bug fixes**: Check open issues or report new ones

## Need Help?

- Check the [TinyBase Documentation](https://tinybase.org)
- Review the [Expo FileSystem Documentation](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- Open an issue on [GitHub](https://github.com/mote-software/tinybase-persister-expo-file-system/issues)

## License

MIT
