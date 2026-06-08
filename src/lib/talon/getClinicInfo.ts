import { prisma } from '@/lib/prisma';

export async function getClinicInfo(): Promise<{
  name: string;
  address: string;
  email: string;
}> {
  const contacts = await prisma.contacts.findFirst();
  return {
    name: 'SmartMedical',
    address: contacts?.address || '',
    email: contacts?.email || '',
  };
}
