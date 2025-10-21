# 🔄 ПЕРЕЗАПУСТИ STRAPI ЗАРАЗ!

## ⚠️ Важливо!

GraphQL extension не завантажився, тому що Strapi треба перезапустити.

## 📋 Що робити:

### 1. Зупини Strapi

Натисни `Ctrl + C` в терміналі де запущено backend

### 2. Запусти знову

```bash
cd backend
yarn develop
```

### 3. Почекай поки Strapi повністю запуститься

Шукай в консолі:
```
[2024-...] info ⏳ Opening the admin panel...
[2024-...] info ✨ Server started
```

### 4. Перевір чи GraphQL extension завантажився

В консолі Strapi повинні бути повідомлення про завантаження extension або відсутність помилок.

## 🧪 Після перезапуску протестуй:

### Тест в GraphQL Playground (`http://localhost:1337/graphql`)

```graphql
mutation {
  updateMe(data: {
    location: "Ukraine, Lviv"
    phoneNumber: "380991234567"
  }) {
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

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

## ✅ Очікуваний результат:

Якщо extension завантажився правильно, мутація `updateMe` повинна:
1. ✅ Не показувати помилку "Cannot query field updateMe"
2. ✅ Успішно оновити дані користувача
3. ✅ Повернути оновлені дані

## ❌ Якщо все ще помилка:

Якщо після перезапуску все ще помилка "Cannot query field updateMe", тоді ми спробуємо альтернативний підхід - використаємо плагін graphql напряму замість extension.

## 📝 Змінені файли:

1. `backend/src/extensions/users-permissions/graphql.ts` - змінено на `module.exports`
2. `backend/src/extensions/users-permissions/strapi-server.ts` - додано реєстрацію GraphQL extension

**ПЕРЕЗАПУСТИ STRAPI ЗАРАЗ! 🚀**


