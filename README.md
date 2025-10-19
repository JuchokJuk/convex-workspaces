# Convex Workspaces

[![npm version](https://badge.fury.io/js/convex-workspaces.svg)](https://www.npmjs.com/package/convex-workspaces)
[![License: Unlicense](https://img.shields.io/badge/License-Unlicense-blue.svg)](https://unlicense.org/)
[![GitHub](https://img.shields.io/badge/GitHub-JuchokJuk%2Fconvex--workspaces-blue)](https://github.com/JuchokJuk/convex-workspaces)

A module that adds **multi-user collaboration** to your Convex app with workspaces, role-based access, and sharing capabilities.

## 📦 Installation

```bash
npm install convex-workspaces
```

[![NPM](https://nodei.co/npm/convex-workspaces.png)](https://www.npmjs.com/package/convex-workspaces)

## 🎯 The Problem It Solves

- You have a Convex app with users
- You want some users to collaborate on the same data/entities
- You need different permission levels (admin/editor/viewer)
- You want to share access between users

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

### Real Example

```typescript
// Create a team workspace
const teamId = await createWorkspace({ name: "Marketing Team", personal: false });

// Add users with roles
await addUserToWorkspace({ 
  workspaceId: teamId, 
  targetUserId: "user123", 
  userRole: "editor" 
});

// Now all team members can access the same data based on their role
```

## ✨ What It Provides

- 🏢 **Workspaces**: Groups where users can collaborate (like "Marketing Team" or "Project Alpha")
- 👥 **Role-based Access**: Admin can invite users, editors can modify data, viewers can only read
- 🔗 **Sharing System**: Share entities between workspaces with proper permissions
- 🏠 **Personal Workspaces**: Every user gets their own private space
- ⚡ **TypeScript**: Full type safety and ready-to-use Convex functions
- 🧪 **Testing**: Test coverage with Vitest

Think of it as **"Convex Auth + Team Collaboration"** - it extends your existing Convex app with multi-user features.

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