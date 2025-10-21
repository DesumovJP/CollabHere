# Архітектура Edit Profile - Діаграми

## 1. Загальна архітектура

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  account/page.tsx                                         │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │  │
│  │  │ Edit Button │  │ Avatar Icon │  │ Profile Dialog  │  │  │
│  │  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │  │
│  │         │                 │                   │           │  │
│  │         └─────────────────┴───────────────────┘           │  │
│  │                           │                                │  │
│  │                           v                                │  │
│  │                  ┌────────────────┐                        │  │
│  │                  │ handleSaveEdit │                        │  │
│  │                  │ handleAvatarUp │                        │  │
│  │                  └────────┬───────┘                        │  │
│  └──────────────────────────┼────────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────v────────────────────────────────┐ │
│  │  auth-provider.tsx                                         │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  updateProfile(data)                                  │ │ │
│  │  │    • Формує GraphQL mutation                         │ │ │
│  │  │    • Відправляє fetch request                        │ │ │
│  │  │    • Оновлює user state                              │ │ │
│  │  │    • Зберігає в localStorage                         │ │ │
│  │  └───────────────────┬──────────────────────────────────┘ │ │
│  └────────────────────────┼─────────────────────────────────┘ │
└─────────────────────────┼─────────────────────────────────────┘
                          │
                          │ GraphQL Request
                          │ POST /graphql
                          │
                          v
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND (Strapi)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  GraphQL Server                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  Mutation: updateMe                                  │ │  │
│  │  │    ↓                                                  │ │  │
│  │  │  ┌──────────────────────────────────────────────┐   │ │  │
│  │  │  │ graphql.ts - Custom Resolver                 │   │ │  │
│  │  │  │  1. Отримує JWT з context                    │   │ │  │
│  │  │  │  2. Витягує user.id з токену                 │   │ │  │
│  │  │  │  3. Викликає strapi.query().update()         │   │ │  │
│  │  │  │  4. Populate avatar, role                    │   │ │  │
│  │  │  │  5. Повертає оновлені дані                   │   │ │  │
│  │  │  └──────────────────┬───────────────────────────┘   │ │  │
│  │  │                     │                                 │ │  │
│  │  └─────────────────────┼─────────────────────────────────┘ │  │
│  └────────────────────────┼───────────────────────────────────┘  │
│                           │                                      │
│                           v                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Database (SQLite/PostgreSQL/MySQL)                        │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Table: up_users                                      │ │ │
│  │  │  ┌────────────────────────────────────────────────┐  │ │ │
│  │  │  │ id, username, email, slug, location,           │  │ │ │
│  │  │  │ phoneNumber, avatar (relation to upload_files) │  │ │ │
│  │  │  └────────────────────────────────────────────────┘  │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Потік даних - Edit Profile

```
User clicks "Edit Profile"
         │
         v
┌────────────────────┐
│ handleEditClick()  │  Ініціалізує форму з поточними даними
└─────────┬──────────┘
          │
          v
┌────────────────────┐
│  Dialog opens      │  Показує форму редагування
│  with form fields  │
└─────────┬──────────┘
          │
          │  User edits fields
          v
┌────────────────────┐
│ User clicks        │
│ "Save Changes"     │
└─────────┬──────────┘
          │
          v
┌─────────────────────────────────────────────┐
│ handleSaveEdit()                            │
│  • Validates form                           │
│  • Calls updateProfile({                    │
│      username, email, location, phoneNumber │
│    })                                       │
└─────────┬───────────────────────────────────┘
          │
          v
┌─────────────────────────────────────────────┐
│ updateProfile() in auth-provider.tsx        │
│  ┌────────────────────────────────────────┐ │
│  │ 1. Формує GraphQL mutation:            │ │
│  │    mutation UpdateMe($data: UsersPermissionsUserInputExtended!) { │ │
│  │      updateMe(data: $data) {           │ │
│  │        id, username, email, slug,      │ │
│  │        location, phoneNumber,          │ │
│  │        avatar { url }                  │ │
│  │      }                                 │ │
│  │    }                                   │ │
│  │                                        │ │
│  │ 2. Відправляє POST /graphql            │ │
│  │    Headers: Authorization: Bearer JWT  │ │
│  │    Body: { query, variables }          │ │
│  └────────────────────────────────────────┘ │
└─────────┬───────────────────────────────────┘
          │
          │ HTTP Request
          v
┌─────────────────────────────────────────────┐
│ Strapi GraphQL Server                       │
│  ┌────────────────────────────────────────┐ │
│  │ 1. Парсить JWT token                   │ │
│  │ 2. Витягує user.id                     │ │
│  │ 3. Викликає Mutation.updateMe resolver │ │
│  └────────────────────────────────────────┘ │
└─────────┬───────────────────────────────────┘
          │
          v
┌─────────────────────────────────────────────┐
│ updateMe resolver (graphql.ts)              │
│  ┌────────────────────────────────────────┐ │
│  │ const { id } = context.state.user;     │ │
│  │                                        │ │
│  │ const updatedUser = await             │ │
│  │   strapi.query('...user').update({    │ │
│  │     where: { id },                    │ │
│  │     data: args.data,                  │ │
│  │     populate: ['avatar', 'role']      │ │
│  │   });                                 │ │
│  │                                        │ │
│  │ return updatedUser;                   │ │
│  └────────────────────────────────────────┘ │
└─────────┬───────────────────────────────────┘
          │
          v
┌─────────────────────────────────────────────┐
│ Database Update                             │
│  UPDATE up_users                            │
│  SET username = ?, email = ?,               │
│      location = ?, phoneNumber = ?          │
│  WHERE id = ?                               │
└─────────┬───────────────────────────────────┘
          │
          │ Returns updated data
          v
┌─────────────────────────────────────────────┐
│ Response to Frontend                        │
│  {                                          │
│    data: {                                  │
│      updateMe: {                            │
│        id, username, email, slug,           │
│        location, phoneNumber,               │
│        avatar: { url }                      │
│      }                                      │
│    }                                        │
│  }                                          │
└─────────┬───────────────────────────────────┘
          │
          v
┌─────────────────────────────────────────────┐
│ updateProfile() receives response           │
│  • Updates user state: setUser(userData)    │
│  • Saves to localStorage                    │
└─────────┬───────────────────────────────────┘
          │
          v
┌─────────────────────────────────────────────┐
│ React re-renders                            │
│  • Dialog closes                            │
│  • Profile info updates automatically       │
│  • Success alert shows                      │
└─────────────────────────────────────────────┘
```

