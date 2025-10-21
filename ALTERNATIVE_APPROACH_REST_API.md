# 🔄 Альтернативний підхід - REST API

## Проблема

GraphQL extension в Strapi не завантажується правильно через складність реєстрації custom resolvers.

## ✅ Рішення - використати REST API

Замість GraphQL мутації `updateMe`, використаємо **REST API endpoint** який вже працює.

## 📝 REST API Endpoint

```
PUT http://localhost:1337/api/users/me
```

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "username": "NewUsername",
  "email": "newemail@example.com",
  "location": "Ukraine, Kyiv",
  "phoneNumber": "380991234567",
  "avatar": 123
}
```

## 🔧 Що треба змінити у Frontend

### 1. У `auth-provider.tsx` змінити `updateProfile`:

**Було (GraphQL):**
```typescript
const response = await fetch(`${base}/graphql`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${jwt}`
  },
  body: JSON.stringify({
    query: updateMutation,
    variables: { data: variables }
  })
});
```

**Стане (REST API):**
```typescript
const response = await fetch(`${base}/api/users/me`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${jwt}`
  },
  body: JSON.stringify({
    username: data.username,
    email: data.email,
    location: data.location,
    phoneNumber: data.phoneNumber,
    avatar: data.avatar
  })
});

if (response.ok) {
  const updatedUser = await response.json();
  const userData = {
    id: updatedUser.id,
    username: updatedUser.username,
    email: updatedUser.email,
    slug: updatedUser.slug,
    location: updatedUser.location,
    phoneNumber: updatedUser.phoneNumber,
    avatarUrl: updatedUser.avatar?.url ? `${base}${updatedUser.avatar.url}` : (data.avatarUrl || user?.avatarUrl || '')
  };
  setUser(userData);
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
}
```

## 🧪 Тестування REST API

### Через Postman або curl:

```bash
curl -X PUT http://localhost:1337/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Ukraine, Kyiv",
    "phoneNumber": "380991234567"
  }'
```

### Очікувана відповідь:

```json
{
  "id": 1,
  "username": "Sashatest1",
  "email": "shimakunjp@gmail.com",
  "slug": "sashatest1",
  "location": "Ukraine, Kyiv",
  "phoneNumber": "380991234567",
  "avatar": {
    "url": "/uploads/images_e2cf86e92d.jpg"
  },
  "confirmed": true,
  "blocked": false,
  "createdAt": "2024-...",
  "updatedAt": "2024-..."
}
```

## ✅ Переваги REST API підходу

1. **Простіше** - не потрібно налаштовувати GraphQL extension
2. **Надійніше** - REST API в Strapi працює out-of-the-box
3. **Зрозуміліше** - стандартний HTTP запит
4. **Працює зараз** - endpoint вже створений в `strapi-server.js`

## 📋 Наступні кроки

1. ✅ REST API endpoint готовий (`PUT /api/users/me`)
2. ⏳ Змінити `frontend/src/providers/auth-provider.tsx` для використання REST API
3. ⏳ Протестувати через UI
4. ⏳ Протестувати завантаження аватарки

Хочеш, щоб я зараз змінив `auth-provider.tsx` на використання REST API замість GraphQL?


