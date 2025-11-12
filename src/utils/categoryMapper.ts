// Маппинг между названиями категорий в БД и ID в меню
export const categoryNameToMenuId: Record<string, string> = {
  'Стоматология': 'dentistry',
  'Кардиология': 'cardiology',
  'Детская стоматология': 'pediatric-dentistry',
  'Гинекология': 'gynecology',
  'Эндокринология': 'endocrinology',
  'Онкология': 'oncology',
  'Урология': 'urology',
  'Анестезиология': 'anesthesiology',
  'УЗИ': 'ultrasound',
  'Дневной стационар': 'day-hospital',
};

export const menuIdToCategoryName: Record<string, string> = Object.fromEntries(
  Object.entries(categoryNameToMenuId).map(([name, id]) => [id, name])
);

export function getCategoryIdByMenuId(menuId: string, categories: Array<{ id: number; name: string }>): number | null {
  const categoryName = menuIdToCategoryName[menuId];
  if (!categoryName) return null;
  
  const category = categories.find(cat => cat.name === categoryName);
  return category ? category.id : null;
}

export function getMenuIdByCategoryId(categoryId: number, categories: Array<{ id: number; name: string }>): string | null {
  const category = categories.find(cat => cat.id === categoryId);
  if (!category) return null;
  
  return categoryNameToMenuId[category.name] || null;
}

