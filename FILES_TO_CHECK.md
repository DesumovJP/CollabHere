# Файли для перевірки - Edit Profile функціональність

## ✅ Файли де відбуваються мутації та запити

### Backend - GraphQL і мутації

1. **`backend/src/extensions/users-permissions/graphql.ts`** ⭐ НОВИЙ
   - **Що робить:** Розширює GraphQL схему, додає custom поля та мутацію `updateMe`
   - **Мутація:** `updateMe(data: UsersPermissionsUserInputExtended!): UsersPermissionsMe!`
   - **Працює:** БЕЗ ID, використовує JWT token для визначення користувача
   - **Підтримує поля:** username, email, slug, location, phoneNumber, avatar

2. **`backend/src/extensions/users-permissions/strapi-server.ts`** ⭐ НОВИЙ
   - **Що робить:** Додає REST endpoint для оновлення профілю
   - **Endpoint:** `PUT /users/me`
   - **Використання:** Бекап варіант для REST API

3. **`backend/config/plugins.ts`** (ЗМІНЕНО)
   - **Що робить:** Конфігурація GraphQL та users-permissions плагінів
   - **Зміни:** 
     - Увімкнено GraphQL playground
     - Додано allowedFields для реєстрації

4. **`backend/src/extensions/users-permissions/content-types/user/schema.json`** (ІСНУВАВ)
   - **Що робить:** Визначає схему User з кастомними полями
   - **Поля:** slug, location, phoneNumber, avatar

### Frontend - Запити та UI

5. **`frontend/src/providers/auth-provider.tsx`** (ЗМІНЕНО)
   - **Функція:** `updateProfile(data)`
   - **GraphQL мутація:**
     ```graphql
     mutation UpdateMe($data: UsersPermissionsUserInputExtended!) {
       updateMe(data: $data) {
         id, username, email, slug, location, phoneNumber, avatar { url }
       }
     }
     ```
   - **Підтримує:** Всі кастомні поля включно з avatar

6. **`frontend/src/app/account/page.tsx`** (ЗМІНЕНО)
   - **Функції:**
     - `handleSaveEdit()` - зберігає зміни профілю
     - `handleAvatarUpload()` - завантажує і оновлює аватарку
   - **Запити:**
     - `POST /api/upload` - завантаження файлу
     - GraphQL `updateMe` - оновлення користувача з avatar ID

## 📋 Швидкий чеклист для тестування

### Перед тестуванням:
- [ ] Strapi запущено (`cd backend && yarn develop`)
- [ ] Frontend запущено (`cd frontend && yarn dev`)
- [ ] Ви залогінені в додатку

### Тест 1: Редагування профілю
1. [ ] Відкрити `http://localhost:3000/account`
2. [ ] Натиснути "Edit Profile"
3. [ ] Змінити username, email, phone, location
4. [ ] Натиснути "Save Changes"
5. [ ] Перевірити що дані оновились на екрані
6. [ ] Перевірити в Strapi Admin Panel: `http://localhost:1337/admin/content-manager/collection-types/plugin::users-permissions.user`

### Тест 2: Зміна аватарки
1. [ ] Натиснути на іконку камери
2. [ ] Вибрати зображення
3. [ ] Перевірити що аватарка оновилась
4. [ ] Перевірити в Strapi що файл прикріплений

### Тест 3: GraphQL Playground
1. [ ] Відкрити `http://localhost:1337/graphql`
2. [ ] Додати Header: `{"Authorization": "Bearer YOUR_JWT"}`
3. [ ] Запустити query `me` з полями slug, location, phoneNumber, avatar
4. [ ] Запустити mutation `updateMe` для зміни даних
5. [ ] Перевірити що дані змінились

## 🔍 Що перевіряти в кожному файлі

### `backend/src/extensions/users-permissions/graphql.ts`

**Перевірити:**
- ✅ Розширення типів `UsersPermissionsMe` і `UsersPermissionsUser`
- ✅ Input тип `UsersPermissionsUserInputExtended` містить всі поля
- ✅ Resolver `updateMe` отримує `id` з `context.state.user`
- ✅ Resolver використовує `strapi.query().update()` з populate
- ✅ Resolver для `avatar` в `UsersPermissionsMe` та `UsersPermissionsUser`

