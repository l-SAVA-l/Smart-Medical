3 Реализация

Разработанный информационный интернет-ресурс Doctor Family представляет собой полнофункциональное веб-приложение для автоматизации деятельности медицинской клиники. Реализация выполнена в рамках единой архитектуры на базе фреймворка Next.js версии 16, что обеспечивает совмещение клиентской и серверной логики в одном проекте, упрощает развёртывание и сопровождение программного комплекса. Языком разработки выбран TypeScript. В качестве СУБД используется PostgreSQL, доступ к данным осуществляется через Prisma ORM версии 6.

В приложении реализованы публичный сайт клиники, личный кабинет пациента, административная панель и специализированные рабочие места оператора и главного врача. Ниже приведено описание структуры проекта, организации навигации, клиентской и серверной частей, а также спецификации файлов проекта.

3.1. Клиентская часть

Архитектура клиентской части построена по принципу разделения ответственности между слоями. Каталог src/app содержит страницы и макеты Next.js App Router. Каталог src/components включает переиспользуемые React-компоненты интерфейса. Каталог src/hooks инкапсулирует клиентскую логику загрузки данных, опроса сервера и подписки на события. Типы данных описаны в src/types, конфигурация навигации и контактов вынесена в JSON-файлы каталога src/config.

Организация модулей и экспортов

Проект не использует классовую объектно-ориентированную модель в традиционном смысле. Клиентский код организован как набор модулей TypeScript с директивами import и export. Псевдоним @/ указывает на каталог src/ и упрощает подключение компонентов и хуков.

Основной единицей повторного использования выступает функциональный React-компонент. Компонент объявляется как именованная функция и экспортируется для подключения на страницах. Провайдеры Providers, AlertProvider и Router оборачивают дерево компонентов и передают общие данные через контекст React. Хуки, например useAppointmentsRealtime или useLetterNotifications, также являются экспортируемыми функциями и инкапсулируют состояние и побочные эффекты. Страницы в src/app импортируют нужные компоненты и хуки, формируя экранные формы без дублирования логики.

Компоненты интерфейса образуют двухуровневую библиотеку. В подкаталоге common собраны базовые элементы, из которых строятся экранные формы: кнопки SMButton, поля ввода SMInput и SMTextarea, карточки SMCard, диалоги SMDialog, вкладки SMTabs, аккордеоны SMAccordion, пагинация SMPagination, поиск SMSearch, система уведомлений SMAlert с провайдером AlertProvider. Предметные компоненты с префиксом SM сгруппированы по разделам сайта. SMServices отвечает за каталог услуг и древовидное меню категорий. SMDoctor реализует список специалистов и карточки врачей. SMClinic объединяет страницы о клинике, партнёрах, отзывах, вакансиях и лицензиях. SMAccount содержит личный кабинет пациента с профилем, записями, материалами и перепиской с главным врачом. SMAdmin включает таблицы, формы редактирования и модальные окна административной панели. Отдельно выделены SMAuthModals, SMBookingModal, AIAssistant, Header, Footer, LetterNotifications и ChatNotifications.

Навигация по сайту

Маршруты приложения задаются файловой структурой App Router. Каждая папка в src/app соответствует сегменту URL, динамические параметры описываются именами в квадратных скобках.

Публичная часть сайта доступна без авторизации. Главная страница расположена по адресу /. Каталог услуг начинается с /services, список услуг выбранной категории открывается по /services/{категория}, подробная карточка услуги по /services/{категория}/{id}. Раздел специалистов построен по той же схеме: /doctors, /doctors/{направление}, /doctors/{направление}/{id}. Раздел о клинике доступен по /clinic и включает подстраницы /clinic/licenses, /clinic/partners, /clinic/reviews, /clinic/requisites, /clinic/vacancies, а также блок вопросов и ответов по /clinic/questions и /clinic/questions/{категория}. Контакты с картой клиники расположены по /contacts, справочная информация для пациентов по /patient.

