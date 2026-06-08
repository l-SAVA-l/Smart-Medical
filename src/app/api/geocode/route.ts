import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      return NextResponse.json(
        { error: 'Адрес не указан' },
        { status: 400 }
      );
    }

    // Используем Nominatim от OpenStreetMap для геокодирования
    // Добавляем User-Agent как требуется политикой использования Nominatim
    const encodedAddress = encodeURIComponent(address.trim());
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1&addressdetails=1`;

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'SmartMedical-Clinic-App/1.0', // Обязательный заголовок для Nominatim
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Ошибка при запросе к сервису геокодирования' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Адрес не найден. Попробуйте уточнить адрес или ввести координаты вручную.' },
        { status: 404 }
      );
    }

    // Получаем первый результат (наиболее релевантный)
    const location = data[0];
    const latitude = parseFloat(location.lat);
    const longitude = parseFloat(location.lon);

    // Возвращаем координаты в формате "lat,lon"
    return NextResponse.json({
      coordinates: `${latitude},${longitude}`,
      latitude,
      longitude,
      display_name: location.display_name, // Полное название найденного адреса
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера при геокодировании' },
      { status: 500 }
    );
  }
}