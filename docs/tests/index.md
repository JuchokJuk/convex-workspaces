# Test Scenarios

## Users (`users.test.ts`)

### Get Current User
**What it tests**: Authentication works correctly, user can get their data after registration
**Why needed**: Basic system functionality - user should see their profile

### Get All Users  
**What it tests**: System can return a list of all registered users
**Why needed**: For administration and user search when sharing

### Update User
**What it tests**: User can change their data (name, email)
**Why needed**: Users should be able to update their profile

## Workspaces (`workspaces.test.ts`)

### Get Personal Workspace
**What it tests**: After registration, a personal workspace is automatically created for the user
**Why needed**: Every user should have a place for personal projects

### Create Workspace
**What it tests**: User can create additional workspaces (for teams, studies, etc.)
**Why needed**: Users should be able to organize projects by different areas of activity

### Get User Workspaces
**What it tests**: User sees all workspaces they participate in
**Why needed**: Navigation between different workspaces

## Projects (`projects.test.ts`)

### Create Project
**What it tests**: User can create a project in a workspace they have access to
**Why needed**: Core functionality - creating work projects

### Project Appears in User's Projects
**What it tests**: Created project appears in the user's project list
**Why needed**: User should see their projects for navigation

### Get User Projects
**What it tests**: System returns all projects the user has access to
**Why needed**: Display all available projects in the interface

## Sharing (`sharing.test.ts`)

### Share Project from Personal Workspace
**What it tests**: User can share a project from their personal workspace with another user
**Why needed**: Core sharing function - transferring access to personal projects

### Share Project from Team Workspace
**What it tests**: User can share a project from a team workspace with another user
**Why needed**: Important function - ability to share projects created in a team

### Role is Lowered by Least Privilege Principle
**What it tests**: When sharing, the recipient's role is limited by the sender's role in the source workspace
**Why needed**: Security - user cannot transfer more rights than they have

### Cannot Share the Same Project to the Same User Twice
**What it tests**: System prevents duplicate sharing
**Why needed**: Protection from user errors and preventing data duplication

### User B Sees Related Entities Through Project Access
**What it tests**: Sharing recipient sees the project in their project list
**Why needed**: Sharing should work - recipient should have access to the shared project

## Sharing: Visibility (`sharing.visibility.test.ts`)

### Recipient Sees Shared Project in Their Project Selection
**What it tests**: Shared project appears in the recipient's project list
**Why needed**: Confirmation that sharing works and recipient has access

## Sharing: Duplicate Prevention (`sharing.duplicates.test.ts`)

### Cannot Share the Same Project to the Same User Twice
**What it tests**: When attempting duplicate sharing, the system throws an error
**Why needed**: Protection from accidental duplicate user actions

## Sharing: Role Lowering (`sharing.roleLowering.test.ts`)

### Viewer in Source Workspace Limits Recipient Role to Viewer
**What it tests**: If sender has `viewer` role in workspace, recipient cannot get role higher than `viewer`
**Why needed**: Critically important for security - adherence to least privilege principle
