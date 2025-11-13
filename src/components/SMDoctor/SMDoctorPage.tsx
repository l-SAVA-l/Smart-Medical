import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Calendar, Award, GraduationCap, Users, Image as ImageIcon } from 'lucide-react';
import { Button } from '../common/SMButton/SMButton';
import { Card } from '../common/SMCard/SMCard';
import { useRouter } from '../SMRouter/SMRouter';
import { Breadcrumb } from '../SMBreadcrumb/SMBreadcrumb';
import { ImageWithFallback } from '../SMImage/ImageWithFallback';
import commonConfig from '@/config/common.json';

interface DoctorPageProps {
  doctorId: string;
  categorySlug: string;
}

interface Specialist {
  id: number;
  name: string;
  specialization: string;
  qualification: string;
  experience: number;
  grade: number;
  image_url: string;
  activity_area: string | null;
  education_details: string | null;
  conferences: string | null;
  specializations: string[];
  education: string[];
  work_examples: Array<{ title: string; images: string[] }> | null;
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

export function DoctorPage({ doctorId, categorySlug }: DoctorPageProps) {
  const { navigate } = useRouter();
  const [doctor, setDoctor] = useState<Specialist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchDoctor = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const id = parseInt(doctorId);
        if (isNaN(id)) {
          setError('Неверный ID специалиста');
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/specialists/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Специалист не найден');
          } else {
            throw new Error('Failed to fetch specialist');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setDoctor(data);
        
        // Обновляем title страницы
        if (data) {
          document.title = `${data.name} - ${data.category.name} | Медицинский центр Doctor Family`;
        }
      } catch (err) {
        console.error('Error fetching specialist:', err);
        setError('Не удалось загрузить данные специалиста');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl text-[#2E2E2E] mb-4">
            {commonConfig.messages.notFound.doctor.title}
          </h1>
          <p className="text-gray-600 mb-6">
            {commonConfig.messages.notFound.doctor.description}
          </p>
          <Button onClick={() => navigate('/doctors')}>
            {commonConfig.messages.notFound.doctor.buttonText}
          </Button>
        </div>
      </div>
    );
  }

  const handleBookAppointment = () => {
    console.log(`Booking appointment with ${doctor.name}`);
  };

  // Преобразуем conferences из строки в массив
  const conferencesList = doctor.conferences 
    ? doctor.conferences.split(',').map(c => c.trim()).filter(Boolean)
    : [];

  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Специалисты', href: '/doctors' },
    { label: doctor.category.name, href: `/doctors/${categorySlug}` },
    { label: doctor.name }
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white rounded-lg border border-[#E8E6E3] p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <div className="flex-shrink-0 mx-auto lg:mx-0">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={doctor.image_url}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left">
              <div className="mb-4">
                <h1 className="text-2xl lg:text-3xl text-[#2E2E2E] mb-2">
                  {doctor.name}
                </h1>
                <p className="text-lg text-gray-600 mb-3">{doctor.specialization}</p>
                
                <div className="text-gray-600 mb-4 flex flex-col gap-1 items-center lg:items-start">
                  <span>{doctor.qualification}</span>
                  <span>Стаж: {doctor.experience} {doctor.experience === 1 ? 'год' : doctor.experience < 5 ? 'года' : 'лет'}</span>
                </div>

                <div className="flex items-center gap-1 justify-center lg:justify-start mb-6">
                  {[...Array(doctor.grade)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#18A36C] text-[#18A36C]" />
                  ))}
                  {[...Array(5 - doctor.grade)].map((_, i) => (
                    <Star key={i + doctor.grade} className="w-5 h-5 fill-gray-200 text-gray-200" />
                  ))}
                  <span className="text-gray-600 ml-2">
                    {doctor.grade}/5
                  </span>
                </div>
              </div>

              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="text-lg text-[#2E2E2E] mb-3">
                  {commonConfig.messages.booking.title}
                </h3>
                <Button
                  onClick={handleBookAppointment}
                  className="w-full lg:w-auto bg-[#18A36C] hover:bg-[#18A36C]/90 text-white px-8 py-4 h-auto text-lg rounded-lg transition-all duration-300"
                >
                  {commonConfig.messages.booking.buttonText}
                  <Calendar className="w-5 h-5 ml-[2.5px]" />
                </Button>
              </div>
            </div>
          </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#18A36C]/10 rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5 text-[#18A36C]" />
                  </div>
                  <h2 className="text-xl text-[#2E2E2E]">Направления деятельности</h2>
                </div>
                <ul className="space-y-2">
                  {doctor.specializations.length > 0 ? (
                    doctor.specializations.map((spec, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700">
                        <div className="w-2 h-2 bg-[#18A36C] rounded-full" />
                        {spec}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">Информация отсутствует</li>
                  )}
                </ul>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#18A36C]/10 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-[#18A36C]" />
                  </div>
                  <h2 className="text-xl text-[#2E2E2E]">Образование</h2>
                </div>
                <ul className="space-y-3">
                  {doctor.education.length > 0 ? (
                    doctor.education.map((edu, index) => (
                      <li key={index} className="text-gray-700 border-l-2 border-[#18A36C]/20 pl-4">
                        {edu}
                      </li>
                    ))
                  ) : (
                    doctor.education_details ? (
                      <li className="text-gray-700 border-l-2 border-[#18A36C]/20 pl-4">
                        {doctor.education_details}
                      </li>
                    ) : (
                      <li className="text-gray-500">Информация отсутствует</li>
                    )
                  )}
                </ul>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#18A36C]/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#18A36C]" />
                  </div>
                  <h2 className="text-xl text-[#2E2E2E]">Участие в конференциях</h2>
                </div>
                <ul className="space-y-3">
                  {conferencesList.length > 0 ? (
                    conferencesList.map((conf, index) => (
                      <li key={index} className="text-gray-700 border-l-2 border-[#18A36C]/20 pl-4">
                        {conf}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">Информация отсутствует</li>
                  )}
                </ul>
              </Card>

              {doctor.work_examples && doctor.work_examples.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#18A36C]/10 rounded-full flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-[#18A36C]" />
                    </div>
                    <h2 className="text-xl text-[#2E2E2E]">Примеры работ</h2>
                  </div>
                  <div className="space-y-6">
                    {doctor.work_examples.map((example, index) => (
                      <div key={index}>
                        <h3 className="text-lg text-[#2E2E2E] mb-3">{example.title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {example.images.map((image, imgIndex) => (
                            <div key={imgIndex} className="rounded-lg overflow-hidden shadow-md">
                              <ImageWithFallback
                                src={image}
                                alt={`${example.title} - ${imgIndex + 1}`}
                                className="w-full h-48 object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
          </div>
        </motion.div>
        </div>
      </div>
    </>
  );
}