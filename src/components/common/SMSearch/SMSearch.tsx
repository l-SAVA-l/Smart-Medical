"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, FileText, Users, Briefcase, HelpCircle, Sparkles, Building2, MapPin, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  type: "service" | "specialist" | "vacancy" | "faq" | "material" | "partner" | "contact" | "patient-info";
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categoryIcons = {
  service: FileText,
  specialist: Users,
  vacancy: Briefcase,
  faq: HelpCircle,
  material: Sparkles,
  partner: Building2,
  contact: MapPin,
  "patient-info": User,
};

const categoryNames = {
  service: "Услуги",
  specialist: "Специалисты",
  vacancy: "Вакансии",
  faq: "FAQ",
  material: "Материалы",
  partner: "Партнёры",
  contact: "Контакты",
  "patient-info": "Пациенту",
};

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Search functionality
  useEffect(() => {
    if (!query.trim() || query.trim().length < 3) {
      setResults([]);
      setError(null);
      return;
    }

    const searchTimer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();

          // Проверяем, есть ли ошибка в ответе (например, использование английского языка)
          if (data.error) {
            setError(data.error);
            setResults([]);
          } else {
            setResults(data.results || []);
            setError(null);
          }
        }
      } catch (error) {
        setError("Ошибка при поиске. Попробуйте позже.");
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce

    return () => clearTimeout(searchTimer);
  }, [query]);

  // Highlight search query in text
  const highlightText = (text: string, query: string) => {
    if (!query.trim() || query.trim().length < 3) return text;

    try {
      // Escape special regex characters
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
      return (
        <span>
          {parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase() ? (
              <span key={i} className="font-bold text-[#18A36C]">
                {part}
              </span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </span>
      );
    } catch (error) {
      // If regex fails, return original text
      return text;
    }
  };

  // Truncate text with ellipsis
  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    onClose();
    setQuery("");
  };

  // Валидация ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setError(null);
  };

  // Group results by category
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-50 p-4 sm:p-6 md:p-8"
          >
            <div className="max-w-3xl mx-auto">
              {/* Search Input */}
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Поиск по сайту..."
                    className="w-full pl-16 pr-16 py-6 text-lg outline-none border-0 focus:ring-0"
                  />
                  {loading && (
                    <Loader2 className="absolute right-16 top-1/2 -translate-y-1/2 w-6 h-6 text-[#18A36C] animate-spin" />
                  )}
                  <button
                    onClick={onClose}
                    className="absolute right-6 cursor-pointer top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                {/* Results */}
                {query.trim() && (
                  <div className="border-t border-gray-200 max-h-[calc(100vh-250px)] sm:max-h-96 overflow-y-auto">
                    {query.trim().length < 3 && (
                      <div className="p-8 text-center text-gray-500">
                        <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-lg">Введите минимум 3 символа</p>
                        <p className="text-sm mt-1">Для начала поиска</p>
                      </div>
                    )}

                    {error && query.trim().length >= 3 && !loading && (
                      <div className="p-8 text-center">
                        <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
                          <X className="w-6 h-6 text-red-500" />
                        </div>
                        <p className="text-lg text-red-600 font-medium">{error}</p>
                      </div>
                    )}

                    {query.trim().length >= 3 && results.length === 0 && !loading && !error && (
                      <div className="p-8 text-center text-gray-500">
                        <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-lg">Ничего не найдено</p>
                        <p className="text-sm mt-1">Попробуйте изменить запрос</p>
                      </div>
                    )}

                    {Object.entries(groupedResults).map(([type, items]) => {
                      const Icon = categoryIcons[type as keyof typeof categoryIcons];
                      const categoryName = categoryNames[type as keyof typeof categoryNames];

                      return (
                        <div key={type} className="border-b border-gray-100 last:border-b-0">
                          <div className="px-6 py-3 bg-gray-50 flex items-center gap-2">
                            <Icon className="w-4 h-4 text-[#18A36C]" />
                            <span className="text-sm font-semibold text-gray-700">
                              {categoryName} ({items.length})
                            </span>
                          </div>

                          {items.map((result) => (
                            <motion.div
                              key={result.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                              onClick={() => handleResultClick(result)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                                    {highlightText(result.title, query)}
                                  </h4>
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {highlightText(truncate(result.description, 150), query)}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quick Tips */}
                {!query.trim() && (
                  <div className="p-6 text-sm text-gray-500">
                    <p className="mb-3 font-medium text-gray-700">Быстрый поиск по:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(categoryNames).map(([key, name]) => {
                        const Icon = categoryIcons[key as keyof typeof categoryIcons];
                        return (
                          <div key={key} className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-[#18A36C]" />
                            <span>{name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
