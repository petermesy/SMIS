
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  grade: string;
  section: string;
}

interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  examType: 'quiz' | 'midterm' | 'final' | 'assignment' | 'project';
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade: string;
  date: string;
  semester: string;
  remarks?: string;
  teacherId: string;
}

interface TeacherSubject {
  id: string;
  name: string;
  grade: string;
  section: string;
}

export const GradeManagement = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const examTypes = [
    { value: 'quiz', label: 'Quiz' },
    { value: 'midterm', label: 'Midterm Exam' },
    { value: 'final', label: 'Final Exam' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'project', label: 'Project' }
  ];

  const semesters = ['1st Semester', '2nd Semester'];

  // Mock data for teacher's subjects and students
  useEffect(() => {
    if (user?.role === 'teacher') {
      const mockTeacherSubjects: TeacherSubject[] = [
        { id: '1', name: 'Mathematics', grade: 'grade-10', section: 'A' },
        { id: '2', name: 'Physics', grade: 'grade-11', section: 'B' },
        { id: '3', name: 'Chemistry', grade: 'grade-10', section: 'A' },
      ];
      setTeacherSubjects(mockTeacherSubjects);
    }

    const mockStudents: Student[] = [
      { id: '1', firstName: 'Alice', lastName: 'Johnson', rollNumber: '001', grade: 'grade-10', section: 'A' },
      { id: '2', firstName: 'Bob', lastName: 'Smith', rollNumber: '002', grade: 'grade-10', section: 'A' },
      { id: '3', firstName: 'Charlie', lastName: 'Brown', rollNumber: '003', grade: 'grade-10', section: 'A' },
      { id: '4', firstName: 'Diana', lastName: 'Wilson', rollNumber: '004', grade: 'grade-10', section: 'A' },
      { id: '5', firstName: 'Eva', lastName: 'Davis', rollNumber: '005', grade: 'grade-10', section: 'A' },
      { id: '6', firstName: 'Frank', lastName: 'Miller', rollNumber: '006', grade: 'grade-11', section: 'B' },
      { id: '7', firstName: 'Grace', lastName: 'Taylor', rollNumber: '007', grade: 'grade-11', section: 'B' },
    ];

    const mockGrades: Grade[] = [
      {
        id: '1',
        studentId: '1',
        studentName: 'Alice Johnson',
        subjectId: '1',
        subjectName: 'Mathematics',
        examType: 'midterm',
        score: 85,
        maxScore: 100,
        percentage: 85,
        letterGrade: 'A',
        date: '2024-01-15',
        semester: '1st Semester',
        teacherId: user?.id || '1',
      },
      {
        id: '2',
        studentId: '2',
        studentName: 'Bob Smith',
        subjectId: '1',
        subjectName: 'Mathematics',
        examType: 'midterm',
        score: 78,
        maxScore: 100,
        percentage: 78,
        letterGrade: 'B+',
        date: '2024-01-15',
        semester: '1st Semester',
        teacherId: user?.id || '1',
      },
    ];

    setStudents(mockStudents);
    setGrades(mockGrades);
  }, [user]);

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

  const getFilteredStudents = () => {
    if (selectedSubject) {
      const subject = teacherSubjects.find(s => s.id === selectedSubject);
      if (subject) {
        return students.filter(s => s.grade === subject.grade && s.section === subject.section);
      }
    }
    return [];
  };

  const getFilteredGrades = () => {
    let filtered = grades.filter(g => g.teacherId === user?.id);
    
    if (selectedSubject) {
      filtered = filtered.filter(g => g.subjectId === selectedSubject);
    }
    
    if (selectedExamType) {
      filtered = filtered.filter(g => g.examType === selectedExamType);
    }
    
    return filtered;
  };

  const handleAddGrade = () => {
    if (!selectedSubject) {
      toast.error('Please select a subject first');
      return;
    }
    setSelectedGrade(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditGrade = (grade: Grade) => {
    setSelectedGrade(grade);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteGrade = (gradeId: string) => {
    setGrades(grades.filter(g => g.id !== gradeId));
    toast.success('Grade deleted successfully');
  };

  const handleSaveGrade = (gradeData: any) => {
    const percentage = (gradeData.score / gradeData.maxScore) * 100;
    const letterGrade = getLetterGrade(percentage);
    const subject = teacherSubjects.find(s => s.id === selectedSubject);
    
    const fullGradeData = {
      ...gradeData,
      percentage,
      letterGrade,
      subjectId: selectedSubject,
      subjectName: subject?.name || '',
      teacherId: user?.id || '1',
    };

    if (isEditing && selectedGrade) {
      setGrades(grades.map(g => 
        g.id === selectedGrade.id ? { ...g, ...fullGradeData } : g
      ));
      toast.success('Grade updated successfully');
    } else {
      const newGrade: Grade = {
        id: Date.now().toString(),
        ...fullGradeData,
      };
      setGrades([...grades, newGrade]);
      toast.success('Grade added successfully');
    }
    
    setIsDialogOpen(false);
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (user?.role !== 'teacher') {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600 mt-2">Only teachers can manage grades.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Grade Management</h2>
          <p className="text-gray-600">Add and manage student grades for your subjects</p>
        </div>
        <Button onClick={handleAddGrade} disabled={!selectedSubject}>
          <Plus className="w-4 h-4 mr-2" />
          Add Grade
        </Button>
      </div>

      <div className="flex space-x-4 items-center">
        <div className="flex items-center space-x-2">
          <Label>Subject:</Label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {teacherSubjects.map(subject => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name} - {subject.grade.replace('-', ' ').toUpperCase()} {subject.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Label>Exam Type:</Label>
          <Select value={selectedExamType} onValueChange={setSelectedExamType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {examTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>Grades</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Student</th>
                  <th className="text-left p-2">Exam Type</th>
                  <th className="text-left p-2">Score</th>
                  <th className="text-left p-2">Percentage</th>
                  <th className="text-left p-2">Grade</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredGrades().map((grade) => (
                  <tr key={grade.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{grade.studentName}</td>
                    <td className="p-2">
                      <Badge variant="secondary">
                        {examTypes.find(t => t.value === grade.examType)?.label}
                      </Badge>
                    </td>
                    <td className="p-2">{grade.score}/{grade.maxScore}</td>
                    <td className="p-2">{grade.percentage.toFixed(1)}%</td>
                    <td className="p-2">
                      <Badge className={getGradeColor(grade.percentage)}>
                        {grade.letterGrade}
                      </Badge>
                    </td>
                    <td className="p-2">{grade.date}</td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditGrade(grade)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteGrade(grade.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <GradeDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        grade={selectedGrade}
        onSave={handleSaveGrade}
        isEditing={isEditing}
        students={getFilteredStudents()}
        examTypes={examTypes}
        semesters={semesters}
      />
    </div>
  );
};

interface GradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  grade: Grade | null;
  onSave: (gradeData: any) => void;
  isEditing: boolean;
  students: Student[];
  examTypes: { value: string; label: string }[];
  semesters: string[];
}

const GradeDialog = ({ isOpen, onClose, grade, onSave, isEditing, students, examTypes, semesters }: GradeDialogProps) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (grade) {
      setFormData(grade);
    } else {
      setFormData({
        semester: '1st Semester',
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [grade]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentId || !formData.examType || !formData.score || !formData.maxScore) {
      toast.error('Please fill in all required fields');
      return;
    }

    const student = students.find(s => s.id === formData.studentId);
    const updatedFormData = {
      ...formData,
      studentName: student ? `${student.firstName} ${student.lastName}` : '',
      score: parseInt(formData.score),
      maxScore: parseInt(formData.maxScore),
    };

    onSave(updatedFormData);
    setFormData({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Grade' : 'Add Grade'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="studentId">Student</Label>
            <Select
              value={formData.studentId || ''}
              onValueChange={(value) => setFormData({ ...formData, studentId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} ({student.rollNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="examType">Exam Type</Label>
            <Select
              value={formData.examType || ''}
              onValueChange={(value) => setFormData({ ...formData, examType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select exam type" />
              </SelectTrigger>
              <SelectContent>
                {examTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="score">Score</Label>
              <Input
                id="score"
                type="number"
                value={formData.score || ''}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="maxScore">Max Score</Label>
              <Input
                id="maxScore"
                type="number"
                value={formData.maxScore || ''}
                onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="semester">Semester</Label>
            <Select
              value={formData.semester || ''}
              onValueChange={(value) => setFormData({ ...formData, semester: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map(semester => (
                  <SelectItem key={semester} value={semester}>
                    {semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date || ''}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Textarea
              id="remarks"
              value={formData.remarks || ''}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Any additional comments..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update' : 'Add'} Grade
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
