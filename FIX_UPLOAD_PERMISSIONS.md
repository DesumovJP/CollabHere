# 🔧 Виправлення прав на Upload

## Проблема

Помилка 500 при завантаженні аватарки через `/api/upload`.

## ✅ Рішення 1: Додати права в Strapi Admin Panel

### Крок 1: Відкрий Strapi Admin Panel
```
http://localhost:1337/admin
```

### Крок 2: Перейди до Settings
Settings → Users & Permissions → Roles

### Крок 3: Відкрий роль "Authenticated"
Клікни на "Authenticated" роль

### Крок 4: Знайди секцію "Upload"
Прокрути вниз до секції "Upload"

### Крок 5: Увімкни дозволи
Поставте галочки на:
- ✅ `upload` - дозволяє завантажувати файли
- ✅ `find` - дозволяє шукати файли
- ✅ `findOne` - дозволяє отримувати один файл

### Крок 6: Збережи
Натисни "Save" у верхньому правому куті

### Крок 7: Спробуй знову
Поверніс до додатку і спробуй завантажити аватарку

---

## ✅ Рішення 2: Перевір консоль Strapi

Відкрий термінал де запущено Strapi і подивись на помилку.

Шукай рядки з:
- `Error:`
- `500`
- `upload`
- `EACCES` (проблеми з правами на файли)
- `ENOENT` (папка не існує)

---

## ✅ Рішення 3: Перевір папку uploads

### Windows:
```bash
dir backend\public\uploads
```

### Якщо папка не існує, створи її:
```bash
mkdir backend\public\uploads
```

---

## 🧪 Тестування через Postman/curl

Після налаштування прав, протестуй upload:

```bash
curl -X POST http://localhost:1337/api/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@path/to/image.jpg"
```

Має повернути:
```json
[
  {
    "id": 123,
    "name": "image.jpg",
    "url": "/uploads/image_abc123.jpg",
    ...
  }
]
```

---

## 📋 Checklist

- [ ] Права на upload додані в Strapi Admin Panel
- [ ] Папка `backend/public/uploads` існує
- [ ] Немає помилок в консолі Strapi
- [ ] JWT токен валідний (не застарів)
- [ ] Файл менше 200MB (за замовчуванням ліміт Strapi)

---

## 🔍 Що показати мені

Скопіюй з консолі Strapi (backend терміналу) всю помилку яка з'являється коли ти намагаєшся завантажити аватарку. Це допоможе зрозуміти точну причину.


