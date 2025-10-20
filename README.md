# Convex Workspaces

[NPM Package](https://www.npmjs.com/package/convex-workspaces) | [Documentation](https://convex-workspaces.vercel.app)

A module that adds **multi-user collaboration** to your Convex app with workspaces, role-based access, and sharing capabilities.

## Installation

```bash
pnpm i convex-workspaces
```

## The Problem It Solves

- You have a Convex app with users
- You want some users to collaborate on the same data/entities
- You need different permission levels (admin/editor/viewer)
- You want to share access between users



## What It Provides

- **Workspaces**: Groups where users can collaborate (like "Marketing Team" or "Project Alpha")
- **Role-based Access**: Admin can invite users, editors can modify data, viewers can only read
- **Sharing System**: Share entities between workspaces with proper permissions
- **Personal Workspaces**: Every user gets their own private space

Think of it as **"Convex Auth + Team Collaboration"** - it extends your existing Convex app with multi-user features.