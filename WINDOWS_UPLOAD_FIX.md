# 🔧 Виправлення Upload на Windows

## Проблема

```
EPERM: operation not permitted, unlink 'C:\Users\...\Temp\strapi-upload-...'
```

Це відома проблема на Windows - Strapi не може видалити тимчасовий файл після оптимізації зображення.

## ✅ Рішення 1: Конфігурація upload плагіна (ЗРОБЛЕНО)

Створено `backend/config/plugins.js` з налаштуваннями для upload.

**Перезапусти Strapi і спробуй знову!**

---

## ✅ Рішення 2: Якщо все ще не працює

### Додай в `backend/config/plugins.js`:

```javascript
upload: {
  config: {
    providerOptions: {
      localServer: {
        maxage: 300000
      },
    },
    // Вимикаємо генерацію responsive форматів на Windows
    breakpoints: {},
    sizeLimit: 250 * 1024 * 1024,
  },
},
```

---

## ✅ Рішення 3: Використати інший temp folder

### У `backend/config/plugins.js`:

```javascript
upload: {
  config: {
    providerOptions: {
      localServer: {
        uploadDir: './public/uploads',
      },
    },
  },
},
```

---

## ✅ Рішення 4: Альтернатива - завантажувати без оптимізації

Якщо нічого не допомагає, можна завантажувати файли напряму в `public/uploads` без використання Strapi upload API.

---

## 📋 Наступні кроки

1. ✅ Перезапусти Strapi
2. 🧪 Спробуй завантажити аватарку
3. 📝 Якщо все ще помилка - спробуємо Рішення 2 або 3


