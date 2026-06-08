'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HelpCircle, ArrowRight, MessageSquare } from 'lucide-react';
import { Button } from '@/components/common/SMButton/SMButton';
import { Card } from '@/components/common/SMCard/SMCard';
import { Badge } from '@/components/common/SMBadge/SMBadge';
import { motion } from 'framer-motion';
import { NavigableClinicMenu } from '@/components/SMClinic/SMNavigableClinicMenu';

interface QuestionCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  _count: {
    questions: number;
  };
}

// Skeleton для карточек категорий
function CategoryCardSkeleton() {
  return (
    <Card className="border border-gray-200 rounded-lg animate-pulse">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="flex items-center gap-2 mt-3">
              <div className="h-6 bg-gray-200 rounded w-24" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function QuestionsPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<QuestionCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch('/api/question-categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <NavigableClinicMenu />
      <div className="flex-1">
        <div className="p-4 lg:p-8 bg-white min-h-screen">
          <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 lg:mb-12">
            <div className="text-center mb-6 lg:mb-8">
              <div className="w-16 h-16 bg-[#18A36C] rounded-lg flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl text-[#2E2E2E] mb-3 lg:mb-4">
                Вопросы и ответы
              </h1>
              <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                Здесь вы найдете ответы на наиболее часто задаваемые вопросы о нашей клинике и услугах
              </p>
            </div>
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            </div>
          ) : categories.length === 0 ? (
            // Empty state
            <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl text-gray-800 mb-2">
                Категории вопросов пока не добавлены
              </h3>
              <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto px-4">
                Мы работаем над наполнением этого раздела. Пожалуйста, вернитесь позже.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-8">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="group hover:shadow-lg transition-all duration-300 border border-[#E8E6E3] hover:border-[#18A36C] rounded-lg cursor-pointer h-full"
                    onClick={() => router.push(`/clinic/questions/${category.slug}`)}
                  >
                    <div className="p-6 h-full flex flex-col">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-[#18A36C]/10 rounded-lg flex items-center justify-center group-hover:bg-[#18A36C]/20 transition-all duration-300 flex-shrink-0">
                          <HelpCircle className="w-6 h-6 text-[#18A36C]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg text-[#2E2E2E] mb-2 group-hover:text-[#18A36C] transition-colors duration-300">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-sm text-gray-600 leading-relaxed mb-3">
                              {category.description}
                            </p>
                          )}
                          <Badge variant="secondary" className="mt-auto">
                            {category._count.questions} {category._count.questions === 1 ? 'вопрос' : category._count.questions > 1 && category._count.questions < 5 ? 'вопроса' : 'вопросов'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* CTA Section */}
          <div className="text-center bg-white border border-[#E8E6E3] rounded-lg p-8 lg:p-12">
            <h2 className="text-xl lg:text-2xl text-[#2E2E2E] mb-3 lg:mb-4">
              Не нашли ответ на свой вопрос?
            </h2>
            <p className="text-gray-600 mb-6 lg:mb-8 text-sm lg:text-base">
              Свяжитесь с нами, и мы с радостью предоставим вам необходимую информацию
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 lg:gap-6">
              <Button
                onClick={() => router.push('/contacts')}
                className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white px-8 py-4 h-auto rounded-lg transition-all duration-300 cursor-pointer"
              >
                Связаться с нами
                <ArrowRight className="w-5 h-5 ml-[2.5px]" />
              </Button>
              <Button
                onClick={() => {
                  // Open AI Assistant or contact form
                  // This could trigger the AskQuestionModal
                }}
                variant="outline"
                className="border-[#18A36C] text-[#18A36C] px-8 py-4 h-auto rounded-lg hover:shadow-xl hover:shadow-[#18A36C]/20 cursor-pointer"
              >
                Задать вопрос
                <MessageSquare className="w-5 h-5 ml-[2.5px]" />
              </Button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
