# SmartMedical

Платформа управления медицинской клиникой с полным функционалом для пациентов, операторов и администрации.

## Описание

SmartMedical - это современное веб-приложение для управления медицинской клиникой, которое включает в себя:
- Каталог медицинских услуг с подробными описаниями
- База специалистов с информацией о квалификации и опыте
- Личные кабинеты пациентов
- Система обращений к главному врачу
- Чат с операторами
- Административная панель для управления контентом
- Поиск по услугам и специалистам
- База материалов и новостей клиники

## Документация

- Руководство программиста: `docs/Руководство_программиста.md`
- Модель данных и сущности: `docs/DATA_MODEL_PROJECT.md`

## Технологический стек

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Material-UI (MUI), Framer Motion
- **Backend**: Next.js API Routes, NextAuth для аутентификации
- **Database**: PostgreSQL с Prisma ORM
- **File Storage**: Cloudinary для управления изображениями
- **UI Components**: Radix UI, Lucide Icons

## Основные возможности

### Для пациентов
- Регистрация и авторизация
- Личный кабинет с возможностью редактирования профиля
- Просмотр услуг и специалистов
- Поиск по услугам и врачам
- Отправка обращений главному врачу
- Чат с операторами клиники
- Просмотр отзывов и FAQ

### Для операторов
- Управление чатами с пациентами
- Просмотр и ответы на сообщения
- Статусы чатов (ожидание, активный, закрытый)

### Для главного врача
- Просмотр обращений пациентов
- Ответы на письма
- Управление перепиской

### Для администраторов
- Управление услугами и категориями
- Управление специалистами
- Модерация отзывов
- Управление вакансиями и партнерами
- Управление контактной информацией
- Управление материалами и новостями
- Управление FAQ

## Установка и запуск

### Требования
- Node.js 20+
- PostgreSQL
- npm или yarn

### Установка зависимостей

```bash
npm install
```

### Настройка окружения

Создайте файл `.env` в корне проекта со следующими переменными:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smartmedical"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Настройка базы данных

```bash
# Генерация Prisma Client
npm run prisma:generate

# Применение миграций
npm run prisma:migrate

# Заполнение базы тестовыми данными (опционально)
npm run prisma:seed

# Открыть Prisma Studio для просмотра данных
npm run prisma:studio
```

### Запуск проекта

```bash
# Режим разработки
npm run dev

# Сборка для production
npm run build

# Запуск production сервера
npm start
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000)

## Доступные команды

```bash
npm run dev              # Запуск dev-сервера
npm run build            # Сборка для production
npm start                # Запуск production сервера
npm run lint             # Проверка кода ESLint

# Prisma команды
npm run prisma:migrate   # Создание и применение миграций
npm run prisma:generate  # Генерация Prisma Client
npm run prisma:studio    # Открыть Prisma Studio
npm run prisma:seed      # Заполнение БД начальными данными
npm run prisma:reset     # Сброс БД (удаляет все данные!)
npm run prisma:push      # Применение изменений схемы без миграции

# Cloudinary
npm run upload:cloudinary # Загрузка изображений в Cloudinary
```

## Структура проекта

```
smartmedical/
├── prisma/
│   ├── schema.prisma      # Схема базы данных
│   └── seeds.ts           # Начальные данные
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/          # API endpoints
│   │   ├── account/      # Страница личного кабинета
│   │   ├── clinic/       # Страница о клинике
│   │   ├── doctors/      # Страницы врачей
│   │   └── services/     # Страницы услуг
│   ├── components/        # React компоненты
│   │   ├── common/       # Общие UI компоненты
│   │   └── SM*/          # Специфичные компоненты проекта
│   ├── data/             # Данные и API слой
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Утилиты (Prisma, Cloudinary)
│   ├── types/            # TypeScript типы
│   └── utils/            # Вспомогательные функции
├── public/               # Статические файлы
└── scripts/              # Вспомогательные скрипты
```

## Модели базы данных

Основные сущности:
- **Service** - Медицинские услуги
- **Specialist** - Врачи и специалисты
- **Category** - Категории услуг и специалистов
- **Patient** - Пациенты с различными ролями (USER, ADMIN, CHIEF_DOCTOR, OPERATOR)
- **Feedback** - Отзывы на услуги и общие отзывы
- **Question** - FAQ вопросы
- **Letter** - Обращения к главному врачу
- **OperatorChat** - Чаты с операторами
- **Material** - Новости и материалы клиники
- **Vacancy** - Вакансии
- **Partner** - Партнеры клиники
- **Contacts** - Контактная информация

## Роли пользователей

- **USER** - Обычный пациент
- **ADMIN** - Администратор с полным доступом
- **CHIEF_DOCTOR** - Главный врач (обработка обращений)
- **OPERATOR** - Оператор (работа с чатами)

## Аутентификация

Приложение использует NextAuth v4 для управления сессиями и авторизации. Доступны следующие провайдеры:
- Credentials (email/password)

## Разработка

### Добавление новой миграции

```bash
# После изменения schema.prisma
npm run prisma:migrate
```

### Работа с изображениями

Все изображения загружаются через Cloudinary. Используйте компонент `SMCloudinaryImage` для отображения изображений с оптимизацией.

### Линтинг

```bash
npm run lint
```

## Production

Для деплоя на production:

1. Настройте переменные окружения на сервере
2. Соберите проект: `npm run build`
3. Примените миграции: `npm run prisma:migrate`
4. Запустите сервер: `npm start`

## Лицензия

Проект является коммерческим продуктом.

## Контакты

Для вопросов и предложений обращайтесь к команде разработки.
