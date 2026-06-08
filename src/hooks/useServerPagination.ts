import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { ReadonlyURLSearchParams } from 'next/navigation';

// Safe wrapper для useSearchParams
function useSafeSearchParams(): ReadonlyURLSearchParams | null {
  try {
    // Динамический импорт useSearchParams
    const { useSearchParams } = require('next/navigation');
    return useSearchParams();
  } catch {
    return null;
  }
}

export function useServerPagination(itemsPerPage: number = 12) {
  const searchParams = useSafeSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Получаем текущую страницу из URL (по умолчанию 1)
  const currentPage = useMemo(() => {
    if (!searchParams) return 1;
    const page = searchParams.get('p');
    const pageNum = page ? parseInt(page, 10) : 1;
    return pageNum > 0 ? pageNum : 1;
  }, [searchParams]);

  // Функция для изменения страницы
  const setPage = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams?.toString() || '');

    if (page === 1) {
      params.delete('p');
    } else {
      params.set('p', page.toString());
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    router.replace(newUrl, { scroll: false });
  }, [searchParams, pathname, router]);

  // Функция для построения URL с параметрами для API запроса
  const buildApiUrl = useCallback((baseUrl: string, search?: string) => {
    const params = new URLSearchParams();
    params.set('page', currentPage.toString());
    params.set('limit', itemsPerPage.toString());

    if (search) {
      params.set('search', search);
    }

    return `${baseUrl}?${params.toString()}`;
  }, [currentPage, itemsPerPage]);

  return {
    currentPage,
    setPage,
    buildApiUrl,
    itemsPerPage,
  };
}
