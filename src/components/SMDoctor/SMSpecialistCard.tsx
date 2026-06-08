'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Card } from '../common/SMCard/SMCard';
import { ImageWithFallback } from '../SMImage/ImageWithFallback';
import { useRouter } from 'next/navigation';

interface Specialist {
  id: number;
  name: string;
  specialization: string;
  qualification: string;
  experience: number;
  grade: number;
  image_url: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  serviceCategory?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface SpecialistCardProps {
  specialist: Specialist;
  index?: number;
  onDoctorClick?: (doctorId: number) => void;
  onBookAppointment?: (doctorId: number, doctorName: string) => void;
}

export function SpecialistCard({
  specialist,
  index = 0,
  onDoctorClick,
  onBookAppointment,
}: SpecialistCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    const categorySlug = specialist.serviceCategory?.slug || specialist.category?.slug || 'other';
    router.push(`/doctors/${categorySlug}/${specialist.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        onClick={handleCardClick}
        className="p-6 hover:shadow-lg transition-all duration-300 group border border-[#E8E6E3] hover:border-[#18A36C] rounded-lg cursor-pointer"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-shrink-0 mx-auto sm:mx-0">
            <div className="w-24 h-24 rounded-lg overflow-hidden transition-all duration-300">
              <ImageWithFallback
                src={specialist.image_url}
                alt={specialist.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg text-[#2E2E2E] mb-1 group-hover:text-[#18A36C] transition-colors">
              {specialist.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{specialist.specialization}</p>

            <div className="text-sm text-gray-600 mb-3 flex flex-col gap-1 items-center sm:items-start">
              <span>{specialist.qualification}</span>
              <span>Стаж: {specialist.experience} {specialist.experience === 1 ? 'год' : specialist.experience < 5 ? 'года' : 'лет'}</span>
            </div>

            <div className="flex items-center gap-1 justify-center sm:justify-start">
              {[...Array(specialist.grade)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-yellow-400 text-yellow-400"
                />
              ))}
              {[...Array(5 - specialist.grade)].map((_, i) => (
                <Star
                  key={i + specialist.grade}
                  className="w-4 h-4 fill-gray-200 text-gray-200"
                />
              ))}
              <span className="text-sm text-gray-600 ml-1">
                ({specialist.grade}/5)
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
