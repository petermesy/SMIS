import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { UserCheck, UserX, Clock, BarChart3, Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getTeacherAssignments, getStudentsByClass, getAttendance, markAttendance as apiMarkAttendance } from '@/lib/api';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  grade: string;
  section: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  subject?: string;
  period?: number;
  remarks?: string;
  markedBy: string;
  markedAt: string;
}

interface AttendanceStats {
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

interface TeacherSubject {
  id: string;
  name: string;
  grade: string;
  section: string;
}

export const AttendanceManagement = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubject[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalStudents: 0,
    present: 0,
    absent: 0,
    late: 0,
    percentage: 0
  });

  const periods = ['1', '2', '3', '4', '5', '6', '7', '8'];

  const getSelectedSubjectName = () => {
    const subject = teacherSubjects.find(s => s.id === selectedSubject);
    return subject?.name || '';
  };

  const getFilteredStudents = () => {
    if (user?.role === 'teacher' && selectedSubject) {
      const subject = teacherSubjects.find(s => s.id === selectedSubject);
      if (subject) {
        return students.filter(s => s.grade === subject.grade && s.section === subject.section);
      }
    }
    return students;
  };

  const filteredStudents = getFilteredStudents();
  const dateString = selectedDate.toISOString().split('T')[0];
  const todayAttendance = attendance.filter(
    a => a.date === dateString && 
         a.subject === getSelectedSubjectName() &&
         (selectedPeriod ? a.period === parseInt(selectedPeriod) : true)
  );

  const calculateStats = () => {
    const total = filteredStudents.length;
    const present = todayAttendance.filter(a => a.status === 'present').length;
    const absent = todayAttendance.filter(a => a.status === 'absent').length;
    const late = todayAttendance.filter(a => a.status === 'late').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    setStats({ totalStudents: total, present, absent, late, percentage });
  };

  // Fetch teacher subjects and students from backend
  useEffect(() => {
    const fetchData = async () => {
      if (user?.role === 'teacher') {
        try {
          const subjects = await getTeacherAssignments();
          setTeacherSubjects(subjects);
          if (subjects.length > 0) {
            setSelectedSubject(subjects[0].id);
          }
        } catch (e) {
          toast.error('Failed to load teacher assignments');
        }
      }
    };
    fetchData();
  }, [user]);

  // Fetch students for selected subject/class
  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedSubject) {
        try {
          const subject = teacherSubjects.find(s => s.id === selectedSubject);
          if (subject) {
            // Assuming subject.id is classId for this API
            const students = await getStudentsByClass(subject.id);
            setStudents(students);
          }
        } catch (e) {
          toast.error('Failed to load students');
        }
      }
    };
    fetchStudents();
  }, [selectedSubject, teacherSubjects]);

  // Fetch attendance for selected class/date
  useEffect(() => {
    const fetchAttendance = async () => {
      if (selectedSubject && selectedDate) {
        try {
          const subject = teacherSubjects.find(s => s.id === selectedSubject);
          if (subject) {
            const dateString = selectedDate.toISOString().split('T')[0];
            const records = await getAttendance(subject.id, dateString);
            setAttendance(records);
          }
        } catch (e) {
          toast.error('Failed to load attendance');
        }
      }
    };
    fetchAttendance();
  }, [selectedSubject, selectedDate, teacherSubjects]);

  useEffect(() => {
    calculateStats();
  }, [filteredStudents, todayAttendance]);

  // Replace markAttendance with API call
  const markAttendance = async (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    if (!selectedSubject || !selectedPeriod) {
      toast.error('Please select subject and period first');
      return;
    }
    try {
      const subject = teacherSubjects.find(s => s.id === selectedSubject);
      if (!subject) return;
      const dateString = selectedDate.toISOString().split('T')[0];
      await apiMarkAttendance({
        studentId,
        classId: subject.id,
        subjectId: subject.id,
        date: dateString,
        period: parseInt(selectedPeriod),
        status,
      });
      // Refresh attendance after marking
      const records = await getAttendance(subject.id, dateString);
      setAttendance(records);
      toast.success(`Attendance marked as ${status}`);
    } catch (e) {
      toast.error('Failed to mark attendance');
    }
  };

  const getStudentAttendance = (studentId: string) => {
    return todayAttendance.find(
      a => a.studentId === studentId && 
           a.period === parseInt(selectedPeriod) && 
           a.subject === getSelectedSubjectName()
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const markAllPresent = () => {
    if (!selectedSubject || !selectedPeriod) {
      toast.error('Please select subject and period first');
      return;
    }

    filteredStudents.forEach(student => {
      if (!getStudentAttendance(student.id)) {
        markAttendance(student.id, 'present');
      }
    });
    toast.success('All students marked as present');
  };

  const generateAttendanceReport = () => {
    const subject = teacherSubjects.find(s => s.id === selectedSubject);
    const reportData = filteredStudents.map(student => {
      const studentAttendance = getStudentAttendance(student.id);
      return {
        name: `${student.firstName} ${student.lastName}`,
        rollNumber: student.rollNumber,
        status: studentAttendance?.status || 'not-marked',
        markedAt: studentAttendance?.markedAt || null,
      };
    });

    console.log('Attendance Report:', {
      subject: subject?.name,
      grade: subject?.grade,
      section: subject?.section,
      period: selectedPeriod,
      date: dateString,
      students: reportData
    });
    toast.success('Attendance report generated');
  };

  if (user?.role !== 'admin' && user?.role !== 'teacher') {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600 mt-2">You don't have permission to manage attendance.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600">Track and manage student attendance</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={markAllPresent} variant="outline" disabled={!selectedSubject || !selectedPeriod}>
            Mark All Present
          </Button>
          <Button onClick={generateAttendanceReport} disabled={!selectedSubject || !selectedPeriod}>
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold">{stats.totalStudents}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <UserCheck className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-2xl font-bold">{stats.present}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <UserX className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-2xl font-bold">{stats.absent}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-bold">{stats.percentage}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Select Date & Class</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
            
            {user?.role === 'teacher' && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Subject:</label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {teacherSubjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} - {(subject.grade ? subject.grade.replace('-', ' ').toUpperCase() : 'N/A')} {subject.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Period:</label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map(period => (
                        <SelectItem key={period} value={period}>Period {period}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
            {selectedSubject && selectedPeriod && (
              <div className="text-sm text-gray-600">
                {getSelectedSubjectName()} - Period {selectedPeriod} - {dateString}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {!selectedSubject || !selectedPeriod ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-600">Please select a subject and period to mark attendance</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredStudents.map((student) => {
                  const attendanceRecord = getStudentAttendance(student.id);
                  return (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{student.firstName} {student.lastName}</p>
                          <p className="text-sm text-gray-600">Roll: {student.rollNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {attendanceRecord && (
                          <Badge className={getStatusColor(attendanceRecord.status)}>
                            {attendanceRecord.status}
                          </Badge>
                        )}
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant={attendanceRecord?.status === 'present' ? 'default' : 'outline'}
                            onClick={() => markAttendance(student.id, 'present')}
                            className="text-xs"
                          >
                            Present
                          </Button>
                          <Button
                            size="sm"
                            variant={attendanceRecord?.status === 'absent' ? 'default' : 'outline'}
                            onClick={() => markAttendance(student.id, 'absent')}
                            className="text-xs"
                          >
                            Absent
                          </Button>
                          <Button
                            size="sm"
                            variant={attendanceRecord?.status === 'late' ? 'default' : 'outline'}
                            onClick={() => markAttendance(student.id, 'late')}
                            className="text-xs"
                          >
                            Late
                          </Button>
                          <Button
                            size="sm"
                            variant={attendanceRecord?.status === 'excused' ? 'default' : 'outline'}
                            onClick={() => markAttendance(student.id, 'excused')}
                            className="text-xs"
                          >
                            Excused
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
