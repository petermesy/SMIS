import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTeacherAssignments, getStudentsByClass, getClassGrades, createGrade, getGradeCategories, getAcademicYears } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react'; // For loading spinner
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
  const [loading, setLoading] = useState({
    assignments: false,
    students: false,
    grades: false,
    categories: false,
    academicYears: false,
  });

  // Fetch teacher assignments and academic years
  useEffect(() => {
    if (user?.role !== 'teacher') return;

    const fetchInitialData = async () => {
      setLoading((prev) => ({ ...prev, assignments: true, academicYears: true }));
      try {
        const [assignmentsRes, academicYearsRes] = await Promise.all([
          getTeacherAssignments(),
          getAcademicYears(),
        ]);
        setAssignments(assignmentsRes || []);
        setAcademicYears(academicYearsRes || []);
      } catch (err) {
        toast.error('Failed to load initial data');
        console.error('Error fetching initial data:', err);
      } finally {
        setLoading((prev) => ({ ...prev, assignments: false, academicYears: false }));
      }
    };
    fetchInitialData();
  }, [user]);

  // Update semesters when academic year changes
  useEffect(() => {
    if (selectedAcademicYear) {
      const year = academicYears.find((y) => y.id === selectedAcademicYear);
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
      if (!selectedAssignment || !selectedAcademicYear || !selectedSemester) {
        setStudents([]);
        return;
      }
      setLoading((prev) => ({ ...prev, students: true }));
      const assignment = assignments.find((a) => a.id === selectedAssignment);
      if (!assignment) {
        setStudents([]);
        setLoading((prev) => ({ ...prev, students: false }));
        return;
      }
      try {
        const params = { academicYearId: selectedAcademicYear, semesterId: selectedSemester };
        const studentsRes = await getStudentsByClass(assignment.class.id, params);
        const fetchedStudents = Array.isArray(studentsRes) ? studentsRes : studentsRes?.students || [];
        setStudents(fetchedStudents);
        console.log('Fetched students:', fetchedStudents);
      } catch (err) {
        setStudents([]);
        toast.error('Failed to load students');
        console.error('Error fetching students:', err);
      } finally {
        setLoading((prev) => ({ ...prev, students: false }));
      }
    };
    fetchStudents();
  }, [selectedAssignment, selectedAcademicYear, selectedSemester, assignments]);

  // Fetch grade categories for selected assignment
  useEffect(() => {
    const fetchCategories = async () => {
      if (!selectedAssignment) {
        setCategories([]);
        return;
      }
      setLoading((prev) => ({ ...prev, categories: true }));
      const assignment = assignments.find((a) => a.id === selectedAssignment);
      if (!assignment) {
        setCategories([]);
        setLoading((prev) => ({ ...prev, categories: false }));
        return;
      }
      try {
        const res = await getGradeCategories({
          classId: assignment.class.id,
          subjectId: assignment.subject.id,
        });
        setCategories(res || []);
      } catch (err) {
        setCategories([]);
        toast.error('Failed to load grade categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading((prev) => ({ ...prev, categories: false }));
      }
    };
    fetchCategories();
  }, [selectedAssignment, assignments]);

  // Fetch grades for selected assignment, category, semester, and academic year
  useEffect(() => {
    const fetchGrades = async () => {
      if (!selectedAssignment || !selectedCategory || !selectedAcademicYear || !selectedSemester) {
        setGrades([]);
        return;
      }
      setLoading((prev) => ({ ...prev, grades: true }));
      const assignment = assignments.find((a) => a.id === selectedAssignment);
      if (!assignment) {
        setGrades([]);
        setLoading((prev) => ({ ...prev, grades: false }));
        return;
      }
      try {
        const res = await getClassGrades({
          classId: assignment.class.id,
          subjectId: assignment.subject.id,
          categoryId: selectedCategory,
          semesterId: selectedSemester,
          academicYearId: selectedAcademicYear,
        });
        setGrades(res || []);
        console.log('Fetched grades:', res);
      } catch (err) {
        setGrades([]);
        toast.error('Failed to load grades');
        console.error('Error fetching grades:', err);
      } finally {
        setLoading((prev) => ({ ...prev, grades: false }));
      }
    };
    fetchGrades();
  }, [selectedAssignment, selectedCategory, selectedAcademicYear, selectedSemester, assignments]);

  // Handle score input changes
  const handleScoreChange = (studentId: string, value: string) => {
    const numValue = parseFloat(value);
    if (value === '' || (numValue >= 0 && numValue <= 100)) {
      setScoreInputs((inputs) => ({ ...inputs, [studentId]: value }));
    }
  };

  // Save scores for all students
  const handleSaveScores = async () => {
    if (!selectedAssignment || !selectedCategory || !selectedAcademicYear || !selectedSemester) {
      toast.error('Please select class, subject, exam type, academic year, and semester');
      return;
    }
    const assignment = assignments.find((a) => a.id === selectedAssignment);
    if (!assignment) {
      toast.error('Invalid assignment selected');
      return;
    }
    let successCount = 0;
    for (const student of students) {
      const score = scoreInputs[student.id];
      if (score && score !== '') {
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
          successCount++;
        } catch (err) {
          toast.error(`Failed to save score for ${student.firstName} ${student.lastName}`);
          console.error(`Error saving score for student ${student.id}:`, err);
        }
      }
    }
    if (successCount > 0) {
      toast.success(`${successCount} score(s) saved successfully!`);
      setScoreInputs({});
      // Refresh grades
      const res = await getClassGrades({
        classId: assignment.class.id,
        subjectId: assignment.subject.id,
        categoryId: selectedCategory,
        semesterId: selectedSemester,
        academicYearId: selectedAcademicYear,
      });
      setGrades(res || []);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teacher Dashboard - Student Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear} disabled={loading.academicYears}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={loading.academicYears ? 'Loading...' : 'Select Academic Year'} />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedSemester}
              onValueChange={setSelectedSemester}
              disabled={!semesters.length || loading.academicYears}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={semesters.length ? 'Select Semester' : 'No semesters available'} />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((sem) => (
                  <SelectItem key={sem.id} value={sem.id}>{sem.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedAssignment} onValueChange={setSelectedAssignment} disabled={loading.assignments}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={loading.assignments ? 'Loading...' : 'Select Class & Subject'} />
              </SelectTrigger>
              <SelectContent>
                {assignments.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.class.grade.name} {a.class.section.name} - {a.subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              disabled={!categories.length || loading.categories}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={loading.categories ? 'Loading...' : 'Select Exam Type'} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading.students || loading.grades ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Submitted Grade</TableHead>
                  <TableHead>Submit Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 && selectedAssignment && selectedAcademicYear && selectedSemester ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500">
                      No students found for this selection.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => {
                    const grade = grades.find((g) => g.studentId === student.id);
                    return (
                      <TableRow key={student.id}>
                        <TableCell>{student.firstName} {student.lastName}</TableCell>
                        <TableCell>
                          {grade ? `${grade.pointsEarned} / ${grade.totalPoints}` : 'No score submitted'}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={scoreInputs[student.id] || ''}
                            onChange={(e) => handleScoreChange(student.id, e.target.value)}
                            placeholder="Enter score (0-100)"
                            className="w-24"
                            min="0"
                            max="100"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}

          <div className="mt-4">
            <Button
              onClick={handleSaveScores}
              disabled={
                students.length === 0 ||
                !selectedAssignment ||
                !selectedCategory ||
                !selectedAcademicYear ||
                !selectedSemester ||
                Object.values(scoreInputs).every((score) => !score)
              }
            >
              Save Scores
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}