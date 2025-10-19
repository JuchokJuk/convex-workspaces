# Convex Workspaces

[![npm version](https://badge.fury.io/js/convex-workspaces.svg)](https://www.npmjs.com/package/convex-workspaces)
[![License: Unlicense](https://img.shields.io/badge/License-Unlicense-blue.svg)](https://unlicense.org/)
[![GitHub](https://img.shields.io/badge/GitHub-JuchokJuk%2Fconvex--workspaces-blue)](https://github.com/JuchokJuk/convex-workspaces)

Ready-to-use Convex module with project sharing and team collaboration features.

## 📦 Installation

```bash
npm install convex-workspaces
```

[![NPM](https://nodei.co/npm/convex-workspaces.png)](https://www.npmjs.com/package/convex-workspaces)

## 🚀 Quick Start

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

## ✨ Features

- 🏢 **Structured Workspaces** - personal and team workspaces
- 👥 **Role System** - admin/editor/viewer with automatic access control
- 🔗 **Project Sharing** - secure sharing with least privilege principle
- 🛡️ **Security** - built-in data protection and validation
- ⚡ **TypeScript** - full type safety and ready-to-use Convex functions
- 🧪 **Testing** - complete test coverage with Vitest

## 📚 Documentation

- [Guide](https://convex-workspaces.vercel.app/guide/) - usage guide
- [Reference](https://convex-workspaces.vercel.app/reference/) - API reference
- [Tests](https://convex-workspaces.vercel.app/tests/) - test scenarios

## 🔗 Links

- **NPM Package**: [convex-workspaces](https://www.npmjs.com/package/convex-workspaces)
- **GitHub Repository**: [JuchokJuk/convex-workspaces](https://github.com/JuchokJuk/convex-workspaces)
- **Documentation**: [convex-workspaces.vercel.app](https://convex-workspaces.vercel.app)

## 📄 License

Unlicense - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

We welcome contributions to the project! Please check out our [contributing guide](CONTRIBUTING.md).

## 📞 Support

If you have questions or issues, create an [issue](https://github.com/JuchokJuk/convex-workspaces/issues) or refer to the [documentation](https://convex-workspaces.vercel.app/).