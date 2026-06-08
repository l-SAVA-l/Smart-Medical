import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Чат с пациентами | Админ-панель',
  description: 'Чат с пациентами',
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