Личный кабинет пациента работает по адресу /account. На главной странице кабинета отображаются сводка и форма редактирования профиля. Записи на приём доступны по /account/appointments, материалы клиники по /account/materials, обращения главному врачу по /account/contact. Переходы между разделами выполняются через боковое меню SMNavigableAccountMenu.

Административная панель размещена по префиксу /admin. Основные разделы включают /admin/chat (чаты с пациентами), /admin/services, /admin/service-categories, /admin/specialists, /admin/appointments, /admin/materials, /admin/questions, /admin/feedbacks, /admin/partners, /admin/vacancies, /admin/contacts, /admin/letters и /admin/users. Состав видимых пунктов меню в SMAdminMenu зависит от роли. Оператор видит только чат. Администратор имеет доступ ко всем разделам, кроме писем пациентов. Главный врач работает со всеми разделами, включая обработку обращений и управление учётными записями.

Для разделов с иерархической структурой применён единый паттерн навигации. Компонент SMRouter хранит текущий маршрут в контексте React и выполняет переходы через history.pushState без полной перезагрузки страницы. Страницы account, services, doctors и clinic синхронизируют адрес Next.js с состоянием SMRouter. Боковые меню SMNavigableServicesMenu, SMNavigableClinicMenu и SMNavigableAccountMenu формируют дерево разделов и вызывают функцию navigate при выборе пункта. Компонент SMBreadcrumb отображает цепочку переходов на внутренних страницах.

