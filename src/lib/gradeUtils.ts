import { prisma } from './prisma';

type EligibilityResult = {
  eligible: boolean;
  englishPercent: number;
  mathsPercent: number;
  reason?: string;
};

// Compute English and Maths averages across all semesters in an academic year for a student.
// Matching for subject names is case-insensitive and accepts common synonyms for Maths.
export async function computeEnglishAndMathsAveragesForAcademicYear(studentId: string, academicYearId: string): Promise<EligibilityResult> {
  // Find semesters for the academic year
  const semesters = await prisma.semester.findMany({ where: { academicYearId }, orderBy: { startDate: 'asc' } });
  if (!semesters || semesters.length === 0) {
    return { eligible: false, englishPercent: 0, mathsPercent: 0, reason: 'Academic year has no semesters' };
  }
  const semesterIds = semesters.map(s => s.id);

  // We'll match English by name 'english' and maths by a set of synonyms
  const mathsNames = ['maths', 'math', 'mathematics', 'mathematics'];

  // Fetch grade entries for the semesters and then filter in JS for flexible name matching
  const grades = await prisma.gradeEntry.findMany({
    where: { studentId, semesterId: { in: semesterIds } },
    include: { subject: true },
  });

  // Aggregate totals per subject (normalized)
  const agg: Record<string, { earned: number; total: number; count: number }> = {
    English: { earned: 0, total: 0, count: 0 },
    Maths: { earned: 0, total: 0, count: 0 },
  };

  for (const g of grades) {
    const name = (g.subject?.name || '').trim().toLowerCase();
    if (!name) continue;
    if (name === 'english') {
      agg.English.earned += (g.pointsEarned || 0);
      agg.English.total += (g.totalPoints || 0);
      agg.English.count += 1;
    } else if (mathsNames.includes(name)) {
      agg.Maths.earned += (g.pointsEarned || 0);
      agg.Maths.total += (g.totalPoints || 0);
      agg.Maths.count += 1;
    }
  }

  const englishPercent = agg.English.total > 0 ? (agg.English.earned / agg.English.total) * 100 : 0;
  const mathsPercent = agg.Maths.total > 0 ? (agg.Maths.earned / agg.Maths.total) * 100 : 0;

  // New requirement: both-subject averages must be >= 50% to be eligible
  const eligible = englishPercent >= 50 && mathsPercent >= 50;
  const reason = (agg.English.count === 0 || agg.Maths.count === 0) ? 'Insufficient grade data for English or Maths' : undefined;
  return { eligible, englishPercent, mathsPercent, reason };
}

export type { EligibilityResult };
