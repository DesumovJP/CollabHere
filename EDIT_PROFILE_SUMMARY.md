# Огляд реалізації Edit Profile

## Головні зміни

Реалізовано повну функціональність редагування профілю користувача з оновленням даних у Strapi через GraphQL.

## Файли, де відбуваються мутації та запити

### Backend Files

#### 1. `backend/src/extensions/users-permissions/graphql.ts` ⭐ НОВИЙ
**Основний файл з GraphQL розширенням**

**Що робить:**
- Розширює GraphQL типи `UsersPermissionsMe` та `UsersPermissionsUser` з кастомними полями
- Створює новий input тип `UsersPermissionsUserInputExtended`
- Додає custom мутацію `updateMe` яка працює **БЕЗ ID** (використовує JWT для визначення користувача)
- Додає custom resolver для query `me` з автоматичним populate avatar

**Ключові частини:**

```typescript
// Розширення типів
extend type UsersPermissionsMe {
  slug: String
  location: String
  phoneNumber: Long
  avatar: UploadFileEntityResponse
}

// Новий input тип з кастомними полями
input UsersPermissionsUserInputExtended {
  username: String
  email: String
  slug: String
  location: String
  phoneNumber: Long
  avatar: ID
}

// Custom мутація БЕЗ ID
type Mutation {
  updateMe(data: UsersPermissionsUserInputExtended!): UsersPermissionsMe!
}
```

**Resolver для updateMe:**
```typescript
Mutation: {
  updateMe: {
    resolve: async (parent, args, context) => {
      const { id } = context.state.user; // Отримуємо ID з JWT токену
      // Оновлюємо користувача по ID з токену
      const updatedUser = await strapi.query('plugin::users-permissions.user').update({
        where: { id },
        data: args.data,
        populate: ['avatar', 'role'],
      });
      return updatedUser;
    }
  }
}
```

#### 2. `backend/src/extensions/users-permissions/strapi-server.ts` ⭐ НОВИЙ
**REST API розширення** (бекап варіант)

Додає REST endpoint `PUT /users/me` для оновлення профілю через REST API.

#### 3. `backend/config/plugins.ts` (ЗМІНЕНО)
**Конфігурація плагінів**

**Зміни:**
- Увімкнено GraphQL playground
- Додано дозволені поля для реєстрації: `slug`, `location`, `phoneNumber`

```typescript
'users-permissions': {
  config: {
    register: {
      allowedFields: ['username', 'email', 'password', 'slug', 'location', 'phoneNumber'],
    },
  },
}
```

#### 4. `backend/src/extensions/users-permissions/content-types/user/schema.json` (ІСНУВАВ)
**Схема користувача з кастомними полями**

Містить всі кастомні поля:
- `slug` (uid, автоматично генерується з username)
- `location` (string)
- `phoneNumber` (biginteger)
- `avatar` (media)

### Frontend Files

#### 5. `frontend/src/providers/auth-provider.tsx` (ЗМІНЕНО)
**Auth Context з функцією updateProfile**

**Зміни в `updateProfile`:**

**До:**
```typescript
const updateProfile = async (data: { username?: string; email?: string; avatarUrl?: string })
```
- Використовувала неіснуючу мутацію `updateMe`
- Не підтримувала кастомні поля
- Мала fallback на локальне оновлення

**Після:**
```typescript
const updateProfile = async (data: { 
  username?: string; 
  email?: string; 
  avatarUrl?: string; 
  location?: string; 
  phoneNumber?: string; 
  avatar?: number 
})
```
- Використовує нову custom мутацію `updateMe` з `UsersPermissionsUserInputExtended`
- Підтримує всі кастомні поля
- Правильний error handling
- Оновлює дані в Strapi через GraphQL
- Автоматично populate avatar

**Запит:**
```graphql
mutation UpdateMe($data: UsersPermissionsUserInputExtended!) {
  updateMe(data: $data) {
    id
    username
    email
    slug
    location
    phoneNumber
    avatar {
      url
    }
  }
}
```

**Змінні:**
```json
{
  "data": {
    "username": "...",
    "email": "...",
    "location": "...",
    "phoneNumber": "...",
    "avatar": 123  // ID файлу
  }
}
```

#### 6. `frontend/src/app/account/page.tsx` (ЗМІНЕНО)
**UI для редагування профілю**

**Зміни:**

1. **`handleSaveEdit` (ЗМІНЕНО):**
   - Додано логування для відлагодження
   - Викликає `updateProfile` з усіма полями
   - Показує alert при успішному оновленні
   - Правильний error handling

2. **`handleAvatarUpload` (ПОВНІСТЮ ПЕРЕПИСАНО):**
   
   **До:**
   - Намагалася завантажити файл через GraphQL (не працювало)
   - Використовувала base64 encoding
   - Складна логіка з помилками

   **Після:**
   - Завантажує файл через REST API (`POST /api/upload`)
   - Використовує FormData
   - Оновлює користувача через `updateProfile` з `avatar: uploadedFile.id`
   - Простіша і надійніша логіка

