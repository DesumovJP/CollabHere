# 🔄 Використати вбудований endpoint Strapi

## Проблема

Кастомний роут `/api/users/me` не реєструється правильно (404 error).

## ✅ Рішення - використати вбудований endpoint

Strapi має **вбудований endpoint** для оновлення користувача:

```
PUT http://localhost:1337/api/users/{id}
```

## 📝 Що треба змінити

### У `frontend/src/providers/auth-provider.tsx`:

**Замість:**
```typescript
const response = await fetch(`${base}/api/users/me`, {
  method: "PUT",
  ...
});
```

**На:**
```typescript
const response = await fetch(`${base}/api/users/${user?.id}`, {
  method: "PUT",
  ...
});
```

## 🧪 Тестування вбудованого endpoint

```bash
curl -X PUT http://localhost:1337/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Ukraine, Kyiv",
    "phoneNumber": "380991234567"
  }'
```

## ✅ Переваги

1. **Працює out-of-the-box** - не потрібно реєструвати кастомний роут
2. **Стандартний Strapi endpoint** - підтримується офіційно
3. **Простіше** - менше коду

## 📋 Наступний крок

Хочеш щоб я змінив `auth-provider.tsx` на використання вбудованого endpoint `/api/users/{id}`?


