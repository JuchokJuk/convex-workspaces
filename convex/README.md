# Convex Workspaces Example App

Это example приложение демонстрирует использование модуля `convex-workspaces` для создания системы совместной работы с документами и задачами.

## Архитектура

### Основные сущности:
- **Users** - пользователи системы (используется convex-auth)
- **Workspaces** - рабочие пространства (команды)
- **Entities** - абстрактные сущности для привязки бизнес-объектов
- **Documents** - документы, которые можно шерить между воркспейсами
- **Tasks** - задачи, которые доступны только членам воркспейса

### Бизнес-логика:
1. **Документы** привязаны к entities и могут быть расшарены между воркспейсами
2. **Задачи** привязаны к entities, но доступны только членам исходного воркспейса
3. **Entities** служат прослойкой между воркспейсами и бизнес-объектами

## API

### Документы
- `createDocumentWithEntity` - создать документ с entity в воркспейсе
- `createDocument` - создать документ для существующей entity
- `updateDocument` - обновить документ
- `removeDocument` - удалить документ
- `shareDocument` - расшарить документ в другой воркспейс
- `shareDocumentWithUser` - расшарить документ конкретному пользователю
- `getDocumentById` - получить документ по ID
- `getDocumentsByEntity` - получить все документы entity
- `getUserAccessibleDocuments` - получить все доступные пользователю документы

### Задачи
- `createTaskWithEntity` - создать задачу с entity в воркспейсе
- `createTask` - создать задачу для существующей entity
- `updateTask` - обновить задачу
- `removeTask` - удалить задачу
- `getTaskById` - получить задачу по ID
- `getTasksByEntity` - получить все задачи entity
- `getUserAccessibleTasks` - получить все доступные пользователю задачи

### Воркспейсы (из convex-workspaces)
- `createWorkspace` - создать воркспейс
- `getUserWorkspaces` - получить воркспейсы пользователя
- `createMembership` - добавить пользователя в воркспейс
- `removeUserFromWorkspace` - удалить пользователя из воркспейса

## Примеры использования

### Создание документа в воркспейсе:
```typescript
const { entityId, documentId } = await ctx.runAction(api.documents.createDocumentWithEntity, {
  workspaceId: "workspace123",
  title: "Мой документ"
});
```

### Шеринг документа пользователю:
```typescript
await ctx.runAction(api.documents.shareDocumentWithUser, {
  documentId: "document123",
  targetUserId: "user456",
  accessLevel: "editor"
});
```

### Создание задачи в воркспейсе:
```typescript
const { entityId, taskId } = await ctx.runAction(api.tasks.createTaskWithEntity, {
  workspaceId: "workspace123",
  title: "Новая задача"
});
```

## Особенности

1. **Автоматическая очистка**: При удалении воркспейса или entity автоматически удаляются связанные документы и задачи
2. **Контроль доступа**: Все операции проверяют права пользователя через convex-workspaces
3. **Шеринг документов**: Документы можно расшаривать между воркспейсами с разными уровнями доступа
4. **Изоляция задач**: Задачи доступны только членам исходного воркспейса