Корневой макет layout.tsx задаёт общую оболочку публичного сайта. В него входят шапка Header с поиском, телефоном клиники и кнопкой записи, основное содержимое страницы, подвал Footer, плавающий AIAssistant, компоненты LetterNotifications и ChatNotifications, окно согласия на cookie CookieConsent, подсказка Onboarding и ScrollToTop. Полный листинг размещён в приложении Г. Ниже представлен отрывок кода корневого макета src/app/layout.tsx.

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <MenuProvider>
            <Router>
              <Header />
              <main>{children}</main>
              <Footer />
              <AIAssistant />
              <LetterNotifications />
              <ChatNotifications />
            </Router>
          </MenuProvider>
        </Providers>
      </body>
    </html>
  );
}
```

Провайдеры контекста вынесены в providers.tsx и оборачивают всё дерево компонентов. SessionProvider передаёт данные сессии NextAuth на клиент. AlertProvider обеспечивает единый механизм всплывающих уведомлений об успехе и ошибках. BookingModalProvider управляет глобальным состоянием модального окна записи на приём, которое можно открыть из шапки сайта или с карточки услуги. Ниже представлен отрывок кода модуля провайдеров src/app/providers.tsx.

```tsx
export const Providers = ({ children }: React.PropsWithChildren) => {
  return (
    <SessionProvider>
      <AlertProvider>
        <BookingModalProvider>{children}</BookingModalProvider>
      </AlertProvider>
    </SessionProvider>
  );
};
```

Шапка Header объединяет несколько сценариев работы пользователя. Контактная строка показывает адрес и телефон клиники, загружаемые через хук useContacts. Поле поиска открывает модальное окно SMSearch с запросом к /api/search. Кнопка профиля SMProfileButton переключает пользователя между формой входа и переходом в личный кабинет. Бургер-меню SMBurgerMenu и модальное окно NavigationModal дублируют структуру основного меню на мобильных устройствах. Конфигурация пунктов меню читается из navigation.json.

Оформление интерфейса построено на Tailwind CSS 4 с единой системой отступов и адаптивной сеткой. Material-UI применяется для отдельных элементов управления, Radix UI обеспечивает доступность диалогов и выпадающих списков, Framer Motion используется для анимации AI-помощника и переходов. Изображения услуг, специалистов и материалов отображаются через SMCloudinaryImage с оптимизацией загрузки. В административной панели для загрузки файлов применяются компоненты ImageUploader и SMImageUpload.

Ключевые пользовательские сценарии реализованы через модальные окна, чтобы не прерывать просмотр основного контента. SMAuthModals обрабатывает вход, регистрацию и восстановление пароля. SMBookingModal проводит пользователя через выбор специалиста, услуги, даты и времени с запросом свободных слотов к /api/appointments/availability. LeaveReviewModal позволяет оставить отзыв о клинике. В личном кабинете используются SMEditProfileModal, SMChangePasswordModal и SMAvatarCropModal для работы с профилем.

Компонент AIAssistant встроен на все публичные страницы и выполняет две функции. В режиме виртуального помощника пользователь получает ответы через запрос к /api/chat, история сообщений сохраняется в localStorage браузера. После авторизации доступна вкладка чата с оператором OperatorChatContent, которая работает через API /api/operator-chat. При первом открытии показывается AIOnboardingModal с краткой инструкцией.

Клиентская логика обновления данных вынесена в хуки каталога src/hooks. useAppointmentsRealtime устанавливает соединение SSE с /api/appointments/stream и обновляет список записей при смене статуса. useLetterNotifications, usePatientChatNotifications, useOperatorChatNotifications и useChiefDoctorNotifications периодически опрашивают сервер и обновляют счётчики непрочитанных сообщений в шапке и админ-панели. useServerPagination и useUrlPagination обеспечивают постраничный вывод в таблицах администратора. useAdminSession и useUnreadCounts используются внутри AdminProviders для контроля доступа и отображения бейджей на пунктах меню.

Административная панель имеет собственный макет admin/layout.tsx с провайдером AdminProviders. Каждый раздел построен по одному шаблону: боковое меню SMAdminMenu, таблица записей с поиском и фильтрацией, кнопки добавления и редактирования, модальные формы. Для чатов и писем реализованы отдельные окна переписки ChatModal. Компонент SMAdminSection унифицирует заголовок и действия раздела. При входе оператора показывается OperatorWelcome с переходом в рабочий чат.

3.2. Серверная часть

Серверная логика реализована через Route Handlers Next.js. Обработчики размещены в src/app/api и сгруппированы по предметным областям.

Организация серверных модулей

Каждый API-маршрут описан файлом route.ts. Из модуля наружу экспортируются асинхронные функции GET, POST, PUT, PATCH или DELETE, которые Next.js регистрирует как обработчики HTTP-запросов. Бизнес-логика вынесена в каталоги src/lib и src/utils и подключается через именованный импорт. Модуль appointments.ts экспортирует константы рабочих часов и функции validateWorkingHours, findConflictingAppointment. Модуль adminAuth.ts экспортирует функцию checkAdmin. Модуль utils/auth.ts экспортирует тип UserRole, массив ADMIN_ROLES и функции hasAdminAccess, canManageAdmins. Модуль prisma.ts экспортирует единственный экземпляр клиента базы данных, переиспользуемый во всех обработчиках. Для структур данных применяются интерфейсы TypeScript, например AppointmentChangeEvent в appointmentEvents.ts и TalonAppointmentData в talon/buildTalonHtml.ts. Единственным пользовательским классом является EmailNotConfiguredError в email/send.ts, он наследует стандартный Error и сигнализирует об отсутствии настроек SMTP. Ниже представлен отрывок кода модуля проверки ролей src/utils/auth.ts.

```ts
export type UserRole = "USER" | "ADMIN" | "CHIEF_DOCTOR" | "OPERATOR";
export const ADMIN_ROLES: UserRole[] = ["ADMIN", "CHIEF_DOCTOR", "OPERATOR"];