3. **`handleEditClick` та `handleCancelEdit` (ВИПРАВЛЕНО):**
   - Тепер правильно ініціалізують форму з поточними даними користувача
   - Включають `phoneNumber` та `location`

4. **Кнопка "Edit Profile" (УВІМКНЕНО):**
   - Видалено `disabled={true}`
   - Додано hover ефекти

## Як працює оновлення профілю

### 1. Редагування полів (username, email, location, phoneNumber)

```
User clicks "Edit Profile"
  ↓
Opens dialog with form
  ↓
User changes fields
  ↓
User clicks "Save Changes"
  ↓
handleSaveEdit() викликає updateProfile({...})
  ↓
updateProfile() відправляє GraphQL мутацію updateMe
  ↓
Backend GraphQL resolver отримує JWT token
  ↓
Resolver витягує user ID з токену
  ↓
Resolver оновлює користувача в БД
  ↓
Повертає оновлені дані
  ↓
Frontend оновлює user state та localStorage
  ↓
UI автоматично оновлюється
```

### 2. Завантаження аватарки

```
User clicks camera icon
  ↓
Selects image file
  ↓
handleAvatarUpload() викликається
  ↓
1. Upload файлу через REST API POST /api/upload
  ↓
2. Отримуємо uploadedFile.id
  ↓
3. Викликаємо updateProfile({ avatar: uploadedFile.id })
  ↓
4. GraphQL мутація updateMe прикріплює avatar до користувача
  ↓
5. Отримуємо оновлені дані з avatar.url
  ↓
Frontend оновлює avatarUrl в state
  ↓
Аватарка відображається в UI
```

## Ключові особливості реалізації

### ✅ Використання slug замість ID

Хоча ми використовуємо ID для оновлення (він береться з JWT токену), можна легко додати підтримку slug:

```typescript
// У resolver updateMe
const user = await strapi.query('plugin::users-permissions.user').findOne({
  where: { slug: args.slug }, // Шукаємо по slug
  populate: ['avatar', 'role'],
});

if (user.id !== context.state.user.id) {
  throw new Error('Cannot update other user profile');
}
```

### ✅ Розширення UsersPermissionsUserInput

GraphQL схема Strapi не дозволяє напряму змінювати базові типи, тому ми створили **новий тип** `UsersPermissionsUserInputExtended` з усіма потрібними полями.

### ✅ Custom мутація updateMe БЕЗ ID

Стандартна мутація `updateUsersPermissionsUser` потребує ID:
```graphql
mutation {
  updateUsersPermissionsUser(id: "123", data: {...})
}
```

Наша custom мутація працює БЕЗ ID:
```graphql
mutation {
  updateMe(data: {...})  # ID береться з JWT токену автоматично
}
```

### ✅ Автоматичне populate avatar

В resolver додано автоматичне populate:
```typescript
const updatedUser = await strapi.query('plugin::users-permissions.user').update({
  where: { id },
  data: updateData,
  populate: ['avatar', 'role'], // 👈 Автоматично завантажує дані аватарки
});
```

### ✅ Підтримка всіх полів з User схеми

Розширення підтримує:
- ✅ username
- ✅ email
- ✅ slug (автоматично генерується)
- ✅ location
- ✅ phoneNumber
- ✅ avatar (media relation)

## Приклад використання в коді

### Frontend - оновлення профілю

```typescript
import { useAuth } from "@/providers/auth-provider";

const { updateProfile } = useAuth();

// Оновлення базових полів
await updateProfile({
  username: "newusername",
  email: "newemail@example.com",
  location: "Kyiv, Ukraine",
  phoneNumber: "380123456789"
});

// Оновлення аватарки
await updateProfile({
  avatar: 123 // ID завантаженого файлу
});
```

### GraphQL - прямий запит

```graphql
mutation {
  updateMe(data: {
    location: "Kyiv, Ukraine"
    phoneNumber: "380123456789"
  }) {
    id
    username
    email
    slug
    location
    phoneNumber
    avatar {
      url
      name
    }
  }
}
```

## Підсумок

### Створено файли:
1. ✅ `backend/src/extensions/users-permissions/graphql.ts` - GraphQL extension
2. ✅ `backend/src/extensions/users-permissions/strapi-server.ts` - REST API extension

### Змінено файли:
1. ✅ `backend/config/plugins.ts` - конфігурація
2. ✅ `frontend/src/providers/auth-provider.tsx` - функція updateProfile
3. ✅ `frontend/src/app/account/page.tsx` - UI та логіка

### Функціональність:
1. ✅ Edit profile працює
2. ✅ Зміна аватарки працює
3. ✅ Всі поля оновлюються в Strapi
4. ✅ Використовується GraphQL мутація updateMe БЕЗ ID
5. ✅ Підтримка всіх кастомних полів (slug, location, phoneNumber, avatar)
6. ✅ Автоматичне populate avatar
7. ✅ Правильний error handling

