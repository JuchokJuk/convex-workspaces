# Publishing convex-workspaces Package

## Pre-publication Setup

### 1. Update package.json Information

Replace placeholders with real data:

```json
{
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/convex-workspaces.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/convex-workspaces/issues"
  },
  "homepage": "https://github.com/yourusername/convex-workspaces#readme"
}
```

### 2. Update README.md

Replace documentation links with real URLs from your repository.

### 3. Test Build

```bash
npm run build
npm run test
```

### 4. Check Package Contents

```bash
npm pack --dry-run
```

## Publishing

### 1. Login to npm

```bash
npm login
```

### 2. Publish Package

```bash
npm publish
```

### 3. Verify Publication

```bash
npm view convex-workspaces
```

## Version Updates

### 1. Update Version

```bash
npm version patch  # for bug fixes
npm version minor  # for new features
npm version major  # for breaking changes
```

### 2. Publish Update

```bash
npm publish
```

## Package Structure

```
convex-workspaces/
├── dist/                    # Compiled files
│   ├── index.js            # Main file
│   ├── index.d.ts          # TypeScript types
│   ├── convexWorkspaces.js # Main function
│   ├── utils/              # Utilities
│   ├── workspaces/         # Workspaces
│   └── projects/           # Projects
├── README.md               # Documentation
├── LICENSE                 # License
└── package.json           # Package metadata
```

## Package Usage

After publication, users can install the package:

```bash
npm install convex-workspaces
```

And use it:

```typescript
import { convexWorkspaces, initializePersonalWorkspace } from "convex-workspaces";
```
