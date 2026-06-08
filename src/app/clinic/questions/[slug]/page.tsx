'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { HelpCircle, ArrowLeft, MessageSquare } from 'lucide-react';
import { Button } from '@/components/common/SMButton/SMButton';
import { Card } from '@/components/common/SMCard/SMCard';
import { Badge } from '@/components/common/SMBadge/SMBadge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/common/SMAccordion/SMAccordion';
import { motion } from 'framer-motion';
import { NavigableClinicMenu } from '@/components/SMClinic/SMNavigableClinicMenu';

interface Question {
  id: number;
  question: string;
  answer: string | null;
}

interface QuestionCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  questions: Question[];
}

// Skeleton для секции FAQ
function FAQItemSkeleton() {
  return (
    <div className="border-b border-gray-200 py-4 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6 mt-1" />
    </div>
  );
}

function CategoryPageSkeleton() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <NavigableClinicMenu />
      <div className="flex-1">
        <div className="min-h-screen bg-white">
          <div className="max-w-4xl mx-auto px-4 py-6 lg:py-8">
            <div className="space-y-6">
              {/* Header skeleton */}
              <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8 border border-gray-100 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>

              {/* Questions skeleton */}
              <Card className="p-6 lg:p-8 border-gray-200 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <FAQItemSkeleton key={i} />
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoryQuestionsPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [category, setCategory] = useState<QuestionCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadCategory() {
      // Сбрасываем состояние при изменении slug
      setLoading(true);
      setNotFound(false);

      if (!slug) {
        setLoading(false);
        setNotFound(true);
        return;
      }

      try {
        const response = await fetch(`/api/question-categories/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setCategory(data);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error loading category:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadCategory();
  }, [slug]);

  if (loading) {
    return <CategoryPageSkeleton />;
  }

  if (notFound || !category) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <NavigableClinicMenu />
        <div className="flex-1">
          <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 py-6 lg:py-8">
              <div className="text-center py-12 sm:py-16">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl text-gray-800 mb-2">
                  Категория не найдена
                </h3>
                <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto px-4 mb-6">
                  Запрошенная категория вопросов не существует или была удалена
                </p>
                <Button
                  onClick={() => router.push('/clinic/questions')}
                  className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Вернуться к категориям
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <NavigableClinicMenu />
      <div className="flex-1">
        <div className="min-h-screen bg-white">
          <div className="max-w-4xl mx-auto px-4 py-6 lg:py-8">
            <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6 lg:p-8 border border-gray-100"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-[#18A36C]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-6 h-6 text-[#18A36C]" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl text-[#2E2E2E] mb-2">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-gray-600 leading-relaxed">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
            <Badge variant="secondary" className="mt-2">
              {category.questions.length} {category.questions.length === 1 ? 'вопрос' : category.questions.length > 1 && category.questions.length < 5 ? 'вопроса' : 'вопросов'}
            </Badge>
          </motion.div>

          {/* Questions Section */}
          {category.questions.length === 0 ? (
            <Card className="p-6 lg:p-8 border-gray-200">
              <h2 className="text-xl text-[#2E2E2E] mb-6">Вопросы и ответы</h2>
              <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl text-gray-800 mb-2">
                  Вопросы пока не добавлены
                </h3>
                <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto px-4">
                  В данный момент нет вопросов в этой категории. Вы можете задать свой вопрос ниже.
                </p>
              </div>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="p-6 lg:p-8 border-gray-200">
                <h2 className="text-xl text-[#2E2E2E] mb-6">Вопросы и ответы</h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, index) => (
                    <AccordionItem
                      key={item.id}
                      value={`item-${item.id}`}
                      id={`faq-${item.id}`}
                      className="scroll-mt-24"
                    >
                      <AccordionTrigger className="text-left text-[#212121] hover:text-[#18A36C] cursor-pointer">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-[#212121] leading-relaxed whitespace-pre-line">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            </motion.div>
          )}

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="p-6 bg-gradient-to-r from-[#F4F4F4] to-white rounded-2xl border border-gray-100"
          >
            <div className="text-center">
              <HelpCircle className="w-12 h-12 text-[#18A36C] mx-auto mb-3" />
              <h3 className="text-lg text-gray-700 mb-2">
                Не нашли ответа на свой вопрос?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Свяжитесь с нами, и мы предоставим необходимую информацию.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button
                  onClick={() => {
                    // Open AI Assistant or contact form
                    // This could trigger the AskQuestionModal
                  }}
                  className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white px-8 py-3 h-auto"
                >
                  Задать вопрос
                  <MessageSquare className="w-4 h-4 ml-[2.5px]" />
                </Button>
                <Button
                  onClick={() => router.push('/clinic/questions')}
                  variant="outline"
                  className="border-[#18A36C] text-[#18A36C] px-8 py-3 h-auto hover:shadow-xl hover:shadow-[#18A36C]/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Все категории
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
      </div>
    </div>
  );
}
