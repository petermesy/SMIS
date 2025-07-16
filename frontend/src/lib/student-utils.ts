import { getSemesters } from './api';

export async function fetchSemesterMap() {
  const semesters = await getSemesters();
  // Map: { [id]: name }
  const map: Record<string, string> = {};
  for (const sem of semesters) {
    map[sem.id] = sem.name;
  }
  return map;
}