## 3. Потік даних - Avatar Upload

```
User clicks camera icon
         │
         v
┌────────────────────┐
│ File input opens   │  User selects image
└─────────┬──────────┘
          │
          v
┌─────────────────────────────────────────────┐
│ handleAvatarUpload()                        │
│  • Validates file (size, type)              │
└─────────┬───────────────────────────────────┘
          │
          v
┌─────────────────────────────────────────────┐
│ Step 1: Upload File via REST API           │
│  ┌────────────────────────────────────────┐ │
│  │ POST /api/upload                       │ │
│  │ Headers: Authorization: Bearer JWT     │ │
│  │ Body: FormData with file               │ │
│  └────────────────────────────────────────┘ │
└─────────┬───────────────────────────────────┘
          │
          │ HTTP Request
          v
┌─────────────────────────────────────────────┐
│ Strapi Upload Plugin                        │
│  • Saves file to /public/uploads/           │
│  • Creates entry in upload_files table      │
│  • Returns file data with ID                │
└─────────┬───────────────────────────────────┘
          │
          │ Response: { id: 123, url: "/uploads/..." }
          v
┌─────────────────────────────────────────────┐
│ Step 2: Update User with Avatar ID         │
│  ┌────────────────────────────────────────┐ │
│  │ await updateProfile({                  │ │
│  │   avatar: uploadedFile.id              │ │
│  │ })                                     │ │
│  └────────────────────────────────────────┘ │
└─────────┬───────────────────────────────────┘
          │
          v
┌─────────────────────────────────────────────┐
│ GraphQL Mutation updateMe                   │
│  mutation UpdateMe($data: ...) {            │
│    updateMe(data: { avatar: 123 }) {        │
│      avatar { url }                         │
│    }                                        │
│  }                                          │
└─────────┬───────────────────────────────────┘
          │
          v
┌─────────────────────────────────────────────┐
│ Database Update                             │
│  UPDATE up_users                            │
│  SET avatar = 123  (file ID)                │
│  WHERE id = current_user_id                 │
└─────────┬───────────────────────────────────┘
          │
          │ Returns with populated avatar
          v
┌─────────────────────────────────────────────┐
│ Response includes avatar data               │
│  {                                          │
│    data: {                                  │
│      updateMe: {                            │
│        avatar: {                            │
│          url: "/uploads/image.jpg"          │
│        }                                    │
│      }                                      │
│    }                                        │
│  }                                          │
└─────────┬───────────────────────────────────┘
          │
          v
┌─────────────────────────────────────────────┐
│ Frontend updates                            │
│  • setAvatar(newAvatarUrl)                  │
│  • Updates user state                       │
│  • Avatar displays immediately              │
└─────────────────────────────────────────────┘
```

## 4. GraphQL Schema Extension

