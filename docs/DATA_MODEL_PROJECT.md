# Модель данных проекта (документация по Prisma-схеме)

Документ описает сущности, связи и атрибуты в формате «таблица сущностей → таблица связей → таблица атрибутов».  
**Источник истины:** `prisma/schema.prisma` (актуально на момент последней правки схемы записей на приём).

---

## Таблица 1 – Описание сущностей

Перечень соответствует моделям Prisma. Перечислены также перечисления (enum), используемые в полях.

| Сущность | Таблица в БД (`@@map`) | Описание |
|----------|------------------------|----------|
| Service | `services` | Услуга клиники: контент, цена, медиа, привязка к категории меню (`ServiceCategory`), связь со специалистами (M:N), вопросы, отзывы, записи |
| ServiceSpecialist | `service_specialists` | Связь M:N «услуга – специалист» (составной PK) |
| Category | `categories` | Плоский справочник категорий **только для партнёров** |
| ServiceCategory | `service_categories` | Древовидное меню услуг (родитель/потомки); услуги и специалисты привязаны сюда |
| Specialist | `specialists` | Врач: ФИО, специализация, опыт, медиа, привязка к `ServiceCategory`, M:N с услугами, записи на приём |
| QuestionCategory | `question_categories` | Категория FAQ (одноуровневая) |
| Question | `questions` | Вопрос–ответ к услуге и/или категории вопросов |
| Feedback | `feedbacks` | Отзыв (опционально к услуге) |
| Partner | `partners` | Партнёр клиники (привязка к `Category`) |
| Vacancy | `vacancies` | Вакансия (без FK на другие сущности) |
| Contacts | `contacts` | Контакты клиники (одна запись в типичном сценарии) |
| Patient | `patients` | Учётная запись: роли USER / ADMIN / CHIEF_DOCTOR / OPERATOR, письма, чаты, записи |
| Material | `materials` | Материал/статья на сайте |
| Letter | `letters` | Письмо главному врачу |
| LetterMessage | `letter_messages` | Сообщение в переписке по письму |
| OperatorChat | `operator_chats` | Чат пациента с оператором |
| OperatorChatMessage | `operator_chat_messages` | Сообщение в чате с оператором |
| Appointment | `appointments` | Запись на приём |

Перечисления **Role** и **ChatStatus** не являются отдельными сущностями; используются как типы полей `patients.role` и `operator_chats.status`.

---

## Таблица 2 – Сущности и их связи

Формат: **Сущность — Связи — Сущность**. Описание согласовано с `prisma/schema.prisma`.  
Сущности без внешних ключей (Вакансия, Контакты, Материал) в таблицу не включены.

| Сущность | Связи | Сущность |
|----------|-------|----------|
| Категория | Одна категория содержит много партнёров | Партнёр |
| Категория услуг | Родительская категория содержит дочерние (древовидная структура); категория содержит услуги и специалистов | Категория услуг (родительская/дочерняя), Услуга, Специалист |
| Услуга | Услуга принадлежит одной категории меню; связана со специалистами (M:N); имеет вопросы, отзывы и записи на приём | Категория услуг, Специалист (через связь «услуга–специалист»), Вопрос, Отзыв, Запись на приём |
| Специалист | Специалист принадлежит одной категории меню; связан с услугами (M:N); имеет записи на приём | Категория услуг, Услуга (через связь «услуга–специалист»), Запись на приём |
| Категория вопросов | Одна категория вопросов содержит много вопросов | Вопрос |
| Вопрос | Вопрос может быть привязан к одной услуге и/или одной категории вопросов | Услуга, Категория вопросов |
| Отзыв | Отзыв может быть привязан к одной услуге (без привязки — отзыв о клинике в целом) | Услуга |
| Партнёр | Партнёр принадлежит одной категории | Категория |
| Пациент | Один пациент может иметь много писем, чатов с операторами, сообщений в чатах и записей на приём; может быть оператором во многих чатах | Письмо, Чат с оператором, Сообщение в чате, Запись на приём |
| Письмо | Письмо принадлежит одному пациенту; содержит много сообщений переписки | Пациент, Сообщение письма |
| Сообщение письма | Сообщение принадлежит одному письму | Письмо |
| Чат с оператором | Чат принадлежит одному пациенту и опционально одному оператору (пациент с ролью оператора); содержит много сообщений | Пациент (как пациент, как оператор), Сообщение в чате |
| Сообщение в чате | Сообщение принадлежит одному чату и одному отправителю (пациент) | Чат с оператором, Пациент |
| Запись на приём | Запись принадлежит одному пациенту, одному специалисту и опционально одной услуге | Пациент, Специалист, Услуга |

