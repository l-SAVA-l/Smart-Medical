export interface Patient {
  id: number;
  login: string;
  email: string;
  name: string;
  phone: string;
  registration_date: string; 
}

export interface PatientsResponse {
  patients: Patient[];
}


export async function getPatients(): Promise<Patient[]> {
  try {
    const response = await fetch('/api/patients', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Для получения актуальных данных
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch patients: ${response.statusText}`);
    }

    const data: PatientsResponse = await response.json();
    return data.patients;
  } catch (error) {
    throw error;
  }
}

export async function getPatientById(id: number): Promise<Patient | null> {
  try {
    const patients = await getPatients();
    return patients.find((patient) => patient.id === id) || null;
  } catch (error) {
    return null;
  }
}

export function formatRegistrationDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

