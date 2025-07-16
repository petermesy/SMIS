
import { useEffect, useState } from 'react';
import TeacherClassManagement from './TeacherClassManagement';
import { getUsers, getClasses, assignTeacherToClass, assignStudentToClass, getSubjects, getAcademicYears, getSemesters } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function ClassAssignment() {
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [semesters, setSemesters] = useState<any[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('');

  useEffect(() => {
    getClasses().then(setClasses);
    getUsers({ role: 'TEACHER' }).then(res => setTeachers(res.users || []));
    getUsers({ role: 'STUDENT' }).then(res => setStudents(res.users || []));
    getSubjects().then(setSubjects);
    getAcademicYears().then(setAcademicYears);
  }, []);

  // Fetch semesters when academic year changes
  useEffect(() => {
    if (selectedAcademicYear) {
      const year = academicYears.find((y: any) => y.id === selectedAcademicYear);
      if (year && year.semesters) {
        setSemesters(year.semesters);
      } else {
        getSemesters().then(setSemesters);
      }
    } else {
      setSemesters([]);
    }
    setSelectedSemester('');
  }, [selectedAcademicYear, academicYears]);

  const handleAssignTeacher = async () => {
    if (!selectedClass || !selectedTeacher || !selectedSubject || !selectedAcademicYear || !selectedSemester) {
      toast.error('Select class, teacher, subject, academic year, and semester');
      return;
    }
    try {
      await assignTeacherToClass(selectedClass, { teacherId: selectedTeacher, subjectId: selectedSubject, academicYearId: selectedAcademicYear, semesterId: selectedSemester });
      toast.success('Teacher assigned to class');
      setSelectedTeacher('');
      setSelectedSubject('');
      setSelectedSemester('');
    } catch {
      toast.error('Failed to assign teacher');
    }
  };

  const handleAssignStudent = async () => {
    if (!selectedClass || !selectedStudent || !selectedAcademicYear || !selectedSemester) {
      toast.error('Select class, student, academic year, and semester');
      return;
    }
    try {
      await assignStudentToClass(selectedClass, { studentId: selectedStudent, academicYearId: selectedAcademicYear, semesterId: selectedSemester });
      toast.success('Student assigned to class');
      setSelectedStudent('');
      setSelectedSemester('');
    } catch {
      toast.error('Failed to assign student');
    }
  };


  return (
    <div className="p-6 space-y-6">
      {/* Existing class/teacher/student assignment UI */}
      <Card>
        <CardHeader>
          <CardTitle>Assign Teacher to Class</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
            <SelectContent>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>{cls.grade?.name} {cls.section?.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
            <SelectTrigger><SelectValue placeholder="Select Teacher" /></SelectTrigger>
            <SelectContent>
              {teachers.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
            <SelectContent>
              {subjects.map(subject => (
                <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
            <SelectTrigger><SelectValue placeholder="Select Academic Year" /></SelectTrigger>
            <SelectContent>
              {academicYears.map(year => (
                <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger><SelectValue placeholder="Select Semester" /></SelectTrigger>
            <SelectContent>
              {semesters.map(sem => (
                <SelectItem key={sem.id} value={sem.id}>{sem.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAssignTeacher}>Assign Teacher</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Assign Student to Class</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
            <SelectContent>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>{cls.grade?.name} {cls.section?.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger><SelectValue placeholder="Select Student" /></SelectTrigger>
            <SelectContent>
              {students.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
            <SelectTrigger><SelectValue placeholder="Select Academic Year" /></SelectTrigger>
            <SelectContent>
              {academicYears.map(year => (
                <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger><SelectValue placeholder="Select Semester" /></SelectTrigger>
            <SelectContent>
              {semesters.map(sem => (
                <SelectItem key={sem.id} value={sem.id}>{sem.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAssignStudent}>Assign Student</Button>
        </CardContent>
      </Card>

      {/* Teacher score management UI */}
      <TeacherClassManagement />
    </div>
  );

  // You may want to add this page to your admin sidebar/menu for access.
}
