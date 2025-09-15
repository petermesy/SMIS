import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getGrades, getSubjects, getGradeCategories, registerNextSemester } from '@/lib/api';
import { fetchSemesterMap } from '@/lib/student-utils';
import { fetchAcademicYearMap } from '@/lib/academic-utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { api } from "../lib/api"; // adjust import if needed

export default function StudentGrades() {
  const { user } = useAuth();

  const [grades, setGrades] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [semesterMap, setSemesterMap] = useState<Record<string, string>>({});
  const [academicYearMap, setAcademicYearMap] = useState<Record<string, string>>({});
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');

  // Registration state
  const [registering, setRegistering] = useState(false);
  const [registerMessage, setRegisterMessage] = useState('');
  // For demo: always eligible. You can add real eligibility logic here.
  const eligibleForNext = true;
  const [eligible, setEligible] = useState(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);

  useEffect(() => {
    // Fetch eligibility for registration
    const checkEligibility = async () => {
      try {
        const res = await api.get('/students/registration-eligibility');
        console.log('Eligibility API response:', res.data); // Log backend response
        setEligible(res.data.eligible);
      } catch (err) {
        console.log('Eligibility API error:', err);
        setEligible(false);
      }
      setEligibilityChecked(true);
    };
    checkEligibility();
  }, []);


const handleRegisterNext = async () => {
  if (!selectedSemester) {
    setRegisterMessage('Please select a semester.');
    return;
  }
  setRegistering(true);
  setRegisterMessage('');
  try {
    await registerNextSemester(selectedSemester);
    setRegisterMessage('Registration request submitted! Awaiting admin approval.');
  } catch (err: any) {
    setRegisterMessage(
      err?.response?.data?.error ||
      err?.message ||
      'Registration request failed.'
    );
  }
  setRegistering(false);
};

  // Fetch academic years and semesters on mount
  useEffect(() => {
    if (user?.role === 'student') {
      fetchSemesterMap().then(setSemesterMap);
      fetchAcademicYearMap().then(setAcademicYearMap);
    }
  }, [user]);



  // Fetch grades and subjects when filters change
  useEffect(() => {
    if (user?.role === 'student') {
      getGrades().then(data => {
        let filtered = data.filter((g: any) => g.studentId === user.id);
        if (selectedAcademicYear) {
          filtered = filtered.filter((g: any) => g.class?.academicYearId === selectedAcademicYear || g.class?.academicYear?.id === selectedAcademicYear);
        }
        if (selectedSemester) {
          filtered = filtered.filter((g: any) => g.semesterId === selectedSemester || g.semester?.id === selectedSemester);
        }
        setGrades(filtered);
      });
      getSubjects().then(setSubjects);
    }
  }, [user, selectedAcademicYear, selectedSemester]);

  useEffect(() => {
    // Fetch all categories (exam types) for all subjects
    if (subjects.length > 0) {
      Promise.all(subjects.map((s: any) => getGradeCategories(s.id))).then(results => {
        setCategories(results.flat());
      });
    }
  }, [subjects]);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Scores</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Academic Year</label>
              <select
                className="border rounded px-2 py-1"
                value={selectedAcademicYear}
                onChange={e => setSelectedAcademicYear(e.target.value)}
              >
                <option value="">All</option>
                {Object.entries(academicYearMap).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Semester</label>
              <select
                className="border rounded px-2 py-1"
                value={selectedSemester}
                onChange={e => setSelectedSemester(e.target.value)}
              >
                <option value="">All</option>
                {Object.entries(semesterMap).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          <table className="min-w-full text-sm mb-4">
            <thead>
              <tr>
                <th className="border px-2 py-1">Subject</th>
                <th className="border px-2 py-1">Exam Type</th>
                <th className="border px-2 py-1">Score</th>
                <th className="border px-2 py-1">Total</th>
                <th className="border px-2 py-1">Semester</th>
                <th className="border px-2 py-1">Academic Year</th>
                <th className="border px-2 py-1">Date</th>
              </tr>
            </thead>
            <tbody>
              {grades.length === 0 && (
                <tr><td colSpan={7} className="text-center">No scores yet</td></tr>
              )}
              {grades.map((grade: any) => {
                const subject = subjects.find((s: any) => s.id === grade.subjectId);
                const category = categories.find((c: any) => c.id === grade.categoryId);
                const semesterName = grade.semester?.name || semesterMap[grade.semesterId] || grade.semesterId;
                const academicYearName = grade.class?.academicYear?.name || academicYearMap[grade.class?.academicYearId] || grade.class?.academicYearId || '';
                const examTypeName = category ? category.name : (grade.category?.name || grade.categoryId);
                return (
                  <tr key={grade.id}>
                    <td className="border px-2 py-1">{subject ? subject.name : grade.subjectId}</td>
                    <td className="border px-2 py-1">{examTypeName}</td>
                    <td className="border px-2 py-1">{grade.pointsEarned}</td>
                    <td className="border px-2 py-1">{grade.totalPoints}</td>
                    <td className="border px-2 py-1">{semesterName}</td>
                    <td className="border px-2 py-1">{academicYearName}</td>
                    <td className="border px-2 py-1">{grade.date ? new Date(grade.date).toLocaleDateString() : ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Subject totals table */}
          <table className="min-w-full text-sm mt-8">
            <thead>
              <tr>
                <th className="border px-2 py-1">Subject</th>
                <th className="border px-2 py-1">Total Score</th>
                <th className="border px-2 py-1">Total Possible</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject: any) => {
                const subjectGrades = grades.filter((g: any) => g.subjectId === subject.id);
                if (subjectGrades.length === 0) return null;
                const totalEarned = subjectGrades.reduce((sum: number, g: any) => sum + (g.pointsEarned || 0), 0);
                const totalPossible = subjectGrades.reduce((sum: number, g: any) => sum + (g.totalPoints || 0), 0);
                return (
                  <tr key={subject.id}>
                    <td className="border px-2 py-1 font-semibold">{subject.name}</td>
                    <td className="border px-2 py-1">{totalEarned}</td>
                    <td className="border px-2 py-1">{totalPossible}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Average for all subjects */}
          <div className="mt-8">
            {(() => {
              const totalEarnedAll = grades.reduce((sum: number, g: any) => sum + (g.pointsEarned || 0), 0);
              const totalPossibleAll = grades.reduce((sum: number, g: any) => sum + (g.totalPoints || 0), 0);
              const avg = totalPossibleAll > 0 ? (totalEarnedAll / totalPossibleAll) * 100 : 0;
              return (
                <div className="text-lg font-semibold text-blue-700">
                  Average for All Subjects: {totalEarnedAll}/{totalPossibleAll} ({avg.toFixed(2)}%)
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>
      {/* Registration Button */}

{user?.role === 'student' && eligibilityChecked && eligible && (
  <div className="mt-6 flex flex-col items-center">
    <button
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      onClick={handleRegisterNext}
      disabled={registering}
    >
      {registering ? 'Registering...' : 'Register for Next Semester/Year'}
    </button>
    {registerMessage && (
      <div className="mt-2 text-green-700 font-semibold">{registerMessage}</div>
    )}
  </div>
)}
    </div>
  );
}