import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  validatePassword,
  validateNamePart,
  validateLogin,
  validateEmail,
  validatePhone,
  capitalizeName,
} from "@/utils/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      lastName,
      firstName,
      middleName,
      email,
      phone,
      password,
      confirmPassword,
      login,
    } = body;

    // Валидация обязательных полей
    if (!login || !email || !password || !firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: "Все обязательные поля должны быть заполнены" },
        { status: 400 }
      );
    }

    // Валидация логина
    const loginValidation = validateLogin(login);
    if (!loginValidation.isValid) {
      return NextResponse.json(
        { error: loginValidation.error },
        { status: 400 }
      );
    }

    // Валидация имени
    const firstNameValidation = validateNamePart(firstName, 'Имя');
    if (!firstNameValidation.isValid) {
      return NextResponse.json(
        { error: firstNameValidation.error },
        { status: 400 }
      );
    }

    // Валидация фамилии
    const lastNameValidation = validateNamePart(lastName, 'Фамилия');
    if (!lastNameValidation.isValid) {
      return NextResponse.json(
        { error: lastNameValidation.error },
        { status: 400 }
      );
    }

    // Валидация отчества (если указано)
    if (middleName && middleName.trim()) {
      const middleNameValidation = validateNamePart(middleName, 'Отчество');
      if (!middleNameValidation.isValid) {
        return NextResponse.json(
          { error: middleNameValidation.error },
          { status: 400 }
        );
      }
    }

    // Проверка совпадения паролей
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Пароли не совпадают" },
        { status: 400 }
      );
    }

    // Валидация пароля (мин. 4 символа, заглавная буква, спецсимвол)
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Валидация формата email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    // Валидация формата телефона
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { error: phoneValidation.error },
        { status: 400 }
      );
    }

    // Проверка уникальности email
    const existingUserByEmail = await prisma.patient.findFirst({
      where: { email },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 409 }
      );
    }

    // Проверка уникальности логина
    const existingUserByLogin = await prisma.patient.findFirst({
      where: { login },
    });

    if (existingUserByLogin) {
      return NextResponse.json(
        { error: "Пользователь с таким логином уже существует" },
        { status: 409 }
      );
    }

    // Нормализуем телефон - оставляем только цифры
    const normalizedPhone = phone.replace(/\D/g, '');
    const last9Digits = normalizedPhone.slice(-9);

    // Проверка уникальности телефона (проверяем после нормализации для совместимости)
    const allPatients = await prisma.patient.findMany({
      select: { id: true, phone: true },
    });

    const existingUserByPhone = allPatients.find(patient => {
      const patientNormalized = patient.phone.replace(/\D/g, '');
      return patientNormalized === normalizedPhone ||
             patientNormalized.slice(-9) === last9Digits;
    });

    if (existingUserByPhone) {
      return NextResponse.json(
        { error: "Пользователь с таким телефоном уже существует" },
        { status: 409 }
      );
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Формирование полного имени с капитализацией
    const capitalizedLastName = capitalizeName(lastName);
    const capitalizedFirstName = capitalizeName(firstName);
    const capitalizedMiddleName = middleName ? capitalizeName(middleName) : "";
    const fullName = `${capitalizedLastName} ${capitalizedFirstName}${capitalizedMiddleName ? ` ${capitalizedMiddleName}` : ""}`.trim();

    // Создание пользователя
    const user = await prisma.patient.create({
      data: {
        login,
        email,
        password: hashedPassword,
        name: fullName,
        phone: normalizedPhone, // Сохраняем нормализованный телефон (только цифры)
        registration_date: new Date(),
      },
    });

    // Возвращаем успешный ответ без пароля
    return NextResponse.json(
      {
        message: "Регистрация успешна",
        user: {
          id: user.id,
          login: user.login,
          email: user.email,
          name: user.name,
          phone: user.phone,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при регистрации. Попробуйте позже." },
      { status: 500 }
    );
  }
}

