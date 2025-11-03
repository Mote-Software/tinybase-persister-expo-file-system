module.exports = {
  branches: ['main'],
  // Run semantic-release in the package directory
  pkgRoot: 'packages/tinybase-persister-expo-file-system',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/npm',
      {
        // Publish to NPM from the package directory
        npmPublish: true,
        pkgRoot: 'packages/tinybase-persister-expo-file-system',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: [
          'packages/tinybase-persister-expo-file-system/CHANGELOG.md',
          'packages/tinybase-persister-expo-file-system/package.json',
        ],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    [
      '@semantic-release/github',
      {
        // Only include the built package files in the GitHub release
        assets: [
          {
            path: 'packages/tinybase-persister-expo-file-system/dist/**/*',
            label: 'Build artifacts',
          },
          {
            path: 'packages/tinybase-persister-expo-file-system/package.json',
            label: 'package.json',
          },
          {
            path: 'packages/tinybase-persister-expo-file-system/README.md',
            label: 'README.md',
          },
        ],
      },
    ],
  ],
};
