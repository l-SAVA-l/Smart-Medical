// Теперь используем slug напрямую из БД
export function getCategoryIdBySlug(slug: string, categories: Array<{ id: number; slug: string }>): number | null {
  const category = categories.find(cat => cat.slug === slug);
  return category ? category.id : null;
}

export function getSlugByCategoryId(categoryId: number, categories: Array<{ id: number; slug: string }>): string | null {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.slug : null;
}