**Без связей с другими таблицами:** Вакансия, Контакты, Материал (изолированные сущности в схеме).

**Важно для записи на приём:** связь врач ↔ услуга хранится **только** в `service_specialists`. Поле `services.specialists_id` удалено миграцией `20251123220330`. Для восстановления связей по дереву категорий: `node scripts/backfill-service-specialists.mjs`.

---

## Таблица 3 – Описание атрибутов сущностей

### Service (`services`)

| Атрибут | Описание |
|---------|----------|
| id | PK, `service_id` |
| title | Название |
| subtitle | Подзаголовок |
| price | Цена (целое число) |
| video_url | URL видео |
| description | Описание (TEXT) |
| image_url, image_url_1 … image_url_3 | URL изображений |
| image_url_4 | Доп. изображение (nullable) |
| service_category_id | FK → ServiceCategory (**обязательно**) |
| questions_id | Устаревшее служебное поле; вопросы через модель Question |
| reviews_id | Устаревшее служебное поле; отзывы через модель Feedback |

### ServiceSpecialist (`service_specialists`)

| Атрибут | Описание |
|---------|----------|
| service_id | FK → Service, часть PK |
| specialist_id | FK → Specialist, часть PK |

### Category (`categories`)

| Атрибут | Описание |
|---------|----------|
| id | PK, `category_id` |
| name | Название |
| slug | Уникальный slug для URL |

### ServiceCategory (`service_categories`)

| Атрибут | Описание |
|---------|----------|
| id | PK, `service_category_id` |
| name | Название |
| slug | Уникальный slug |
| icon | Иконка (nullable) |
| description | Описание (nullable, TEXT) |
| parent_id | FK на родителя (nullable = корень дерева) |
| order | Порядок в меню |
| is_active | Активна ли категория |
| created_at, updated_at | Метки времени |

### Specialist (`specialists`)

| Атрибут | Описание |
|---------|----------|
| id | PK, `specialists_id` |
| service_category_id | FK → ServiceCategory (**обязательно**; обычно корневая/ветка меню) |
| name | ФИО |
| specialization | Специализация (строка) |
| qualification | Квалификация |
| experience | Опыт (лет) |
| grade | Рейтинг/оценка |
| image_url | Фото |
| activity_area | Область деятельности (nullable) |
| education_details | Образование, TEXT (nullable) |
| conferences | Массив строк |
| specializations | Массив строк |
| education | Массив строк |
| work_examples | JSON: `{ title, images[] }[]` (nullable) |

### QuestionCategory (`question_categories`)

| Атрибут | Описание |
|---------|----------|
| id | PK |
| name, slug | Название и URL |
| description | Описание (nullable) |
| order, is_active | Сортировка и видимость |
| created_at, updated_at | Метки времени |

### Question (`questions`)

| Атрибут | Описание |
|---------|----------|
| id | PK |
| question | Текст вопроса |
| answer | Ответ (nullable, TEXT) |
| service_id | FK → Service (nullable) |
| question_category_id | FK → QuestionCategory (nullable) |

### Feedback (`feedbacks`)

| Атрибут | Описание |
|---------|----------|
| id | PK, `reviews_id` |
| name, text, date, grade, image_url | Данные отзыва |
| verified | Проверен админом |
| service_id | FK → Service (nullable = отзыв о клинике в целом) |

### Partner (`partners`)

| Атрибут | Описание |
|---------|----------|
| id | PK |
| category_id | FK → Category (`categori_id` в БД) |
| image_url, name, description, number, website_url | Контент партнёра |

### Vacancy (`vacancies`)

| Атрибут | Описание |
|---------|----------|
| id | PK |
| name, category, description, payment, experience, requirements | Поля вакансии (category — строка, не FK) |