```
┌────────────────────────────────────────────────────────────┐
│  Original Strapi GraphQL Schema                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  type UsersPermissionsMe {                           │  │
│  │    id: ID!                                           │  │
│  │    username: String!                                 │  │
│  │    email: String                                     │  │
│  │    ❌ slug: NOT INCLUDED                             │  │
│  │    ❌ location: NOT INCLUDED                         │  │
│  │    ❌ phoneNumber: NOT INCLUDED                      │  │
│  │    ❌ avatar: NOT INCLUDED                           │  │
│  │  }                                                   │  │
│  │                                                      │  │
│  │  input UsersPermissionsUserInput {                   │  │
│  │    username: String                                  │  │
│  │    email: String                                     │  │
│  │    password: String                                  │  │
│  │    ❌ slug: NOT INCLUDED                             │  │
│  │    ❌ location: NOT INCLUDED                         │  │
│  │    ❌ phoneNumber: NOT INCLUDED                      │  │
│  │    ❌ avatar: NOT INCLUDED                           │  │
│  │  }                                                   │  │
│  │                                                      │  │
│  │  type Mutation {                                     │  │
│  │    updateUsersPermissionsUser(                       │  │
│  │      id: ID!,  ⚠️ REQUIRES ID                        │  │
│  │      data: UsersPermissionsUserInput!                │  │
│  │    ): UsersPermissionsUserEntityResponse             │  │
│  │  }                                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                           │
                           │ EXTENDED BY
                           v
┌────────────────────────────────────────────────────────────┐
│  Custom GraphQL Extension (graphql.ts)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  extend type UsersPermissionsMe {                    │  │
│  │    ✅ slug: String                                   │  │
│  │    ✅ location: String                               │  │
│  │    ✅ phoneNumber: Long                              │  │
│  │    ✅ avatar: UploadFileEntityResponse               │  │
│  │  }                                                   │  │
│  │                                                      │  │
│  │  input UsersPermissionsUserInputExtended {           │  │
│  │    username: String                                  │  │
│  │    email: String                                     │  │
│  │    password: String                                  │  │
│  │    ✅ slug: String                                   │  │
│  │    ✅ location: String                               │  │
│  │    ✅ phoneNumber: Long                              │  │
│  │    ✅ avatar: ID                                     │  │
│  │  }                                                   │  │
│  │                                                      │  │
│  │  type Mutation {                                     │  │
│  │    ✅ updateMe(                                      │  │
│  │      data: UsersPermissionsUserInputExtended!        │  │
│  │      ✅ NO ID REQUIRED! Uses JWT                     │  │
│  │    ): UsersPermissionsMe!                            │  │
│  │  }                                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## 5. Файлова структура

```
project/
├── backend/
│   ├── src/
│   │   └── extensions/
│   │       └── users-permissions/
│   │           ├── graphql.ts              ⭐ NEW - GraphQL extension
│   │           ├── strapi-server.ts        ⭐ NEW - REST API extension
│   │           └── content-types/
│   │               └── user/
│   │                   └── schema.json     ✓ Has custom fields
│   └── config/
│       └── plugins.ts                      ✏️ MODIFIED - Config
│
└── frontend/
    └── src/
        ├── providers/
        │   └── auth-provider.tsx           ✏️ MODIFIED - updateProfile
        └── app/
            └── account/
                └── page.tsx                ✏️ MODIFIED - UI + handlers
```

## 6. JWT Token Flow

```
┌─────────────────────────────────────────────────────────────┐
│  User Login                                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  1. POST /api/auth/local                              │  │
│  │     Body: { identifier, password }                    │  │
│  │                                                        │  │
│  │  2. Strapi validates credentials                      │  │
│  │                                                        │  │
│  │  3. Strapi generates JWT token:                       │  │
│  │     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...           │  │
│  │     Payload: { id: 123, ... }                         │  │
│  │                                                        │  │
│  │  4. Returns: { jwt: "...", user: {...} }              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Saved to localStorage
                           v
┌─────────────────────────────────────────────────────────────┐
│  Frontend: localStorage.setItem('auth.jwt', token)          │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Used in every request
                           v
┌─────────────────────────────────────────────────────────────┐
│  GraphQL Request                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  POST /graphql                                        │  │
│  │  Headers: {                                           │  │
│  │    "Authorization": "Bearer eyJhbGc..."              │  │
│  │  }                                                    │  │
│  │  Body: { query, variables }                          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           v
┌─────────────────────────────────────────────────────────────┐
│  Strapi Middleware                                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  1. Extracts JWT from Authorization header           │  │
│  │  2. Verifies JWT signature                           │  │
│  │  3. Decodes payload: { id: 123 }                     │  │
│  │  4. Sets context.state.user = { id: 123, ... }       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           v
┌─────────────────────────────────────────────────────────────┐
│  GraphQL Resolver (graphql.ts)                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  const { id } = context.state.user;  // id = 123     │  │
│  │                                                       │  │
│  │  // Now we know WHO is making the request            │  │
│  │  // Can update ONLY their own profile                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Висновок

Ця архітектура забезпечує:
- ✅ **Безпека:** JWT token автоматично визначає користувача
- ✅ **Простота:** Не потрібно передавати ID в запитах
- ✅ **Розширюваність:** Легко додати нові поля через GraphQL extension
- ✅ **Надійність:** Типізація через TypeScript + GraphQL schema
- ✅ **Модульність:** Чітке розділення між frontend і backend логікою

