'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X, FileText, Shield, Calendar } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'contract' | 'privacy' | 'consent';
}

export function DocumentModal({ isOpen, onClose, documentType }: DocumentModalProps) {
  const { contacts } = useContacts();

  // Prepare contact data with fallbacks
  const phoneNumber = contacts?.phone_number || '+375296320707';
  const phoneNumberSec = contacts?.phone_number_sec || '';
  const email = contacts?.email || 'info@doctorfamily.by';
  const address = contacts?.address || 'Витебская область, г. Новополоцк, ул. Парковая, д. 16А, пом.1';
  const getDocumentContent = () => {
    switch (documentType) {
      case 'contract':
        return {
          title: 'Договор на оказание медицинских услуг',
          icon: FileText,
          content: (
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3">1. Общие положения</h3>
                <div className="space-y-3 text-gray-700">
                  <p>1.1. Настоящий договор регулирует отношения между Обществом с ограниченной ответственностью "Доктор Фемели" (далее - Исполнитель) и физическим лицом (далее - Заказчик) по оказанию медицинских услуг.</p>
                  <p>1.2. Договор заключается путем подписания Заказчиком настоящего договора при первом обращении в медицинскую организацию.</p>
                  <p>1.3. Подписывая настоящий договор, Заказчик подтверждает, что ознакомлен с условиями оказания медицинских услуг, прейскурантом цен и правилами внутреннего распорядка медицинской организации.</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3">2. Предмет договора</h3>
                <div className="space-y-3 text-gray-700">
                  <p>2.1. Исполнитель обязуется оказать Заказчику медицинские услуги в соответствии с медицинскими показаниями, а Заказчик обязуется оплатить эти услуги.</p>
                  <p>2.2. Перечень услуг определяется на основании обращения Заказчика и рекомендаций врача.</p>
                  <p>2.3. Все медицинские услуги оказываются на основании лицензии на осуществление медицинской деятельности №02040/8440 от 24 февраля 2021 года.</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3">3. Права и обязанности сторон</h3>
                <div className="space-y-3 text-gray-700">
                  <p className="font-medium">3.1. Исполнитель обязуется:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Оказать медицинские услуги надлежащего качества в соответствии с медицинскими стандартами</li>
                    <li>Обеспечить конфиденциальность информации о Заказчике</li>
                    <li>Предоставить полную информацию о состоянии здоровья, методах диагностики и лечения</li>
                    <li>Соблюдать санитарно-гигиенические нормы и правила</li>
                  </ul>
                  <p className="font-medium mt-4">3.2. Заказчик обязуется:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Предоставить достоверную информацию о состоянии своего здоровья</li>
                    <li>Выполнять рекомендации врача</li>
                    <li>Своевременно оплатить оказанные услуги</li>
                    <li>Соблюдать правила внутреннего распорядка медицинской организации</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3">4. Стоимость услуг и порядок расчетов</h3>
                <div className="space-y-3 text-gray-700">
                  <p>4.1. Стоимость медицинских услуг определяется в соответствии с действующим прейскурантом цен Исполнителя.</p>
                  <p>4.2. Оплата услуг производится Заказчиком до или после оказания услуг наличным или безналичным способом.</p>
                  <p>4.3. В случае изменения стоимости услуг Исполнитель обязан уведомить Заказчика до начала оказания услуг.</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3">5. Ответственность сторон</h3>
                <div className="space-y-3 text-gray-700">
                  <p>5.1. За неисполнение или ненадлежащее исполнение обязательств по настоящему договору стороны несут ответственность в соответствии с действующим законодательством Республики Беларусь.</p>
                  <p>5.2. Исполнитель не несет ответственности за результаты лечения при несоблюдении Заказчиком рекомендаций врача.</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3">6. Срок действия договора</h3>
                <div className="space-y-3 text-gray-700">
                  <p>6.1. Настоящий договор вступает в силу с момента его подписания сторонами и действует до полного исполнения сторонами своих обязательств.</p>
                  <p>6.2. Договор может быть расторгнут по соглашению сторон или в одностороннем порядке по основаниям, предусмотренным действующим законодательством.</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3">7. Реквизиты исполнителя</h3>
                <div className="space-y-2 text-gray-700">
                  <p><span className="font-medium">Полное наименование:</span> Общество с ограниченной ответственностью "Доктор Фемели"</p>
                  <p><span className="font-medium">УНП:</span> 391788009</p>
                  <p><span className="font-medium">Расчётный счёт:</span> BY67 BPSB 3012 3410 2901 4933 0000</p>
                  <p><span className="font-medium">Банк:</span> ОАО "Сбер Банк"</p>
                  <p><span className="font-medium">Лицензия:</span> №02040/8440 от 24 февраля 2021 года</p>
                  <p><span className="font-medium">Адрес:</span> {address}</p>
                  <p><span className="font-medium">Телефон:</span> {phoneNumber}</p>
                  {phoneNumberSec && <p><span className="font-medium">Дополнительный телефон:</span> {phoneNumberSec}</p>}
                  <p><span className="font-medium">Email:</span> {email}</p>
                </div>
              </section>
            </div>
          )
        };

      case 'privacy':
        return {
          title: 'Политика конфиденциальности',
          icon: Shield,
          content: (
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3">1. Общие положения</h3>
                <div className="space-y-3 text-gray-700">
                  <p>1.1. Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пациентов ООО "Доктор Фемели".</p>
                  <p>1.2. Целью настоящей Политики является обеспечение надлежащей защиты информации о пациентах, в том числе их персональных данных, от несанкционированного доступа и разглашения.</p>
                  <p>1.3. Отношения, связанные с обработкой персональных данных, регулируются законодательством Республики Беларусь.</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3">2. Персональные данные</h3>
                <div className="space-y-3 text-gray-700">
                  <p>2.1. Под персональными данными понимается любая информация, относящаяся к прямо или косвенно определенному или определяемому физическому лицу.</p>
                  <p className="font-medium">2.2. Мы собираем следующие категории персональных данных:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Фамилия, имя, отчество</li>
                    <li>Дата рождения</li>
                    <li>Контактная информация (телефон, email, адрес)</li>
                    <li>Паспортные данные</li>
                    <li>Медицинская информация (анамнез, диагнозы, результаты обследований)</li>
                    <li>Информация о страховом полисе (при наличии)</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3">3. Цели обработки персональных данных</h3>
                <div className="space-y-3 text-gray-700">
                  <p className="font-medium">3.1. Персональные данные обрабатываются в следующих целях:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Оказание медицинских услуг надлежащего качества</li>
                    <li>Ведение медицинской документации</li>
                    <li>Исполнение договоров на оказание медицинских услуг</li>
                    <li>Информирование о результатах обследований</li>
                    <li>Напоминание о запланированных визитах</li>
                    <li>Информирование о новых услугах и акциях (при наличии согласия)</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3">4. Правовые основания обработки</h3>
                <div className="space-y-3 text-gray-700">
                  <p className="font-medium">4.1. Обработка персональных данных осуществляется на основании:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Письменного согласия пациента на обработку персональных данных</li>
                    <li>Договора на оказание медицинских услуг</li>
                    <li>Требований законодательства Республики Беларусь</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3">5. Способы обработки и защиты данных</h3>
                <div className="space-y-3 text-gray-700">
                  <p>5.1. Обработка персональных данных осуществляется как с использованием средств автоматизации, так и без использования таких средств.</p>
                  <p className="font-medium">5.2. Для защиты персональных данных применяются следующие меры:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Ограничение доступа к персональным данным</li>
                    <li>Использование средств защиты информации</li>
                    <li>Контроль за действиями с персональными данными</li>
                    <li>Обучение персонала правилам работы с персональными данными</li>
                    <li>Резервное копирование данных</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3">6. Права пациентов</h3>
                <div className="space-y-3 text-gray-700">
                  <p className="font-medium">6.1. Пациент имеет право:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Получать информацию об обработке своих персональных данных</li>
                    <li>Требовать уточнения, блокирования или уничтожения персональных данных</li>
                    <li>Отозвать согласие на обработку персональных данных</li>
                    <li>Обжаловать действия или бездействие оператора в уполномоченный орган</li>
                    <li>Получить копию своих персональных данных</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3">7. Срок хранения данных</h3>
                <div className="space-y-3 text-gray-700">
                  <p>7.1. Персональные данные хранятся не дольше, чем этого требуют цели их обработки, и в соответствии с требованиями законодательства Республики Беларусь.</p>
                  <p>7.2. Медицинская документация хранится в течение сроков, установленных нормативными правовыми актами.</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3">8. Контактная информация</h3>
                <div className="space-y-2 text-gray-700">
                  <p>8.1. По всем вопросам, связанным с обработкой персональных данных, вы можете обратиться:</p>
                  <p><span className="font-medium">Телефон:</span> {phoneNumber}</p>
                  {phoneNumberSec && <p><span className="font-medium">Дополнительный телефон:</span> {phoneNumberSec}</p>}
                  <p><span className="font-medium">Email:</span> {email}</p>
                  <p><span className="font-medium">Адрес:</span> {address}</p>
                </div>
              </section>
            </div>
          )
        };

      case 'consent':
        return {
          title: 'Согласие на обработку персональных данных',
          icon: FileText,
          content: (
            <div className="space-y-6">
              <section>
                <div className="space-y-4 text-gray-700">
                  <p>Я, _____________________________________________ (ФИО),</p>
                  <p>Паспорт: серия _____ номер _____________, выдан _________________________________</p>
                  <p>Дата выдачи: __________________</p>
                  <p>Адрес регистрации: _________________________________________________________</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3">Настоящим подтверждаю:</h3>
                <div className="space-y-3 text-gray-700">
                  <p>1. Что я ознакомлен(а) с Политикой конфиденциальности ООО "Доктор Фемели" в отношении обработки персональных данных.</p>
                  <p>2. Что мне разъяснены права и обязанности, связанные с предоставлением персональных данных.</p>
                  <p>3. Что я понимаю последствия отзыва данного согласия.</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3">Даю свое согласие:</h3>
                <div className="space-y-3 text-gray-700">
                  <p>На обработку моих персональных данных ООО "Доктор Фемели" (УНП 391788009), расположенному по адресу: {address}</p>

                  <p className="font-medium mt-4">Перечень персональных данных, на обработку которых дается согласие:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Фамилия, имя, отчество</li>
                    <li>Дата и место рождения</li>
                    <li>Пол</li>
                    <li>Гражданство</li>
                    <li>Паспортные данные</li>
                    <li>Адрес регистрации и фактического проживания</li>
                    <li>Контактные данные (телефон, email)</li>
                    <li>Медицинские данные (анамнез, результаты обследований, диагнозы)</li>
                    <li>Сведения о страховом полисе (при наличии)</li>
                    <li>Фотографии (при необходимости для медицинской документации)</li>
                  </ul>

                  <p className="font-medium mt-4">Цели обработки персональных данных:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Оказание медицинских услуг</li>
                    <li>Ведение медицинской документации</li>
                    <li>Исполнение договора на оказание медицинских услуг</li>
                    <li>Информирование о результатах обследований и лечения</li>
                    <li>Напоминание о предстоящих визитах</li>
                    <li>Информирование о новых медицинских услугах (при согласии)</li>
                  </ul>

                  <p className="font-medium mt-4">Перечень действий с персональными данными:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Сбор</li>
                    <li>Систематизация</li>
                    <li>Накопление</li>
                    <li>Хранение</li>
                    <li>Уточнение (обновление, изменение)</li>
                    <li>Использование</li>
                    <li>Передача (в случаях, предусмотренных законодательством)</li>
                    <li>Обезличивание</li>
                    <li>Блокирование</li>
                    <li>Уничтожение</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3">Дополнительные условия:</h3>
                <div className="space-y-3 text-gray-700">
                  <p>1. Настоящее согласие действует со дня его подписания до дня отзыва в письменной форме.</p>
                  <p>2. Настоящее согласие может быть отозвано мною в письменной форме путем направления письменного заявления на адрес оператора.</p>
                  <p>3. В случае отзыва согласия на обработку персональных данных оператор вправе продолжить обработку персональных данных без моего согласия при наличии оснований, указанных в законодательстве.</p>
                  <p>4. Согласие на обработку персональных данных моих несовершеннолетних детей дается отдельно в установленном порядке.</p>
                </div>
              </section>

              <section>
                <div className="space-y-4 text-gray-700 mt-6">
                  <p>Дата: «___» _____________ 20___ г.</p>
                  <p>Подпись: _________________ / _______________________</p>
                  <p className="text-sm text-gray-600 italic mt-4">
                    * Данная форма является образцом. При первом обращении в клинику вам будет предложен договор для подписания с заполнением всех необходимых данных.
                  </p>
                </div>
              </section>
            </div>
          )
        };

      default:
        return null;
    }
  };

  const document = getDocumentContent();
  if (!document) return null;

  const Icon = document.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="sticky top-6 right-6 float-right w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200 hover:scale-110 z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-[#18A36C]/5 via-[#18A36C]/10 to-[#18A36C]/5 p-6 sm:p-8 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#18A36C] to-[#15905f] rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#2E2E2E] mb-2">
                    {document.title}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Действует с 24 февраля 2021 года</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="prose prose-sm sm:prose max-w-none"
              >
                {document.content}
              </motion.div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 pt-6 border-t border-gray-200"
              >
                <div className="bg-gradient-to-br from-[#18A36C]/5 to-transparent p-4 sm:p-6 rounded-xl border border-[#18A36C]/10">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Если у вас остались вопросы по данному документу, обратитесь к администратору клиники или позвоните по телефону{' '}
                    <a href={`tel:${phoneNumber.replace(/[^\d+]/g, '')}`} className="text-[#18A36C] hover:underline font-medium">
                      {phoneNumber}
                    </a>
                    {phoneNumberSec && (
                      <>
                        {' или '}
                        <a href={`tel:${phoneNumberSec.replace(/[^\d+]/g, '')}`} className="text-[#18A36C] hover:underline font-medium">
                          {phoneNumberSec}
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
