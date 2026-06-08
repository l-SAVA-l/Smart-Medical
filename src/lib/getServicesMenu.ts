import { prisma } from './prisma';

interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  parent_id: number | null;
  order: number;
}

interface MenuItem {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  children?: MenuItem[];
}

function buildCategoryTree(
  categories: ServiceCategory[],
  parentId: number | null = null
): MenuItem[] {
  const levelItems = categories
    .filter((category) => category.parent_id === parentId)
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.name.localeCompare(b.name, 'ru');
    });

  return levelItems.map((category) => {
    const children = buildCategoryTree(categories, category.id);
    const item: MenuItem = {
      id: category.slug,
      title: category.name,
      ...(category.icon ? { icon: category.icon } : {}),
      ...(children.length > 0 ? { children } : {}),
    };
    return item;
  });
}

export async function getServicesMenuFromDB(): Promise<MenuItem[]> {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: {
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        parent_id: true,
        order: true,
      },
    });

    return buildCategoryTree(categories as ServiceCategory[]);
  } catch (error) {
    console.error('Error fetching services menu from DB:', error);
    return [];
  }
}
