# Convex Workspaces

[NPM Package](https://www.npmjs.com/package/convex-workspaces)

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

## Architecture

### Core Concepts

**Entities** are the foundation of the workspace system. They act as containers that can hold any type of data from your application - documents, tasks, projects, or any other sharable content. Entities don't contain the actual data themselves, but rather serve as access control points that determine who can view or modify the data attached to them.

**Workspaces** are collaborative spaces where users work together. Each workspace has members with specific roles (admin, editor, viewer) that determine their permissions within that workspace. Workspaces can be either:
- **Team workspaces**: Shared spaces for collaboration
- **Personal workspaces**: Private spaces automatically created for each user

**Cross-Workspace Sharing** enables direct data sharing between users. When you share an entity from one workspace to another, users in the target workspace gain access to all data attached to that entity. This is essential for sharing data directly with specific users - you can share to their personal workspace or to any team workspace they belong to.

### Data Flow

1. **Create Entity**: When you create sharable content, it gets attached to an entity within a workspace
2. **Access Control**: The entity's workspace membership determines who can access the data
3. **Sharing**: Entities can be shared to other workspaces, enabling direct data sharing with specific users
4. **Permission Inheritance**: Users get the minimum access level between their workspace role and the shared access level

### API Structure

The library provides two ways to interact with the workspace system:

- **Queries & Mutations**: Full Convex functions that can be called from the client or other functions
- **Raw Handlers**: Direct TypeScript functions for internal use, providing better performance and simpler debugging

This dual approach gives you flexibility - use queries/mutations for client interactions and raw handlers for internal operations.