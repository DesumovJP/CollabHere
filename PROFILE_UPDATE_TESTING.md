# Тестування оновлення профілю користувача

## Що було зроблено

### Backend (Strapi)

1. **Створено GraphQL extension** (`backend/src/extensions/users-permissions/graphql.ts`):
   - Розширено типи `UsersPermissionsMe` та `UsersPermissionsUser` з кастомними полями:
     - `slug: String`
     - `location: String`
     - `phoneNumber: Long`
     - `avatar: UploadFileEntityResponse`
   - Створено новий input тип `UsersPermissionsUserInputExtended` з кастомними полями
   - Додано custom resolver для мутації `updateMe` яка працює без ID (використовує JWT token)
   - Додано custom resolver для query `me` з populate avatar

2. **Створено Strapi server extension** (`backend/src/extensions/users-permissions/strapi-server.ts`):
   - Додано REST API endpoint `PUT /users/me` для оновлення профілю

3. **Оновлено конфігурацію плагінів** (`backend/config/plugins.ts`):
   - Додано дозволені поля для реєстрації: `slug`, `location`, `phoneNumber`
   - Увімкнено GraphQL playground

### Frontend

1. **Оновлено `auth-provider.tsx`**:
   - Перероблено функцію `updateProfile` для використання нової мутації `updateMe`
   - Додано підтримку всіх кастомних полів
   - Додано proper error handling

2. **Оновлено `account/page.tsx`**:
   - Виправлено функцію `handleSaveEdit` для правильного збереження даних
   - Перероблено функцію `handleAvatarUpload` для використання REST API upload + GraphQL updateMe
   - Увімкнено кнопку "Edit Profile"
   - Виправлено ініціалізацію форми з поточними даними користувача

## Як тестувати

### 1. Перезапустити Strapi (якщо потрібно)

```bash
cd backend
yarn develop
```

### 2. Перезапустити Frontend (якщо потрібно)

```bash
cd frontend
yarn dev
```

### 3. Тестування через UI

1. Відкрийте `http://localhost:3000/account`
2. Натисніть кнопку "Edit Profile"
3. Змініть дані:
   - Username
   - Email
   - Phone Number
   - Location
4. Натисніть "Save Changes"
5. Перевірте чи дані збереглися в Strapi Admin Panel: `http://localhost:1337/admin/content-manager/collection-types/plugin::users-permissions.user`

### 4. Тестування зміни аватарки

1. Відкрийте `http://localhost:3000/account`
2. Натисніть на іконку камери на аватарці
3. Виберіть зображення (максимум 5MB)
4. Перевірте чи аватарка оновилась
5. Перевірте в Strapi Admin Panel чи файл прикріпився до користувача

### 5. Тестування через GraphQL Playground

Відкрийте `http://localhost:1337/graphql`

#### Query: Отримати поточного користувача з аватаркою

```graphql
query {
  me {
    id
    username
    email
    slug
    location
    phoneNumber
    avatar {
      url
      name
      size
    }
  }
}
```

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

#### Mutation: Оновити профіль

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
  }
}
```

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

#### Mutation: Оновити username та email

```graphql
mutation {
  updateMe(data: {
    username: "newusername"
    email: "newemail@example.com"
  }) {
    id
    username
    email
    slug
    location
    phoneNumber
  }
}
```

### 6. Перевірка в консолі браузера

Відкрийте Developer Tools → Console і перевірте логи:

- `🔄 Updating profile via GraphQL:` - початок оновлення
- `✅ GraphQL update response:` - відповідь від сервера
- `✅ Profile updated successfully via GraphQL:` - успішне оновлення
- `❌ GraphQL update errors:` - помилки (якщо є)

## Очікувані результати

1. ✅ Дані користувача оновлюються в Strapi
2. ✅ Зміни відображаються в UI без перезавантаження сторінки
3. ✅ Аватарка завантажується і прикріплюється до користувача
4. ✅ Всі поля (username, email, location, phoneNumber) оновлюються
5. ✅ Slug автоматично оновлюється при зміні username
6. ✅ Дані зберігаються в localStorage
7. ✅ Мутація працює без передачі ID (використовує JWT)

## Можливі проблеми та рішення

### 1. GraphQL extension не працює

**Проблема:** Strapi не бачить нові поля в GraphQL схемі

**Рішення:**
- Перезапустіть Strapi: `yarn develop`
- Перевірте чи файл `backend/src/extensions/users-permissions/graphql.ts` існує
- Перевірте консоль Strapi на помилки

### 2. Помилка "Cannot read property 'avatar' of undefined"

**Проблема:** Avatar не populate в query

**Рішення:** 
- Переконайтесь що в GraphQL extension є resolver для avatar
- Перевірте чи правильно працює populate в resolver

### 3. Помилка "updateMe is not defined"

**Проблема:** Custom мутація не зареєстрована

**Рішення:**
- Перезапустіть Strapi
- Перевірте файл `backend/src/extensions/users-permissions/graphql.ts`
- Перевірте що resolver для `updateMe` правильно експортується

### 4. Помилка 403 Forbidden

**Проблема:** Немає прав на оновлення

**Рішення:**
- Перейдіть в Strapi Admin Panel → Settings → Users & Permissions → Roles → Authenticated
- Додайте дозволи для `users-permissions.user.updateMe`

### 5. Avatar не завантажується

**Проблема:** Немає прав на upload

**Рішення:**
- Перейдіть в Strapi Admin Panel → Settings → Users & Permissions → Roles → Authenticated
- Додайте дозволи для `upload.upload`

## Структура файлів

```
backend/
├── src/
│   └── extensions/
│       └── users-permissions/
│           ├── graphql.ts              # GraphQL extension з custom полями і resolvers
│           ├── strapi-server.ts        # REST API extension
│           └── content-types/
│               └── user/
│                   └── schema.json     # Розширена схема User з кастомними полями
└── config/
    └── plugins.ts                      # Конфігурація плагінів

frontend/
├── src/
│   ├── providers/
│   │   └── auth-provider.tsx           # Context з функцією updateProfile
│   └── app/
│       └── account/
│           └── page.tsx                # UI для редагування профілю
```

## Логи для відлагодження

### Backend (Strapi Console)

Якщо є помилки, вони будуть показані в консолі Strapi при запуску або при виконанні запитів.

### Frontend (Browser Console)

Всі логи починаються з емоджі для легкого пошуку:
- 🔄 - Початок операції
- ✅ - Успішна операція
- ❌ - Помилка
- 📤 - Завантаження файлу
- 💾 - Збереження даних

## Додаткова інформація

### JWT Token

Щоб отримати JWT token для тестування в GraphQL Playground:

1. Відкрийте Developer Tools → Application → Local Storage
2. Знайдіть ключ `auth.jwt`
3. Скопіюйте значення
4. Використовуйте в Headers як `Bearer YOUR_JWT_TOKEN`

### Дані в Strapi

Всі дані зберігаються в колекції `plugin::users-permissions.user` (таблиця `up_users` в БД).

Перевірити дані можна:
1. Через Admin Panel: `http://localhost:1337/admin/content-manager/collection-types/plugin::users-permissions.user`
2. Через GraphQL Playground
3. Через API: `http://localhost:1337/api/users/me` (потребує JWT в Headers)

