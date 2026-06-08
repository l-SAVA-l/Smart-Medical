# Полный гайд: ER-диаграмма в draw.io по БД проекта

Пошаговая инструкция для ручной ER-диаграммы в [draw.io](https://app.diagrams.net).  
Соответствует `prisma/schema.prisma` и `docs/DATA_MODEL_PROJECT.md`.

---

## Часть 1. Подготовка в draw.io

### 1.1 Открыть редактор и холст

1. Перейди на **https://app.diagrams.net** (или десктоп / Google Drive / OneDrive).
2. Создай новую диаграмму (Blank Diagram).
3. Рекомендуемый размер: **View → Page Size** — 3000×2000 px и больше.

### 1.2 Фигуры для ER

- **Способ A:** **Arrange → Insert → Advanced → Entity Relation**
- **Способ B:** **More Shapes** → включить **Entity Relation**
- **Способ C:** прямоугольники + **Connector** (линии)

### 1.3 Обозначения

- **Сущность:** прямоугольник; сверху — имя таблицы (`@@map`), ниже — атрибуты.
- **PK:** подчёркивание или пометка PK.
- **FK:** пометка FK на поле или подпись на линии.
- **Кратность:** 1, N, M:N; опционально — **0..1** / **0..N**.

---

## Часть 2. Список сущностей и атрибутов

### 2.1 Русские названия (подписи на диаграмме)

#### Каталог и услуги

| Таблица | Атрибуты |
|---------|----------|
| **Категории** *(только партнёры)* | идентификатор (PK), название, ярлык (slug) |
| **Категории услуг** | идентификатор (PK), название, ярлык, иконка, описание, родитель (FK → сама), порядок, активна, дата создания, дата обновления |
| **Услуги** | идентификатор (PK), название, подзаголовок, цена, URL видео, описание, изображения (основное + 1..4), **категория услуг (FK, обяз.)**, questions_id*, reviews_id* |
| **Услуги–Специалисты** (M:N) | услуга (PK, FK), специалист (PK, FK) |
| **Специалисты** | идентификатор (PK), **категория услуг (FK, обяз.)**, ФИО, специализация, квалификация, опыт, рейтинг, фото, область, образование, конференции, специализации, примеры работ |

\* *questions_id / reviews_id — устаревшие служебные поля; связи через таблицы questions и feedbacks.*

#### Вопросы и отзывы

| Таблица | Атрибуты |
|---------|----------|
| **Категории вопросов** | идентификатор (PK), название, ярлык, описание, порядок, активна, даты |
| **Вопросы** | идентификатор (PK), вопрос, ответ, услуга (FK, опц.), категория вопросов (FK, опц.) |
| **Отзывы** | идентификатор (PK), имя, текст, дата, оценка, изображение, верифицирован, услуга (FK, опц.) |

#### Партнёры и контент

| Таблица | Атрибуты |
|---------|----------|
| **Партнёры** | идентификатор (PK), категория (FK), изображение, название, описание, номер, сайт |
| **Вакансии** | идентификатор (PK), название, категория (строка), описание, оплата, опыт, требования |
| **Контакты** | идентификатор (PK), адрес, карта, часы, телефоны, email |
| **Материалы** | идентификатор (PK), название, контент, подробный текст, изображение, дата, год, активен, даты |

#### Пользователи и коммуникация

| Таблица | Атрибуты |
|---------|----------|
| **Пациенты** | идентификатор (PK), логин, email, пароль, ФИО, телефон, дата регистрации, аватар, **роль (enum)**, блокировка сообщений |
| **Письма** | идентификатор (PK), пациент (FK), тема, текст, даты, ответ, флаги прочтения |
| **Сообщения в переписке** | идентификатор (PK), письмо (FK), тип отправителя, текст, дата, прочитано |
| **Чаты с оператором** | идентификатор (PK), пациент (FK), оператор (FK → пациенты, опц.), **статус (enum)**, даты, непрочитанные |
| **Сообщения в чате** | идентификатор (PK), чат (FK), отправитель (FK), тип, текст, дата, прочитано |

#### Записи на приём

| Таблица | Атрибуты |
|---------|----------|
| **Записи на приём** | идентификатор (PK), пациент (FK), специалист (FK), услуга (FK, опц.), дата/время, длительность, статус, **заметка пациента**, **комментарий админа**, дата создания, **дата обновления** |

**Статусы записи:** pending, confirmed, cancelled, completed, no_show.

---

### 2.2 Имена как в БД (англ.)

#### Каталог и услуги

| Таблица | Атрибуты |
|---------|----------|
| **categories** | id (PK), name, slug |
| **service_categories** | id (PK), name, slug, icon, description, parent_id (FK self), order, is_active, created_at, updated_at |
| **services** | id (PK), title, subtitle, price, video_url, description, image_url, image_url_1..4, **service_category_id (FK, required)**, questions_id*, reviews_id* |
| **service_specialists** | service_id (PK, FK), specialist_id (PK, FK) |
| **specialists** | id (PK), **service_category_id (FK, required)**, name, specialization, qualification, experience, grade, image_url, activity_area, education_details, conferences[], specializations[], education[], work_examples (JSON) |

#### Вопросы и отзывы

| Таблица | Атрибуты |
|---------|----------|
| **question_categories** | id (PK), name, slug, description, order, is_active, created_at, updated_at |
| **questions** | id (PK), question, answer, service_id (FK, opt), question_category_id (FK, opt) |
| **feedbacks** | id (PK), name, text, date, grade, image_url, verified, service_id (FK, opt) |

#### Партнёры и контент

| Таблица | Атрибуты |
|---------|----------|
| **partners** | id (PK), category_id (FK), image_url, name, description, number, website_url |
| **vacancies** | id (PK), name, category, description, payment, experience, requirements |
| **contacts** | id (PK), address, map_geo, work_hours_main, work_hours_sunday, phone_number, phone_number_sec, email |
| **materials** | id (PK), title, content, detailed_content, image_url, date, year, is_active, created_at, updated_at |

#### Пользователи и коммуникация

| Таблица | Атрибуты |
|---------|----------|
| **patients** | id (PK), login, email, password, name, phone, registration_date, avatar_url, role (enum), is_messages_blocked |
| **letters** | id (PK), patient_id (FK), subject, content, created_at, reply, replied_at, is_read, is_reply_read, has_new_patient_message |
| **letter_messages** | id (PK), letter_id (FK), sender_type, content, created_at, is_read |
| **operator_chats** | id (PK), patient_id (FK), operator_id (FK → patients, opt), status (enum), created_at, updated_at, last_message_at, has_unread_operator, has_unread_patient |
| **operator_chat_messages** | id (PK), chat_id (FK), sender_id (FK), sender_type, content, created_at, is_read |

#### Записи на приём

| Таблица | Атрибуты |
|---------|----------|
| **appointments** | id (PK), patient_id (FK), specialist_id (FK), service_id (FK, opt), scheduled_at, duration_minutes, status, note, **admin_comment**, created_at, **updated_at** |

#### Перечисления (не таблицы, можно вынести в легенду)

| Enum | Значения |
|------|----------|
| **Role** | USER, ADMIN, CHIEF_DOCTOR, OPERATOR |
| **ChatStatus** | WAITING, ACTIVE, CLOSED |

---

## Часть 3. Все связи

### 3.1 Связи — русские названия

| От (родитель) | К (ребёнок) | Тип | Подпись |
|---------------|-------------|-----|---------|
| Категории | Партнёры | 1 : N | категория |
| Категории услуг | Категории услуг | 1 : N | родитель (дерево) |
| Категории услуг | Услуги | 1 : N | категория услуг |
| Категории услуг | Специалисты | 1 : N | категория услуг |
| Услуги | Услуги–Специалисты | 1 : N | услуга |
| Специалисты | Услуги–Специалисты | 1 : N | специалист |
| Услуги | Вопросы | 1 : N | услуга (опц.) |
| Категории вопросов | Вопросы | 1 : N | категория вопросов |
| Услуги | Отзывы | 1 : N | услуга (опц.) |
| Пациенты | Письма | 1 : N | автор |
| Письма | Сообщения в переписке | 1 : N | письмо |
| Пациенты | Чаты с оператором | 1 : N | пациент |
| Пациенты | Чаты с оператором | 1 : N | оператор (опц.) |
| Чаты с оператором | Сообщения в чате | 1 : N | чат |
| Пациенты | Сообщения в чате | 1 : N | отправитель |
| Пациенты | Записи на приём | 1 : N | пациент |
| Специалисты | Записи на приём | 1 : N | специалист |
| Услуги | Записи на приём | 1 : N | услуга (опц.) |

**Не рисовать (устарело):** линии «Категории → Услуги» и «Категории → Специалисты» — в схеме таких FK нет.

**M:N:** Услуги ↔ Специалисты только через **Услуги–Специалисты** (`service_specialists`).

**Без связей:** Вакансии, Контакты, Материалы.

### 3.2 Связи — английские имена

| От | К | Тип | Подпись |
|----|---|-----|---------|
| categories | partners | 1 : N | category_id |
| service_categories | service_categories | 1 : N | parent_id (tree) |
| service_categories | services | 1 : N | service_category_id |
| service_categories | specialists | 1 : N | service_category_id |
| services | service_specialists | 1 : N | service_id |
| specialists | service_specialists | 1 : N | specialist_id |
| services | questions | 1 : N | service_id (opt) |
| question_categories | questions | 1 : N | question_category_id |
| services | feedbacks | 1 : N | service_id (opt) |
| patients | letters | 1 : N | patient_id |
| letters | letter_messages | 1 : N | letter_id |
| patients | operator_chats | 1 : N | patient_id |
| patients | operator_chats | 1 : N | operator_id (opt) |
| operator_chats | operator_chat_messages | 1 : N | chat_id |
| patients | operator_chat_messages | 1 : N | sender_id |
| patients | appointments | 1 : N | patient_id |
| specialists | appointments | 1 : N | specialist_id |
| services | appointments | 1 : N | service_id (opt) |

---

## Часть 4. Порядок рисования

### Шаг 1. Зоны на холсте

1. **Слева сверху:** service_categories, services, service_specialists, specialists. Рядом маленький блок **categories** → только к partners.
2. **Справа сверху:** question_categories, questions, feedbacks, partners, vacancies, contacts, materials.
3. **Центр снизу:** patients.
4. **Справа от patients:** letters, letter_messages, operator_chats, operator_chat_messages.
5. **Между каталогом и patients:** appointments (связи к patients, specialists, services).

### Шаг 2. Блоки сущностей

Минимум на блоке: **PK + все FK + 2–3 бизнес-поля**.  
Пример **services:**

```
services
─────────
id (PK)
title, price
service_category_id (FK)
```

Пример **appointments:**

```
appointments
────────────
id (PK)
patient_id (FK)
specialist_id (FK)
service_id (FK, opt)
scheduled_at, status
note, admin_comment
created_at, updated_at
```

### Шаг 3. Линии

- От родителя (1) к ребёнку (N).
- **service_specialists:** две линии от services и specialists; подпись «M:N».
- **service_categories:** линия на себя (parent_id).
- **patients → operator_chats:** две линии — `patient_id` и `operator_id`.

### Шаг 4. Особые случаи

| Случай | Как рисовать |
|--------|----------------|
| M:N услуга–врач | Таблица `service_specialists` между services и specialists |
| Дерево меню | Самоссылка service_categories |
| Два FK на patients | operator_chats: patient и operator |
| Category | Только связь с partners, не с services/specialists |
| Врач и услуга в разных уровнях дерева | На диаграмме допустима пометка: «связь M:N заполняется в service_specialists (в т.ч. backfill по предкам категории)» |

### Шаг 5. Проверка

- [ ] Нет линий categories → services / specialists  
- [ ] У services нет category_id на диаграмме  
- [ ] У specialists только service_category_id  
- [ ] У appointments есть admin_comment и updated_at  
- [ ] У questions нет поля category (строка)  
- [ ] Каждый FK имеет линию к целевой таблице  

Сохранение: **.drawio** в репозитории или экспорт PNG/SVG.

---

## Часть 5. Шпаргалка связей

### Русский

- Категории → **только** Партнёры  
- Категории услуг → сама себя, Услуги, Специалисты  
- Услуги ↔ Специалисты (M:N через Услуги–Специалисты)  
- Услуги → Вопросы, Отзывы, Записи на приём  
- Категории вопросов → Вопросы  
- Пациенты → Письма, Чаты (×2), Сообщения в чате, Записи  
- Письма → Сообщения в переписке  
- Чаты → Сообщения в чате  
- Специалисты → Записи на приём  

Изолированы: **Вакансии**, **Контакты**, **Материалы**.

### English

- categories → **partners only**  
- service_categories → self, services, specialists  
- services ↔ specialists (M:N via service_specialists)  
- services → questions, feedbacks, appointments  
- question_categories → questions  
- patients → letters, operator_chats (×2), operator_chat_messages, appointments  
- letters → letter_messages  
- operator_chats → operator_chat_messages  
- specialists → appointments  

Isolated: **vacancies**, **contacts**, **materials**.

---

## Часть 6. Легенда (рекомендуется на диаграмме)

| Обозначение | Смысл |
|-------------|--------|
| PK | Первичный ключ |
| FK | Внешний ключ |
| opt | Поле nullable |
| enum | Перечисление (Role, ChatStatus) |
| M:N | Many-to-many через промежуточную таблицу |

---

Упрощённая диаграмма: только имена таблиц из Части 2.2 и линии из Части 3.2 — без полного списка атрибутов.
