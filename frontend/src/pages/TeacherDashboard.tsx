

import { useEffect, useState } from 'react';
import StudentGradeCard from '@/components/dashboard/StudentGradeCard';
import { useAuth } from '@/contexts/AuthContext';
import { getTeacherAssignments, getStudentsByClass, getClassGrades, getGradeCategories, createGrade, getAcademicYears } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [scoreInputs, setScoreInputs] = useState<{ [studentId: string]: string }>({});
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [semesters, setSemesters] = useState<any[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('');

  // Fetch teacher assignments and academic years
  useEffect(() => {
    if (user?.role === 'teacher') {
      getTeacherAssignments().then(setAssignments).catch(() => toast.error('Failed to load assignments'));
      getAcademicYears().then(setAcademicYears).catch(() => toast.error('Failed to load academic years'));
    }
  }, [user]);

  // Update semesters when academic year changes
  useEffect(() => {
    if (selectedAcademicYear) {
      const year = academicYears.find((y: any) => y.id === selectedAcademicYear);
      setSemesters(year?.semesters || []);
      setSelectedSemester('');
    } else {
      setSemesters([]);
      setSelectedSemester('');
    }
  }, [selectedAcademicYear, academicYears]);

  // Fetch students for selected assignment, academic year, and semester
  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedAssignment && selectedAcademicYear && selectedSemester) {
        const assignment = assignments.find(a => a.id === selectedAssignment);
        if (assignment) {
          const params = {
            academicYearId: selectedAcademicYear,
            semesterId: selectedSemester
          };
          console.log('Fetching students with:', {
            classId: assignment.class.id,
            ...params
          });
          try {
            const studentsRes = await getStudentsByClass(assignment.class.id, params);
            let fetchedStudents = [];
            if (Array.isArray(studentsRes)) {
              fetchedStudents = studentsRes;
              setStudents(studentsRes);
            } else if (studentsRes && Array.isArray(studentsRes.students)) {
              fetchedStudents = studentsRes.students;
              setStudents(studentsRes.students);
            } else {
              setStudents([]);
            }
            // Debug log: print students fetched from backend
            console.log('Fetched students:', fetchedStudents);
          } catch (err) {
            setStudents([]);
            toast.error('Failed to load students');
            // Debug log: print error
            console.error('Error fetching students:', err);
          }
        }
      } else {
        setStudents([]);
      }
    };
    fetchStudents();
  }, [selectedAssignment, assignments, selectedAcademicYear, selectedSemester]);

  // Fetch grade categories for selected assignment
  useEffect(() => {
    const fetchCategories = async () => {
      if (!selectedAssignment) {
        setCategories([]);
        return;
      }
      const assignment = assignments.find(a => a.id === selectedAssignment);
      if (!assignment) return;
      try {
        const res = await getGradeCategories({
          classId: assignment.class.id,
          subjectId: assignment.subject.id
        });
        setCategories(res);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, [selectedAssignment, assignments]);

  // Fetch grades for selected assignment/category/semester/year
  useEffect(() => {
    const fetchGrades = async () => {
      if (selectedAssignment && selectedCategory && selectedAcademicYear && selectedSemester) {
        const assignment = assignments.find(a => a.id === selectedAssignment);
        if (!assignment) return;
        try {
          const params = {
            classId: assignment.class.id,
            subjectId: assignment.subject.id,
            categoryId: selectedCategory,
            semesterId: selectedSemester,
            academicYearId: selectedAcademicYear
          };
          console.log('getClassGrades params:', params);
          const res = await getClassGrades(params);
          console.log('Grades fetched from backend:', res);
          setGrades(res);
        } catch (err) {
          console.error('Error fetching grades:', err);
          setGrades([]);
        }
      } else {
        setGrades([]);
      }
    };
    fetchGrades();
  }, [selectedAssignment, selectedCategory, assignments, selectedAcademicYear, selectedSemester]);

  const handleScoreChange = (studentId: string, value: string) => {
    setScoreInputs(inputs => ({ ...inputs, [studentId]: value }));
  };

  const handleSaveScores = async () => {
    if (!selectedAssignment || !selectedCategory) {
      toast.error('Select an exam type');
      return;
    }
    const assignment = assignments.find(a => a.id === selectedAssignment);
    if (!assignment) return;
    for (const student of students) {
      const score = scoreInputs[student.id];
      if (score) {
        try {
          await createGrade({
            studentId: student.id,
            subjectId: assignment.subject.id,
            classId: assignment.class.id,
            categoryId: selectedCategory,
            semesterId: selectedSemester,
            academicYearId: selectedAcademicYear,
            pointsEarned: Number(score),
            totalPoints: 100,
            date: new Date().toISOString(),
            createdBy: user?.id,
          });
        } catch {
          toast.error(`Failed to save score for ${student.firstName}`);
        }
      }
    }
    toast.success('Scores saved!');
    setScoreInputs({});
    // Refresh grades
    if (selectedAssignment && selectedCategory && selectedAcademicYear && selectedSemester) {
      const assignment = assignments.find(a => a.id === selectedAssignment);
      if (assignment) {
        const res = await getClassGrades({
          classId: assignment.class.id,
          subjectId: assignment.subject.id,
          categoryId: selectedCategory,
          semesterId: selectedSemester,
          academicYearId: selectedAcademicYear
        });
        setGrades(res);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Submit & View Student Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
              <SelectTrigger><SelectValue placeholder="Select Academic Year" /></SelectTrigger>
              <SelectContent>
                {academicYears.map((year: any) => (
                  <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSemester} onValueChange={setSelectedSemester} disabled={!semesters.length}>
              <SelectTrigger><SelectValue placeholder="Select Semester" /></SelectTrigger>
              <SelectContent>
                {semesters.map((sem: any) => (
                  <SelectItem key={sem.id} value={sem.id}>{sem.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
              <SelectTrigger><SelectValue placeholder="Select Class & Subject" /></SelectTrigger>
              <SelectContent>
                {assignments.map(a => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.class.grade.name} {a.class.section.name} - {a.subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={!categories.length}>
              <SelectTrigger><SelectValue placeholder="Select Exam Type" /></SelectTrigger>
              <SelectContent>
                {categories.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Detailed summary table: show each subject's score for each student */}
          <table className="min-w-full text-sm mb-4">
            <thead>
              <tr>
                <th className="border px-2 py-1">Student</th>
                {/* Dynamically render subject columns */}
                {(() => {
                  // Get all unique subject names from grades
                  const subjectNames = Array.from(new Set(grades.map((g: any) => g.subjectName).filter(Boolean)));
                  return subjectNames.map(subject => (
                    <th key={subject} className="border px-2 py-1">{subject} Score</th>
                  ));
                })()}
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && selectedAssignment && selectedAcademicYear && selectedSemester ? (
                <tr>
                  <td colSpan={2} className="border px-2 py-1 text-center text-gray-500">No students found for this selection.</td>
                </tr>
              ) : (
                students.map(student => {
                  // For each subject, find the grade for this student
                  const subjectNames = Array.from(new Set(grades.map((g: any) => g.subjectName).filter(Boolean)));
                  return (
                    <tr key={student.id}>
                      <td className="border px-2 py-1">{student.firstName} {student.lastName}</td>
                      {subjectNames.map(subject => {
                        const grade = grades.find((g: any) => g.studentId === student.id && g.subjectName === subject);
                        return (
                          <td key={subject} className="border px-2 py-1">{grade ? `${grade.pointsEarned || grade.score} / ${grade.totalPoints || grade.maxScore}` : '-'}</td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <Button onClick={handleSaveScores} disabled={students.length === 0}>Save Scores</Button>
        </CardContent>
      </Card>

      {/* Card for all submitted grades */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>All Submitted Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentGradeCard grades={grades} />
        </CardContent>
      </Card>
    </div>
  );
}
