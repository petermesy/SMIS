import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getTeacherAssignments,
  getStudentsByClass,
  createGrade,
  getGradeCategories,
  createGradeCategory,
  getClassGrades,
  updateGrade,
  deleteGrade,
  getAcademicYears,
  getGrades,
} from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  subjectId: string;
  subjectName: string;
  examType: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  date: string;
  semester: string;
  remarks?: string;
  className: string;
}

interface StudentGradeCardProps {
  grades: Grade[];
  onGradeUpdated?: () => void;
}

const StudentGradeCard = ({ grades, onGradeUpdated }: StudentGradeCardProps) => {
  // Group grades by studentId and by subject
  const studentMap: {
    [studentId: string]: {
      grades: Grade[];
      studentName: string;
      studentEmail: string;
      className: string;
      subjects: { [subjectName: string]: Grade[] };
    };
  } = {};
  grades.forEach((g) => {
    if (!studentMap[g.studentId]) {
      studentMap[g.studentId] = {
        grades: [],
        studentName: g.studentName,
        studentEmail: g.studentEmail,
        className: g.className,
        subjects: {},
      };
    }
    studentMap[g.studentId].grades.push(g);
    if (!studentMap[g.studentId].subjects[g.subjectName]) {
      studentMap[g.studentId].subjects[g.subjectName] = [];
    }
    studentMap[g.studentId].subjects[g.subjectName].push(g);
  });

  // Get all unique exam types (in order of appearance)
  const examTypes: string[] = [];
  grades.forEach((g) => {
    if (g.examType && !examTypes.includes(g.examType)) {
      examTypes.push(g.examType);
    }
  });

  // Get all unique subject names (in order of appearance)
  const subjectNames: string[] = [];
  grades.forEach((g) => {
    if (g.subjectName && !subjectNames.includes(g.subjectName)) {
      subjectNames.push(g.subjectName);
    }
  });

  const [editModal, setEditModal] = useState<{ open: boolean; grade: Grade | null }>({ open: false, grade: null });
  const [editScore, setEditScore] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const handleEdit = (grade: Grade) => {
    setEditModal({ open: true, grade });
    setEditScore(grade.score.toString());
  };
  const handleSave = async () => {
    if (!editModal.grade) return;
    const numScore = parseFloat(editScore);
    if (isNaN(numScore) || numScore < 0 || numScore > (editModal.grade.maxScore || 100)) {
      toast.error(`Score must be between 0 and ${editModal.grade.maxScore || 100}`);
      return;
    }
    setIsSaving(true);
    try {
      await updateGrade(editModal.grade.id, {
        pointsEarned: numScore,
        totalPoints: editModal.grade.maxScore,
      });
      toast.success('Grade updated successfully');
      setEditModal({ open: false, grade: null });
      setEditScore('');
      if (onGradeUpdated) onGradeUpdated();
    } catch (err: any) {
      toast.error('Failed to update grade');
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <Card className="mt-6 shadow-lg border border-gray-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-md">
        <CardTitle className="text-blue-700 font-bold text-lg tracking-wide">Student Grades</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {Object.keys(studentMap).length === 0 ? (
          <div className="text-center text-gray-500 py-8">No grades available for the selected criteria.</div>
        ) : (
          <div className="overflow-x-auto space-y-8">
            {/* Table for each subject */}
            {subjectNames.map((subjectName) => (
              <div key={subjectName} className="mb-8">
                <div className="font-semibold text-blue-700 text-base mb-2">Subject: {subjectName}</div>
                <Table className="min-w-full text-sm">
                  <TableHeader>
                    <TableRow className="bg-blue-100">
                      <TableHead className="font-semibold text-blue-800">Student</TableHead>
                      {examTypes.map((examType) => (
                        <TableHead key={examType} className="font-semibold text-blue-800 text-center">{examType}</TableHead>
                      ))}
                      <TableHead className="font-semibold text-blue-800 text-center">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(studentMap).map(([studentId, info], idx) => {
                      const subjectGrades = info.subjects[subjectName] || [];
                      // Calculate total for this student in this subject
                      const totalEarned = subjectGrades.reduce((sum, g) => sum + (g.score || 0), 0);
                      const totalPossible = subjectGrades.reduce((sum, g) => sum + (g.maxScore || 0), 0);
                      return (
                        <TableRow key={studentId} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <TableCell className="py-2 px-3 font-medium text-gray-900 whitespace-nowrap">{info.studentName}</TableCell>
                          {examTypes.map((examType) => {
                            const grade = subjectGrades.find((g) => g.examType === examType);
                            return (
                              <TableCell key={examType} className="py-2 px-3 text-center">
                                {grade ? (
                                  <span className="inline-flex items-center bg-gray-50 rounded px-2 py-1 border border-gray-200 shadow-sm">
                                    <span className="font-semibold text-gray-700">{grade.score}</span>
                                    <span className="text-gray-500">/{grade.maxScore}</span>
                                    <Button size="sm" variant="ghost" className="ml-2 p-1 hover:bg-blue-100" onClick={() => handleEdit(grade)}>
                                      <Edit className="w-3 h-3 text-blue-600" />
                                    </Button>
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </TableCell>
                            );
                          })}
                          <TableCell className="py-2 px-3 text-center font-bold text-blue-800">
                            {totalEarned}/{totalPossible}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        )}
        {/* Edit Score Modal */}
        <Dialog open={editModal.open} onOpenChange={() => setEditModal({ open: false, grade: null })}>
          <DialogContent className="max-w-xs mx-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-700">Edit Score</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">Score</label>
              <Input
                type="number"
                min="0"
                max={editModal.grade?.maxScore || 100}
                value={editScore}
                onChange={e => setEditScore(e.target.value)}
                placeholder={`Enter score (0-${editModal.grade?.maxScore || 100})`}
                className="w-full border-blue-200 focus:border-blue-400 focus:ring-blue-200"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" className="mr-2" onClick={() => setEditModal({ open: false, grade: null })}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 text-white hover:bg-blue-700">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default function TeacherClassManagement() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [scores, setScores] = useState<{ [studentId: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryWeight, setNewCategoryWeight] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [semesters, setSemesters] = useState<any[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [loading, setLoading] = useState({
    assignments: false,
    academicYears: false,
    students: false,
    categories: false,
    grades: false,
  });

  // Fetch initial data
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
        console.log('Fetched assignments:', assignmentsRes);
        console.log('Fetched academic years:', academicYearsRes);
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
      setSelectedCategory('');
      setStudents([]);
      setGrades([]);
    } else {
      setSemesters([]);
      setSelectedSemester('');
      setSelectedCategory('');
      setStudents([]);
      setGrades([]);
    }
  }, [selectedAcademicYear, academicYears]);

  // Fetch students
  useEffect(() => {
    let cancelled = false;
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
        if (!cancelled) {
          setStudents(fetchedStudents);
          console.log('Fetched students:', fetchedStudents);
        }
      } catch (err: any) {
        if (!cancelled) {
          setStudents([]);
          toast.error('Failed to load students: ' + (err.response?.data?.error || err.message));
          console.error('Error fetching students:', err);
        }
      } finally {
        if (!cancelled) setLoading((prev) => ({ ...prev, students: false }));
      }
    };
    fetchStudents();
    return () => {
      cancelled = true;
    };
  }, [selectedAssignment, selectedAcademicYear, selectedSemester, assignments]);

  // Fetch grade categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!selectedAssignment) {
        setCategories([]);
        setSelectedCategory('');
        return;
      }
      setLoading((prev) => ({ ...prev, categories: true }));
      const assignment = assignments.find((a) => a.id === selectedAssignment);
      if (!assignment) {
        setCategories([]);
        setSelectedCategory('');
        setLoading((prev) => ({ ...prev, categories: false }));
        return;
      }
      try {
        const res = await getGradeCategories({
          classId: assignment.class.id,
          subjectId: assignment.subject.id,
        });
        setCategories(res || []);
        console.log('Fetched categories:', res);
      } catch (err: any) {
        setCategories([]);
        setSelectedCategory('');
        toast.error('Failed to load grade categories: ' + (err.response?.data?.error || err.message));
        console.error('Error fetching categories:', err);
      } finally {
        setLoading((prev) => ({ ...prev, categories: false }));
      }
    };
    fetchCategories();
  }, [selectedAssignment, assignments]);

  // Fetch grades
  useEffect(() => {
    const fetchGrades = async () => {
      if (!selectedAssignment || !selectedAcademicYear || !selectedSemester) {
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
        // Do NOT include exam type/category as a filter
        const params = {
          classId: assignment.class.id,
          subjectId: assignment.subject.id,
          semesterId: selectedSemester,
          academicYearId: selectedAcademicYear,
        };
        console.log('Fetching grades with params (no category):', params);
        let gradesRes;
        try {
          gradesRes = await getClassGrades(params);
          console.log('getClassGrades response:', gradesRes);
        } catch (err: any) {
          console.warn('getClassGrades failed, falling back to getGrades:', err.message);
          gradesRes = await getGrades();
          console.log('getGrades response:', gradesRes);
          gradesRes = gradesRes.filter(
            (g: any) =>
              g.classId === assignment.class.id &&
              g.subjectId === assignment.subject.id &&
              g.semesterId === selectedSemester &&
              g.academicYearId === selectedAcademicYear
          );
          console.log('Filtered getGrades results:', gradesRes);
        }
        const mappedGrades = gradesRes.map((g: any) => ({
          id: g.id,
          studentId: g.studentId,
          studentName: g.studentName || (g.student ? `${g.student.firstName} ${g.student.lastName}` : ''),
          studentEmail: g.studentEmail || g.student?.email || '',
          subjectId: g.subjectId,
          subjectName: g.subjectName || g.subject?.name || '',
          examType: g.examType || g.category?.name || '',
          score: g.score || g.pointsEarned,
          maxScore: g.maxScore || g.totalPoints,
          percentage: g.percentage || (g.totalPoints > 0 ? (g.pointsEarned / g.totalPoints) * 100 : 0),
          grade: g.grade || getLetterGrade(g.totalPoints > 0 ? (g.pointsEarned / g.totalPoints) * 100 : 0),
          date: g.date ? new Date(g.date).toLocaleDateString() : '',
          semester: g.semester || g.semester?.name || '',
        }));
        setGrades(mappedGrades);
        console.log('Mapped grades:', mappedGrades);
      } catch (err: any) {
        setGrades([]);
        const errorMessage = err.response?.status === 404
          ? 'Grade endpoint not found. Please check if /api/grades/class/all is configured in the backend.'
          : err.response?.data?.error || err.message;
        toast.error(`Failed to load grades: ${errorMessage}`);
        console.error('Error fetching grades:', err);
      } finally {
        setLoading((prev) => ({ ...prev, grades: false }));
      }
    };
    fetchGrades();
  }, [selectedAssignment, selectedCategory, selectedAcademicYear, selectedSemester, assignments]);

  const getLetterGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A';
    if (percentage >= 85) return 'A-';
    if (percentage >= 80) return 'B+';
    if (percentage >= 75) return 'B';
    if (percentage >= 70) return 'B-';
    if (percentage >= 65) return 'C+';
    if (percentage >= 60) return 'C';
    if (percentage >= 55) return 'C-';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  // Handle score input changes
  const handleScoreChange = (studentId: string, value: string) => {
    const numValue = parseFloat(value);
    if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 100)) {
      setScores((prev) => ({ ...prev, [studentId]: value }));
    }
  };

  // Submit scores
const handleSubmitScores = async () => {
  if (!selectedAssignment || !selectedCategory || !selectedAcademicYear || !selectedSemester) {
    toast.error('Please select class, subject, exam type, academic year, and semester');
    return;
  }

  const assignment = assignments.find((a) => a.id === selectedAssignment);
  if (!assignment) {
    toast.error('Invalid assignment selected');
    return;
  }

  setIsSubmitting(true);
  let successCount = 0;
  const selectedCat = categories.find((c) => c.id === selectedCategory);
  const weight = selectedCat ? Number(selectedCat.weight) : 100;

  try {
    // For each student, check if their total exam weights < 100 before allowing submission
    for (const student of students) {
      const score = scores[student.id];
      if (score && !isNaN(Number(score))) {
        // Calculate total weight for this student for this subject/class/semester/year
        const studentGrades = grades.filter(
          (g) =>
            g.studentId === student.id &&
            g.subjectId === assignment.subject.id &&
            g.className === (assignment.class.grade.name + ' ' + assignment.class.section.name) &&
            g.semester === (semesters.find(s => s.id === selectedSemester)?.name || selectedSemester)
        );
        const totalWeight = studentGrades.reduce((sum, g) => {
          // Find the category for this grade
          const cat = categories.find(c => c.name === g.examType);
          return sum + (cat ? Number(cat.weight) : 0);
        }, 0);
        // If adding this exam would exceed 100, block submission
        if (totalWeight + weight > 100) {
          toast.error(`Cannot add score for ${student.firstName} ${student.lastName}: total exam weights would exceed 100%.`);
          continue;
        }
        if (totalWeight === 100) {
          toast.info(`Cannot add more scores for ${student.firstName} ${student.lastName}: total exam weights already 100%.`);
          continue;
        }
        try {
          const response = await createGrade({
            studentId: student.id,
            subjectId: assignment.subject.id,
            classId: assignment.class.id,
            categoryId: selectedCategory,
            semesterId: selectedSemester,
            academicYearId: selectedAcademicYear,
            pointsEarned: Number(score),
            totalPoints: weight,
            date: new Date().toISOString(),
            createdBy: user?.id,
          });

          if (response && response.id) {
            successCount++;
          }
        } catch (err) {
          console.error(`Error submitting score for ${student.firstName} ${student.lastName}:`, err);
          toast.error(`Failed to submit score for ${student.firstName} ${student.lastName}`);
        }
      }
    }

    // Refresh grades after successful submission
    if (successCount > 0) {
      try {
        let gradesRes;
        try {
          gradesRes = await getClassGrades({
            classId: assignment.class.id,
            subjectId: assignment.subject.id,
            categoryId: selectedCategory,
            semesterId: selectedSemester,
            academicYearId: selectedAcademicYear,
          });
          // If the response is a string and looks like HTML, treat as error
          if (typeof gradesRes === 'string' && gradesRes.trim().startsWith('<')) {
            throw new Error('Invalid JSON response');
          }
        } catch (err) {
          // Fallback to getGrades if getClassGrades fails or returns HTML
          gradesRes = await getGrades();
          gradesRes = gradesRes.filter(
            (g: any) =>
              g.classId === assignment.class.id &&
              g.subjectId === assignment.subject.id &&
              g.categoryId === selectedCategory &&
              g.semesterId === selectedSemester &&
              g.academicYearId === selectedAcademicYear
          );
        }
        const mappedGrades = gradesRes.map((g: any) => ({
          id: g.id,
          studentId: g.studentId,
          studentName: g.studentName || `${g.student?.firstName} ${g.student?.lastName}` || '',
          studentEmail: g.studentEmail || g.student?.email || '',
          subjectId: g.subjectId,
          subjectName: g.subjectName || g.subject?.name || '',
          examType: g.examType || g.category?.name || '',
          score: g.score || g.pointsEarned,
          maxScore: g.maxScore || g.totalPoints,
          percentage: g.percentage || (g.totalPoints > 0 ? (g.pointsEarned / g.totalPoints) * 100 : 0),
          grade: g.grade || getLetterGrade(g.totalPoints > 0 ? (g.pointsEarned / g.totalPoints) * 100 : 0),
          date: g.date ? new Date(g.date).toLocaleDateString() : '',
          semester: g.semester || g.semester?.name || '',
          remarks: g.remarks || '',
          className: g.className || (g.class ? `${g.class.grade?.name} ${g.class.section?.name}` : ''),
        }));

        setGrades(mappedGrades);
        setScores({});
        toast.success(`${successCount} score(s) submitted successfully!`);
      } catch (refreshErr) {
        console.error('Error refreshing grades:', refreshErr);
        toast.error('Scores submitted but failed to refresh grade list');
      }
    } else {
      toast.info('No new scores to submit');
    }
  } catch (err) {
    console.error('Error submitting scores:', err);
    toast.error('Failed to submit scores');
  } finally {
    setIsSubmitting(false);
  }
};

  // Create new grade category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !newCategoryName || !newCategoryWeight) {
      toast.error('Please provide exam name and weight');
      return;
    }
    const assignment = assignments.find((a) => a.id === selectedAssignment);
    if (!assignment) return;
    const weight = Number(newCategoryWeight);
    if (isNaN(weight) || weight < 1 || weight > 100) {
      toast.error('Weight must be between 1 and 100');
      return;
    }
    // Calculate total weight of all existing categories for this assignment
    const totalWeight = categories.reduce((sum, cat) => sum + Number(cat.weight || 0), 0);
    if (totalWeight + weight > 100) {
      toast.error('You have reached the maximum total weight of 100% for exam types.');
      return;
    }
    if (totalWeight === 100) {
      toast.info('You have already reached the maximum total weight of 100% for exam types.');
      return;
    }
    const duplicate = categories.find(
      (cat) => cat.name.trim().toLowerCase() === newCategoryName.trim().toLowerCase() && Number(cat.weight) === weight
    );
    if (duplicate) {
      toast.error('Exam type with this name and weight already exists');
      return;
    }
    setIsCreatingCategory(true);
    try {
      await createGradeCategory({
        name: newCategoryName,
        weight,
        classId: assignment.class.id,
        subjectId: assignment.subject.id,
      });
      const res = await getGradeCategories({
        classId: assignment.class.id,
        subjectId: assignment.subject.id,
      });
      setCategories(res || []);
      const newCat = res.find(
        (cat: any) => cat.name.trim().toLowerCase() === newCategoryName.trim().toLowerCase() && Number(cat.weight) === weight
      );
      if (newCat) setSelectedCategory(newCat.id);
      setNewCategoryName('');
      setNewCategoryWeight('');
      toast.success('Exam type created');
    } catch (err: any) {
      toast.error('Failed to create exam type: ' + (err.response?.data?.error || err.message));
      console.error('Error creating category:', err);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Handle grade editing
const handleEditGrade = async (gradeId: string) => {
  const numScore = parseFloat(editScore);
  if (isNaN(numScore) || numScore < 0 || numScore > 100) {
    toast.error('Score must be between 0 and 100');
    return;
  }

  try {
    const selectedCat = categories.find((c) => c.id === selectedCategory);
    const weight = selectedCat ? Number(selectedCat.weight) : 100;
    
    // Update the grade
    const response = await updateGrade(gradeId, { 
      pointsEarned: numScore, 
      totalPoints: weight 
    });

    if (!response) {
      throw new Error('No response from server');
    }

    // Refresh the grades list
    const assignment = assignments.find((a) => a.id === selectedAssignment);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    const gradesRes = await getClassGrades({
      classId: assignment.class.id,
      subjectId: assignment.subject.id,
      categoryId: selectedCategory,
      semesterId: selectedSemester,
      academicYearId: selectedAcademicYear,
    });

    const mappedGrades = gradesRes.map((g: any) => ({
      id: g.id,
      studentId: g.studentId,
      studentName: g.studentName || `${g.student?.firstName} ${g.student?.lastName}` || '',
      studentEmail: g.studentEmail || g.student?.email || '',
      subjectId: g.subjectId,
      subjectName: g.subjectName || g.subject?.name || '',
      examType: g.examType || g.category?.name || '',
      score: g.score || g.pointsEarned,
      maxScore: g.maxScore || g.totalPoints,
      percentage: g.percentage || (g.totalPoints > 0 ? (g.pointsEarned / g.totalPoints) * 100 : 0),
      grade: g.grade || getLetterGrade(g.totalPoints > 0 ? (g.pointsEarned / g.totalPoints) * 100 : 0),
      date: g.date ? new Date(g.date).toLocaleDateString() : '',
      semester: g.semester || g.semester?.name || '',
      remarks: g.remarks || '',
      className: g.className || (g.class ? `${g.class.grade?.name} ${g.class.section?.name}` : ''),
    }));

    setGrades(mappedGrades);
    setEditingGradeId(null);
    setEditScore('');
    toast.success('Grade updated successfully');
  } catch (err: any) {
    console.error('Error updating grade:', err);
    const errorMessage = err.response?.data?.message || 
                        err.message || 
                        'Failed to update grade';
    toast.error(errorMessage);
  }
};

  // Handle grade deletion
const handleDeleteGrade = async () => {
  if (!deleteConfirmId) return;

  try {
    const response = await deleteGrade(deleteConfirmId);
    
    if (response?.status !== 204 && !response?.id) {
      throw new Error('Delete operation failed');
    }

    // Refresh the grades list
    const assignment = assignments.find((a) => a.id === selectedAssignment);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    const gradesRes = await getClassGrades({
      classId: assignment.class.id,
      subjectId: assignment.subject.id,
      categoryId: selectedCategory,
      semesterId: selectedSemester,
      academicYearId: selectedAcademicYear,
    });

    const mappedGrades = gradesRes.map((g: any) => ({
      id: g.id,
      studentId: g.studentId,
      studentName: g.studentName || `${g.student?.firstName} ${g.student?.lastName}` || '',
      studentEmail: g.studentEmail || g.student?.email || '',
      subjectId: g.subjectId,
      subjectName: g.subjectName || g.subject?.name || '',
      examType: g.examType || g.category?.name || '',
      score: g.score || g.pointsEarned,
      maxScore: g.maxScore || g.totalPoints,
      percentage: g.percentage || (g.totalPoints > 0 ? (g.pointsEarned / g.totalPoints) * 100 : 0),
      grade: g.grade || getLetterGrade(g.totalPoints > 0 ? (g.pointsEarned / g.totalPoints) * 100 : 0),
      date: g.date ? new Date(g.date).toLocaleDateString() : '',
      semester: g.semester || g.semester?.name || '',
      remarks: g.remarks || '',
      className: g.className || (g.class ? `${g.class.grade?.name} ${g.class.section?.name}` : ''),
    }));

    setGrades(mappedGrades);
    setDeleteConfirmId(null);
    toast.success('Grade deleted successfully');
  } catch (err: any) {
    console.error('Error deleting grade:', err);
    const errorMessage = err.response?.data?.message || 
                        err.message || 
                        'Failed to delete grade';
    toast.error(errorMessage);
  }
};

  if (user?.role !== 'teacher') {
    return <div className="p-6 text-center text-red-500">Access Denied</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Assigned Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select
              value={selectedAcademicYear}
              onValueChange={setSelectedAcademicYear}
              disabled={loading.academicYears}
            >
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
            <Select
              value={selectedAssignment}
              onValueChange={setSelectedAssignment}
              disabled={loading.assignments}
            >
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
          </div>
        </CardContent>
      </Card>

      {selectedAssignment && selectedAcademicYear && selectedSemester && (
        <Card>
          <CardHeader>
            <CardTitle>Grade Management</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCategory} className="mb-6 flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Exam Name</label>
                <Input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Test 1"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Weight (%)</label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={newCategoryWeight}
                  onChange={(e) => setNewCategoryWeight(e.target.value)}
                  placeholder="e.g. 20"
                  required
                />
              </div>
              <Button type="submit" disabled={isCreatingCategory}>
                {isCreatingCategory ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Exam Type'}
              </Button>
            </form>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Select Exam Type</label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                disabled={loading.categories || !categories.length}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={loading.categories ? 'Loading...' : 'Select Exam Type'} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name} ({cat.weight}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading.students || loading.grades ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center text-gray-500">
                No students found for the selected class, academic year, and semester.
              </div>
            ) : (
              <>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitScores();
                  }}
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Current Grade</TableHead>
                        <TableHead>Submit Score</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => {
                        // Only disable if the student already has a grade for the selected exam type
                        const examTypeName = categories.find(c => c.id === selectedCategory)?.name;
                        const grade = grades.find((g) => g.studentId === student.id && g.examType === examTypeName);
                        const hasGrade = !!grade;
                        return (
                          <TableRow key={student.id} className="hover:bg-gray-50">
                            <TableCell>
                              {student.firstName} {student.lastName}
                            </TableCell>
                            <TableCell>
                              {hasGrade ? (
                                <>
                                  {grade.score}/{grade.maxScore} ({grade.percentage.toFixed(1)}%, {grade.grade})
                                </>
                              ) : (
                                'No grade submitted'
                              )}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={scores[student.id] || ''}
                                onChange={(e) => handleScoreChange(student.id, e.target.value)}
                                placeholder="Enter score (0-100)"
                                className="w-24"
                                disabled={!selectedCategory || hasGrade}
                              />
                            </TableCell>
                            <TableCell>
                              {hasGrade ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingGradeId(grade.id);
                                      setEditScore(grade.score.toString());
                                    }}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="ml-2 text-red-600"
                                    onClick={() => setDeleteConfirmId(grade.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </>
                              ) : (
                                <span className="text-gray-400">Add score</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !selectedCategory ||
                      !students.some(student => {
                        const examTypeName = categories.find(c => c.id === selectedCategory)?.name;
                        const hasGrade = grades.some(g => g.studentId === student.id && g.examType === examTypeName);
                        const score = scores[student.id];
                        return score && !isNaN(Number(score)) && !hasGrade;
                      })
                    }
                    className="mt-4"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Scores'}
                  </Button>
                </form>

                <StudentGradeCard grades={grades} onGradeUpdated={() => {
                  // Re-fetch grades after edit in modal
                  // This logic is similar to the fetchGrades effect
                  (async () => {
                    if (!selectedAssignment || !selectedAcademicYear || !selectedSemester) return;
                    setLoading((prev) => ({ ...prev, grades: true }));
                    const assignment = assignments.find((a) => a.id === selectedAssignment);
                    if (!assignment) return;
                    try {
                      const params = {
                        classId: assignment.class.id,
                        subjectId: assignment.subject.id,
                        semesterId: selectedSemester,
                        academicYearId: selectedAcademicYear,
                      };
                      let gradesRes;
                      try {
                        gradesRes = await getClassGrades(params);
                      } catch (err: any) {
                        gradesRes = await getGrades();
                        gradesRes = gradesRes.filter(
                          (g: any) =>
                            g.classId === assignment.class.id &&
                            g.subjectId === assignment.subject.id &&
                            g.semesterId === selectedSemester &&
                            g.academicYearId === selectedAcademicYear
                        );
                      }
                      const mappedGrades = gradesRes.map((g: any) => ({
                        id: g.id,
                        studentId: g.studentId,
                        studentName: g.studentName || (g.student ? `${g.student.firstName} ${g.student.lastName}` : ''),
                        studentEmail: g.studentEmail || g.student?.email || '',
                        subjectId: g.subjectId,
                        subjectName: g.subjectName || g.subject?.name || '',
                        examType: g.examType || g.category?.name || '',
                        score: g.score || g.pointsEarned,
                        maxScore: g.maxScore || g.totalPoints,
                        percentage: g.percentage || (g.totalPoints > 0 ? (g.pointsEarned / g.totalPoints) * 100 : 0),
                        grade: g.grade || getLetterGrade(g.totalPoints > 0 ? (g.pointsEarned / g.totalPoints) * 100 : 0),
                        date: g.date ? new Date(g.date).toLocaleDateString() : '',
                        semester: g.semester || g.semester?.name || '',
                      }));
                      setGrades(mappedGrades);
                    } catch (err: any) {
                      setGrades([]);
                    } finally {
                      setLoading((prev) => ({ ...prev, grades: false }));
                    }
                  })();
                }} />
              </>
            )}
          </CardContent>
        </Card>
      )}

<Dialog open={!!editingGradeId} onOpenChange={() => setEditingGradeId(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Grade</DialogTitle>
    </DialogHeader>
    <div className="py-4">
      <label className="block text-sm font-medium mb-1">Score</label>
      <Input
        type="number"
        min="0"
        max="100"
        value={editScore}
        onChange={(e) => setEditScore(e.target.value)}
        placeholder="Enter score (0-100)"
      />
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setEditingGradeId(null)}>
        Cancel
      </Button>
      <Button 
        onClick={() => {
          if (editingGradeId) {
            handleEditGrade(editingGradeId);
          }
        }}
      >
        Save
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

<Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Deletion</DialogTitle>
    </DialogHeader>
    <div className="py-4">
      Are you sure you want to delete this grade? This action cannot be undone.
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleDeleteGrade}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
}