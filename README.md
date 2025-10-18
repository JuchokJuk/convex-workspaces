# Convex Workspaces

[![npm version](https://badge.fury.io/js/convex-workspaces.svg)](https://badge.fury.io/js/convex-workspaces)
[![License: Unlicense](https://img.shields.io/badge/License-Unlicense-blue.svg)](https://unlicense.org/)

Ready-to-use Convex module with project sharing and team collaboration features.

## 🚀 Quick Start

### Installation

```bash
npm install convex-workspaces
```

### Usage

```typescript
import { convexWorkspaces, initializePersonalWorkspace } from "convex-workspaces";

// In convex/workspaces.ts
export const {
  createWorkspace,
  addUserToWorkspace,
  createProject,
  shareProject,
  getPersonalWorkspace,
  getUserWorkspaces,
  // ... and other functions
} = convexWorkspaces({
  callbacks: {
    onWorkspaceDelete: async (ctx, workspaceId) => {
      // Your cascade deletion logic
    },
    onProjectDelete: async (ctx, projectId) => {
      // Your cascade deletion logic
    },
  },
});
```

## 📚 Documentation

- [Guide](https://yourusername.github.io/convex-workspaces/guide/) - usage guide
- [Reference](https://yourusername.github.io/convex-workspaces/reference/) - API reference
- [Tests](https://yourusername.github.io/convex-workspaces/tests/) - test scenarios

## ✨ Features

- 🏢 **Structured Workspaces** - personal and team workspaces
- 👥 **Role System** - admin/editor/viewer with automatic access control
- 🔗 **Project Sharing** - secure sharing with least privilege principle
- 🛡️ **Security** - built-in data protection and validation
- ⚡ **TypeScript** - full type safety and ready-to-use Convex functions
- 🧪 **Testing** - complete test coverage with Vitest

## 📄 License

Unlicense - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

We welcome contributions to the project! Please check out our [contributing guide](CONTRIBUTING.md).

## 📞 Support

If you have questions or issues, create an [issue](https://github.com/yourusername/convex-workspaces/issues) or refer to the [documentation](https://yourusername.github.io/convex-workspaces/).