export function hasAdminAccess(role?: UserRole | string | null): boolean {
  if (!role) return false;
  return ADMIN_ROLES.includes(role as UserRole);
}
```

Публичные эндпоинты отдают справочные данные без авторизации. К ним относятся /api/services и /api/services/[id] для каталога услуг, /api/specialists для списка врачей, /api/service-categories и /api/services-menu для построения меню, /api/contacts, /api/materials, /api/vacancies, /api/partners, /api/clinic-reviews, /api/clinic-faqs и /api/question-categories. Эндпоинт /api/search выполняет поиск по услугам и специалистам, /api/geocode возвращает координаты адреса клиники для карты.

Защищённые эндпоинты требуют активной сессии NextAuth. /api/appointments обслуживает создание, просмотр и отмену записей пациента. /api/letters и /api/letters/[id] работают с обращениями главному врачу и цепочкой сообщений LetterMessage. /api/operator-chat управляет чатами пациента с оператором, назначением оператора и учётом непрочитанных сообщений. /api/upload принимает файлы от авторизованных пользователей и сохраняет их в Cloudinary.

Административные эндпоинты с префиксом /api/admin реализуют CRUD-операции над сущностями системы. Отдельные маршруты существуют для услуг, категорий услуг, специалистов, отзывов, вопросов, партнёров, вакансий, контактов, материалов, записей на приём, пользователей и писем. Эндпоинт /api/admin/auth возвращает роль текущего пользователя для построения меню. /api/admin/unread-counts агрегирует счётчики непрочитанных обращений для главного врача и операторов.

Доступ к PostgreSQL выполняется через единый клиент Prisma. В режиме разработки экземпляр кэшируется в globalThis, чтобы избежать исчерпания соединений при горячей перезагрузке. Ниже представлен отрывок кода инициализации клиента Prisma src/lib/prisma.ts.

```ts
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
```

Схема prisma/schema.prisma описывает восемнадцать моделей согласно приложению А.1. Миграции версионируются в prisma/migrations и применяются командой prisma migrate deploy.

Аутентификация реализована через NextAuth 4 в маршруте /api/auth/[...nextauth]. Поддерживаются провайдер Credentials (логин и пароль с проверкой bcryptjs) и GoogleProvider для OAuth. При успешном входе формируется JWT-сессия, в которую через callbacks записываются id пользователя и значение поля role из таблицы patients. Дополнительные маршруты /api/auth/register, /api/auth/profile, /api/auth/change-password и /api/auth/avatar обслуживают регистрацию, обновление профиля, смену пароля и загрузку аватара.

Роли пользователей заданы перечислением Role. Ниже представлен отрывок кода перечисления Role из файла prisma/schema.prisma.

```prisma
enum Role {
  USER
  ADMIN
  CHIEF_DOCTOR
  OPERATOR
}
```

Разграничение доступа выполняется на двух уровнях. Middleware в src/middleware.ts перехватывает запросы к /admin/*, извлекает JWT и перенаправляет неавторизованных пользователей на главную страницу. Для оператора дополнительно ограничивается список доступных маршрутов. Ниже представлен отрывок кода проверки доступа к админ-панели src/middleware.ts.

```ts
if (pathname.startsWith("/admin")) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !hasAdminAccess(token.role)) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (isChatOnlyAccess(token.role) && !pathname.startsWith("/admin/chat")) {
    return NextResponse.redirect(new URL("/admin/chat", request.url));
  }
}
```

На уровне API функция checkAdmin из adminAuth.ts проверяет роли ADMIN и CHIEF_DOCTOR. Доступ к /api/admin/letters и назначение администраторов через /api/admin/users разрешены только главному врачу. Утилиты hasAdminAccess, hasFullAdminAccess, isChatOnlyAccess и canManageAdmins в src/utils/auth.ts используются и на клиенте, и на сервере.

Подсистема записи на приём сосредоточена в маршрутах /api/appointments и вспомогательном модуле src/lib/appointments.ts. При создании записи проверяется связь врача и услуги в таблице ServiceSpecialist, попадание времени в рабочие часы клиники (с 8:00 до 20:00), отсутствие пересечения с существующими записями со статусами pending, confirmed, completed и no_show. Ниже представлен отрывок кода валидации записи на приём из обработчика src/app/api/appointments/route.ts.

```ts
const linked = await specialistProvidesService(specialistIdNum, serviceIdNum);
if (!linked) {
  return NextResponse.json({ error: "Выбранный врач не оказывает эту услугу" }, { status: 400 });
}
const hoursError = validateWorkingHours(scheduled);
const conflict = await findConflictingAppointment(specialistIdNum, scheduled, duration);
```

После создания или изменения записи модуль appointmentEvents.ts публикует событие, которое получают подписчики SSE-канала /api/appointments/stream. Эндпоинт /api/appointments/availability формирует список свободных слотов на выбранную дату. Отправка талона выполняется маршрутом /api/appointments/[id]/send-talon: функции buildTalonHtml и sendTalonEmail из каталога src/lib/talon формируют HTML-документ и доставляют его через SMTP.

Подсистема коммуникаций включает два независимых канала. Обращения к главному врачу хранятся в моделях Letter и LetterMessage, поддерживают тему, текст, ответ врача и флаг has_new_patient_message для индикации новых сообщений пациента. Чаты с операторами используют модели OperatorChat и OperatorChatMessage со статусами WAITING, ACTIVE и CLOSED. Оператор назначает себя на чат из очереди, после чего стороны обмениваются сообщениями с учётом непрочитанных для каждой роли.

Управление медиаконтентом выполняется через Cloudinary. Конфигурация подключения вынесена в src/lib/cloudinary.ts. Загруженные URL сохраняются в полях image_url сущностей Service, Specialist, Material и других. Для массовой первичной загрузки изображений предусмотрен скрипт scripts/upload-to-cloudinary.ts.

Бизнес-логика, не привязанная к HTTP-обработчикам, сосредоточена в src/lib. Помимо уже упомянутых модулей appointments, appointmentEvents, adminAuth и talon, каталог email/ содержит конфигурацию SMTP и функцию send для почтовых уведомлений. Модуль getServicesMenu.ts формирует древовидное меню услуг для клиентской части. Такое разделение позволяет вызывать одни и те же функции из нескольких API-маршрутов и упрощает сопровождение кода.

Инициализация базы данных автоматизирована npm-скриптами. Команда prisma:migrate применяет миграции, prisma:seed заполняет начальные данные, prisma:normalize:new-structure выполняет нормализацию после обновления схемы. Команда setup объединяет миграцию, генерацию клиента Prisma и нормализацию для развёртывания в новой среде.

3.3. Спецификация файлов проекта

В отличие от классических учебных проектов с локальными каталогами изображений и отдельным файлом style.css, проект Doctor Family опирается на структуру, описанную в пунктах 3.1 и 3.2. Исходный код сосредоточен в каталоге src, где app содержит страницы и API-маршруты, components и hooks обеспечивают клиентскую часть, lib и utils содержат серверную бизнес-логику. Глобальные стили заданы файлом src/app/globals.css с использованием Tailwind CSS. Логотипы клиники реализованы как React-компоненты в каталоге icons. Статический текст интерфейса, не управляемый через админ-панель, вынесен в JSON-файлы каталога config, включая navigation.json, contacts.json, homePage.json и другие. Схема и миграции базы данных размещены в каталоге prisma, служебные скрипты сопровождения в каталоге scripts.

Параметры подключения к внешним сервисам задаются файлом .env в корне проекта. Файл создаётся при развёртывании и не включается в репозиторий. Переменная DATABASE_URL указывает строку подключения к PostgreSQL. NEXTAUTH_URL и NEXTAUTH_SECRET обеспечивают работу сессий NextAuth. Переменные CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET и NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME настраивают загрузку и отображение медиаконтента. Группа SMTP_* задаёт отправку талонов на приём. Дополнительно могут быть указаны GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET для OAuth, OPENROUTER_API_KEY для AI-помощника и NEXT_PUBLIC_SITE_URL для внешних запросов.

Изображения и видео услуг, специалистов, партнёров, материалов и аватаров не хранятся в файловой системе проекта. Медиафайлы загружаются в облако Cloudinary через API /api/upload, после чего ссылка сохраняется в PostgreSQL и отображается компонентом SMCloudinaryImage. Поддерживаются форматы JPG, PNG, WebP, GIF для изображений и MP4, WebM, MOV для видео. Операционные данные клиники, включая записи на приём, пользователей, письма и чаты, хранятся в базе PostgreSQL согласно схеме prisma/schema.prisma и файлам миграций в prisma/migrations.
