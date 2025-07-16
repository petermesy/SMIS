import { getAcademicYears } from './api';

export async function fetchAcademicYearMap() {
  const years = await getAcademicYears();
  const map: Record<string, string> = {};
  for (const year of years) {
    map[year.id] = year.name;
  }
  return map;
}
