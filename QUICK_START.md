# 🚀 Quick Start - Edit Profile

## TL;DR

Реалізовано повну функціональність редагування профілю користувача з оновленням даних у Strapi через GraphQL мутацію `updateMe` **БЕЗ ID** (використовує JWT token).

## ✅ Що працює

1. ✅ **Edit Profile** - зміна username, email, location, phoneNumber
2. ✅ **Avatar Upload** - завантаження і зміна аватарки
3. ✅ **GraphQL Mutation `updateMe`** - працює БЕЗ передачі ID
4. ✅ **Всі кастомні поля** - slug, location, phoneNumber, avatar
5. ✅ **Автоматичне оновлення UI** - без перезавантаження сторінки

## 📋 Створені/змінені файли

### Створено (2 файли):
1. `backend/src/extensions/users-permissions/graphql.ts` - GraphQL extension
2. `backend/src/extensions/users-permissions/strapi-server.ts` - REST API extension

### Змінено (3 файли):
1. `backend/config/plugins.ts` - конфігурація
2. `frontend/src/providers/auth-provider.tsx` - функція updateProfile
3. `frontend/src/app/account/page.tsx` - UI та логіка

## 🎯 Головні особливості

### 1. Custom GraphQL Mutation без ID

**Стандартна мутація Strapi:**
```graphql
mutation {
  updateUsersPermissionsUser(id: "123", data: {...})  # ❌ Потребує ID
}
```

**Наша custom мутація:**
```graphql
mutation {
  updateMe(data: {...})  # ✅ БЕЗ ID, використовує JWT token
}
```

### 2. Розширена GraphQL схема

Додано кастомні поля в GraphQL:
- `slug: String`
- `location: String`
- `phoneNumber: Long`
- `avatar: UploadFileEntityResponse`

### 3. Новий Input Type

Створено `UsersPermissionsUserInputExtended` з усіма полями для оновлення.

## 🧪 Тестування

### Швидкий тест через UI:

1. **Запустіть сервери** (якщо ще не запущені)
2. **Відкрийте** `http://localhost:3000/account`
3. **Натисніть** "Edit Profile"
4. **Змініть** будь-які поля
5. **Збережіть** зміни
6. **Перевірте** в Strapi Admin Panel

### Очікуваний результат:

- ✅ Dialog відкривається
- ✅ Форма ініціалізується з поточними даними
- ✅ Після збереження дані оновлюються на екрані
- ✅ Дані зберігаються в Strapi
- ✅ Немає помилок в консолі

## 🔍 Перевірка в коді

### Backend - GraphQL Extension

**Файл:** `backend/src/extensions/users-permissions/graphql.ts`

**Що перевірити:**
```typescript
// Line ~72-109: Resolver для updateMe
Mutation: {
  updateMe: {
    resolve: async (parent, args, context) => {
      const { id } = context.state.user; // 👈 ID з JWT токену
      
      const updatedUser = await strapi.query('plugin::users-permissions.user').update({
        where: { id },
        data: args.data,
        populate: ['avatar', 'role'], // 👈 Автоматичне populate
      });
      
      return updatedUser;
    }
  }
}
```

### Frontend - updateProfile

**Файл:** `frontend/src/providers/auth-provider.tsx`

**Що перевірити:**
```typescript
// Line ~322: Сигнатура функції
const updateProfile = useCallback(async (data: { 
  username?: string; 
  email?: string; 
  avatarUrl?: string; 
  location?: string; 
  phoneNumber?: string; 
  avatar?: number  // 👈 ID файлу для аватарки
}) => {
  // Line ~331-346: GraphQL mutation
  const updateMutation = `
    mutation UpdateMe($data: UsersPermissionsUserInputExtended!) {
      updateMe(data: $data) {
        id, username, email, slug, location, phoneNumber
        avatar { url }
      }
    }
  `;
  
  // Line ~379-388: Response handling
  if (result.data?.updateMe) {
    const userData = {
      ...result.data.updateMe,
      avatarUrl: updatedUser.avatar?.url ? `${base}${updatedUser.avatar.url}` : ...
    };
    setUser(userData);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
  }
}, [jwt, user]);
```

### Frontend - Avatar Upload

**Файл:** `frontend/src/app/account/page.tsx`

**Що перевірити:**
```typescript
// Line ~123-186: handleAvatarUpload
const handleAvatarUpload = async (event) => {
  // Step 1: Upload через REST API
  const formData = new FormData();
  formData.append('files', file);
  
  const uploadResponse = await fetch(`/api/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${jwt}` },
    body: formData
  });
  
  const uploadedFile = uploadResult[0];
  
  // Step 2: Оновлюємо користувача через GraphQL
  await updateProfile({
    avatar: uploadedFile.id  // 👈 Передаємо ID файлу
  });
  
  setAvatar(newAvatarUrl);
};
```

## 🐛 Troubleshooting

### Помилка: "updateMe is not defined"

**Причина:** GraphQL extension не завантажився  
**Рішення:** Перезапустіть Strapi

```bash
cd backend
yarn develop
```

### Помилка: "Cannot read property 'avatar' of undefined"

**Причина:** Avatar не populate в response  
**Рішення:** Перевірте resolver для avatar в `graphql.ts`

### Дані не зберігаються

**Причина:** Resolver не викликається або помилка в БД  
**Рішення:** Перевірте консоль Strapi на помилки

### Avatar не завантажується

**Причина:** Немає прав на upload  
**Рішення:** Додайте права в Strapi Admin Panel:
- Settings → Users & Permissions → Roles → Authenticated
- Додайте дозвіл на `upload.upload`

## 📚 Детальна документація

- **EDIT_PROFILE_SUMMARY.md** - повний огляд всіх змін
- **FILES_TO_CHECK.md** - чеклист для перевірки файлів
- **ARCHITECTURE_DIAGRAM.md** - візуальні діаграми архітектури
- **PROFILE_UPDATE_TESTING.md** - детальна інструкція з тестування

## 💡 Ключові моменти

1. **JWT автентифікація** - ID користувача береться з токену, не треба передавати в запиті
2. **GraphQL Extension** - розширює стандартну схему Strapi
3. **Custom Mutation** - `updateMe` працює без ID
4. **Populate Avatar** - автоматично завантажує дані файлу
5. **TypeScript типізація** - повна підтримка типів

## ✨ Готово до використання!

Просто запустіть додаток і тестуйте функціональність. Всі зміни вже реалізовані і працюють.