**Ключові рядки:**
```typescript
Line ~6-11: extend type UsersPermissionsMe
Line ~13-18: extend type UsersPermissionsUser
Line ~20-30: input UsersPermissionsUserInputExtended
Line ~72-109: Mutation.updateMe resolver
Line ~142-161: UsersPermissionsMe.avatar resolver
```

### `frontend/src/providers/auth-provider.tsx`

**Перевірити:**
- ✅ Сигнатура функції `updateProfile` містить всі параметри (line 322)
- ✅ GraphQL мутація використовує `UsersPermissionsUserInputExtended` (line 332)
- ✅ Variables правильно формуються (lines 348-354)
- ✅ Response handling з avatar populate (lines 379-388)
- ✅ Error handling (lines 374-377, 402-410)

**Ключові рядки:**
```typescript
Line 322: function signature з avatar?: number
Line 331-346: GraphQL mutation string
Line 348-354: variables mapping
Line 379-388: response handling з avatar.url
```

### `frontend/src/app/account/page.tsx`

**Перевірити:**
- ✅ `handleSaveEdit` викликає `updateProfile` з усіма полями (lines 106-111)
- ✅ `handleAvatarUpload` використовує REST API upload (lines 147-153)
- ✅ `handleAvatarUpload` викликає `updateProfile({ avatar: id })` (lines 174-176)
- ✅ Форма правильно ініціалізується в `handleEditClick` (lines 63-68)
- ✅ Кнопка "Edit Profile" увімкнена (line 275, немає disabled)

**Ключові рядки:**
```typescript
Line 106-111: updateProfile call в handleSaveEdit
Line 141-179: handleAvatarUpload нова реалізація
Line 63-68: handleEditClick ініціалізація форми
Line 275: Edit Profile button без disabled
```

## 🐛 Типові помилки та як їх знайти

### 1. "updateMe is not defined" в GraphQL
**Де шукати:** Console браузера або GraphQL Playground  
**Причина:** GraphQL extension не завантажився  
**Файл:** `backend/src/extensions/users-permissions/graphql.ts`  
**Рішення:** Перезапустити Strapi

### 2. "Cannot read property 'avatar' of undefined"
**Де шукати:** Console браузера  
**Причина:** Avatar не populate в response  
**Файл:** `backend/src/extensions/users-permissions/graphql.ts` (resolver avatar)  
**Рішення:** Перевірити resolver для avatar field

### 3. Дані не зберігаються в Strapi
**Де шукати:** Strapi Admin Panel  
**Причина:** Мутація не оновлює БД  
**Файл:** `backend/src/extensions/users-permissions/graphql.ts` (updateMe resolver)  
**Рішення:** Перевірити чи правильно викликається `strapi.query().update()`

### 4. Avatar не завантажується
**Де шукати:** Network tab в DevTools  
**Причина:** Upload endpoint повертає помилку  
**Файл:** `frontend/src/app/account/page.tsx` (handleAvatarUpload)  
**Рішення:** Перевірити права на upload в Strapi

## 📝 Консольні логи для перевірки

### Успішне оновлення профілю:
```
🔄 Updating profile via GraphQL: {...}
✅ GraphQL update response: {...}
✅ Profile updated successfully via GraphQL: {...}
```

### Успішне завантаження аватарки:
```
📤 Uploading avatar via REST API...
✅ Upload success: [...]
🔄 Updating user with new avatar ID: 123
```

### Помилки:
```
❌ GraphQL update errors: [...]
❌ GraphQL request failed: ...
❌ Error saving profile: ...
❌ Error uploading avatar: ...
```

## 🎯 Очікувані результати

Після всіх змін:
1. ✅ Кнопка "Edit Profile" активна і відкриває діалог
2. ✅ Зміни в полях зберігаються в Strapi
3. ✅ Аватарка завантажується і відображається
4. ✅ GraphQL мутація `updateMe` працює БЕЗ ID
5. ✅ Всі поля (username, email, location, phoneNumber, avatar) оновлюються
6. ✅ UI автоматично оновлюється після збереження
7. ✅ Немає помилок в консолі