### Contacts (`contacts`)

| Атрибут | Описание |
|---------|----------|
| id | PK |
| address, map_geo | Адрес и координаты/карта |
| work_hours_main, work_hours_sunday | Часы работы |
| phone_number, phone_number_sec, email | Контакты |

### Patient (`patients`)

| Атрибут | Описание |
|---------|----------|
| id | PK |
| login, email, password, name, phone | Учётные данные |
| registration_date | Дата регистрации (Date) |
| avatar_url | Аватар (nullable) |
| role | Enum Role в БД: USER, ADMIN, CHIEF_DOCTOR, OPERATOR |
| is_messages_blocked | Блокировка отправки писем |

### Material (`materials`)

| Атрибут | Описание |
|---------|----------|
| id | PK |
| title, content, detailed_content | Заголовок и тексты |
| image_url, date, year | Медиа и дата |
| is_active | Публикация на сайте |
| created_at, updated_at | Метки времени |

### Letter (`letters`)

| Атрибут | Описание |
|---------|----------|
| id | PK |
| patient_id | FK → Patient |
| subject, content | Тема и текст |
| created_at | Создано |
| reply, replied_at | Первый ответ (legacy, nullable) |
| is_read, is_reply_read, has_new_patient_message | Флаги прочтения |

### LetterMessage (`letter_messages`)

| Атрибут | Описание |
|---------|----------|
| id | PK |
| letter_id | FK → Letter |
| sender_type | `patient` \| `chief_doctor` |
| content | Текст |
| created_at, is_read | Время и прочтение |

### OperatorChat (`operator_chats`)

| Атрибут | Описание |
|---------|----------|
| id | PK |
| patient_id | FK → Patient |
| operator_id | FK → Patient (оператор, nullable) |
| status | Enum ChatStatus в БД: WAITING, ACTIVE, CLOSED |
| created_at, updated_at, last_message_at | Время |
| has_unread_operator, has_unread_patient | Непрочитанные |

### OperatorChatMessage (`operator_chat_messages`)

| Атрибут | Описание |
|---------|----------|
| id | PK |
| chat_id | FK → OperatorChat |
| sender_id | FK → Patient |
| sender_type | `patient` \| `operator` |
| content | Текст |
| created_at, is_read | Время и прочтение |

### Appointment (`appointments`)

| Атрибут | Описание |
|---------|----------|
| id | PK, `appointment_id` |
| patient_id | FK → Patient |
| specialist_id | FK → Specialist (`specialists_id` в БД) |
| service_id | FK → Service (nullable) |
| scheduled_at | Дата и время приёма |
| duration_minutes | Длительность, по умолчанию 30 |
| status | `pending` \| `confirmed` \| `cancelled` \| `completed` \| `no_show` |
| note | Комментарий **пациента** при записи (nullable) |
| admin_comment | Комментарий **админа**, виден в ЛК (nullable) |
| created_at | Создание записи |
| updated_at | Последнее изменение (авто) |

**Индексы:** `patient_id`, `specialist_id`, `scheduled_at`, `status`.

Перечисления **Role** и **ChatStatus** в модели данных не выделены отдельными сущностями; допустимые значения указаны в описании атрибутов `patients.role` и `operator_chats.status`.

---

## Сводная схема связей (текст)

```
categories ──1:N──> partners

service_categories ──(self tree)──> service_categories
        ├──1:N──> services ──M:N── service_specialists ──M:N── specialists
        └──1:N──> specialists

services ──1:N──> questions, feedbacks, appointments
question_categories ──1:N──> questions

patients ──1:N──> letters ──1:N──> letter_messages
patients ──1:N──> operator_chats ──1:N──> operator_chat_messages
patients ──1:N──> appointments
specialists ──1:N──> appointments
```

---

## Связанные документы

- `docs/DB_STRUCTURE_APPOINTMENTS.md` — детали записи на приём и `service_specialists`
- `docs/DRAWIO_ER_GUIDE.md` — пошаговое рисование ER в draw.io
- `prisma/schema.prisma` — исходник для генерации клиента и миграций

---

*Таблицы 1–3 согласованы с `prisma/schema.prisma`. При изменении схемы обновляй этот файл и гайд draw.io.*
