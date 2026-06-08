# Структура БД (актуально для записи на приём)

Источник: `prisma/schema.prisma`. База: PostgreSQL.

## Ключевые таблицы

### `services` (услуги)
| Поле | Описание |
|------|----------|
| service_id | PK |
| title, subtitle, price, … | Контент услуги |
| service_category_id | FK → **листовая** категория в меню (дочерняя) |

### `specialists` (врачи)
| Поле | Описание |
|------|----------|
| specialists_id | PK |
| name, specialization, … | Данные врача |
| service_category_id | FK → обычно **корневая** категория (Стоматология, УЗИ, …) |

### `service_specialists` (связь M:N)
| Поле | Описание |
|------|----------|
| service_id | FK → services |
| specialist_id | FK → specialists |
| PK | (service_id, specialist_id) |

**Важно:** после миграции `20251123220330` старый столбец `services.specialists_id` удалён. Связи хранятся только здесь. Если таблица пустая — в модалке записи «нет врачей».

Заполнение: `node scripts/backfill-service-specialists.mjs` (связь по дереву категорий: врач на родительской категории → все услуги в подкатегориях).

### `appointments` (записи)
| Поле | Описание |
|------|----------|
| appointment_id | PK |
| patient_id | FK → patients |
| specialists_id | FK → specialists |
| service_id | FK → services (nullable) |
| scheduled_at | Дата/время |
| duration_minutes | Длительность (по умолчанию 30) |
| status | pending \| confirmed \| cancelled \| completed \| no_show |
| note | Комментарий пациента |
| admin_comment | Комментарий админа (виден в ЛК) |
| created_at, updated_at | |

### `service_categories` (дерево меню)
Иерархия: корень → подкатегории → лист (конкретная услуга в меню).  
Услуги в `services` привязаны к **листу**, врачи в `specialists` — чаще к **корню** ветки.

## Схема связей (фрагмент)

```
ServiceCategory (дерево)
    ├── Service (листовая категория → запись в services)
    └── Specialist (корневая/ветка категории)

Service ←── service_specialists ──→ Specialist
   │
   └── Appointment ← Patient
```

## Команды обслуживания

```bash
# Статус миграций
npx dotenv-cli -e .env -- npx prisma migrate status

# Применить миграции
npx dotenv-cli -e .env -- npx prisma migrate deploy

# Пересобрать client
npx dotenv-cli -e .env -- npx prisma generate

# Восстановить связи врач–услуга
npx dotenv-cli -e .env -- node scripts/backfill-service-specialists.mjs
```
