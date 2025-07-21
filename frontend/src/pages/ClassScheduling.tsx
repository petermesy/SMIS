
import { useState, useEffect, useMemo } from 'react';
import { getClasses, getSchedules, createSchedule, updateSchedule, deleteSchedule, getGradeLevelsWithSections, getSubjects, getUsers, getTeacherAssignments } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduleEntry {
  id: string;
  subject: string;
  teacher: string;
  teacherId: string;
  // classroom removed
  grade: string;
  section: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  duration: number;
  color: string;
}

interface TimeSlot {
  time: string;
  periods: ScheduleEntry[];
}

export const ClassScheduling = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<any[]>([]);
  // Track selected teacher in main component for subject filtering
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  // Fetch teacher assignments for subject filtering
  useEffect(() => {
    async function fetchAssignments() {
      try {
        const res = await getTeacherAssignments();
        setTeacherAssignments(res || []);
      } catch (e) {
        setTeacherAssignments([]);
      }
    }
    fetchAssignments();
  }, []);
  // ...existing code...
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [teachers, setTeachers] = useState<any[]>([]);
  // Memoized filtered subjects for selected teacher and selected class
  const filteredSubjects = useMemo(() => {
    if (!teacherAssignments.length || !subjects.length) return subjects;
    if (!selectedTeacherId || !selectedGrade || !selectedSection) return subjects;
    // Find the classId for the selected grade/section
    let classId = null;
    const classes = grades.flatMap((g: any) => g.sections?.map((s: any) => ({ gradeId: g.id, sectionId: s.id, classId: (s.classes && s.classes[0]?.id) || null })));
    const cls = classes.find((c: any) => c && c.gradeId === selectedGrade && c.sectionId === selectedSection);
    if (cls) classId = cls.classId;
    if (!classId) return [];
    // Find subjectIds assigned to selected teacher for this class
    const assigned = teacherAssignments.filter((a: any) => a.teacherId === selectedTeacherId && a.classId === classId);
    const subjectIds = assigned.map((a: any) => a.subjectId);
    return subjects.filter((s: any) => subjectIds.includes(s.id));
  }, [teacherAssignments, subjects, selectedTeacherId, selectedGrade, selectedSection, grades]);
  // Fetch teachers from backend
  useEffect(() => {
    async function fetchTeachers() {
      try {
        const res = await getUsers({ role: 'TEACHER', status: 'ACTIVE' });
        setTeachers(res.users || []);
      } catch (e) {
        setTeachers([]);
      }
    }
    fetchTeachers();
  }, []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  // grades and sections now come from backend
  // Fetch grades from backend (with sections)
  useEffect(() => {
    async function fetchGrades() {
      try {
        const backendGrades = await getGradeLevelsWithSections();
        setGrades(backendGrades);
        if (backendGrades.length > 0) {
          setSelectedGrade(backendGrades[0].id);
        }
      } catch (e) {
        setGrades([]);
      }
    }
    fetchGrades();
  }, []);

  // Fetch sections for selected grade
  useEffect(() => {
    if (!selectedGrade) {
      setSections([]);
      setSelectedSection('');
      return;
    }
    const gradeObj = grades.find((g: any) => g.id === selectedGrade);
    if (gradeObj && gradeObj.sections) {
      setSections(gradeObj.sections);
      if (gradeObj.sections.length > 0) {
        setSelectedSection(gradeObj.sections[0].id);
      } else {
        setSelectedSection('');
      }
    } else {
      setSections([]);
      setSelectedSection('');
    }
  }, [selectedGrade, grades]);
  // Fetch subjects from backend
  useEffect(() => {
    async function fetchSubjects() {
      try {
        const backendSubjects = await getSubjects();
        setSubjects(backendSubjects);
      } catch (e) {
        setSubjects([]);
      }
    }
    fetchSubjects();
  }, []);
  // classrooms removed

  // Fetch schedules from backend for selected grade/section
  useEffect(() => {
    async function fetchSchedules() {
      if (!selectedGrade || !selectedSection) {
        setSchedules([]);
        return;
      }
      try {
        // Get all classes, find the classId for selected grade/section
        const classes = await getClasses();
        const cls = classes.find((c: any) => c.gradeId === selectedGrade && c.sectionId === selectedSection);
        if (!cls) {
          setSchedules([]);
          return;
        }
        const backendSchedules = await getSchedules(cls.id);
        // Map numeric dayOfWeek to string and flatten subject/teacher fields for table rendering
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const mapped = (Array.isArray(backendSchedules) ? backendSchedules : backendSchedules.schedules || []).map(sch => {
          let day = sch.dayOfWeek;
          if (typeof day === 'number') {
            day = dayNames[day] || day;
          }
          // Flatten subject and teacher fields if present
          return {
            ...sch,
            dayOfWeek: day,
            subject: sch.subject?.name || sch.subjectId || sch.subject || '',
            subjectId: sch.subject?.id || sch.subjectId || '',
            teacher: sch.teacher ? `${sch.teacher.firstName} ${sch.teacher.lastName}` : sch.teacherId || sch.teacher || '',
            teacherId: sch.teacher?.id || sch.teacherId || '',
            // classroom removed
          };
        });
        setSchedules(mapped);
      } catch (e) {
        setSchedules([]);
      }
    }
    fetchSchedules();
  }, [selectedGrade, selectedSection]);

  // No need to filter by grade/section anymore, as schedules are fetched per class
  let filteredSchedules = schedules;
  if (user?.role === 'teacher') {
    filteredSchedules = schedules.filter(sch => sch.teacherId === user.id);
  } else if (user?.role === 'student') {
    // For students, only show schedules for their class
    // Assume user.classId is available, otherwise fallback to all
    if (user.classId) {
      filteredSchedules = schedules.filter(sch => sch.classId === user.classId);
    }
  }

  const checkConflicts = (newSchedule: ScheduleEntry) => {
    const conflictIds: string[] = [];
    
    schedules.forEach(schedule => {
      if (schedule.id === newSchedule.id) return;
      // Check teacher conflict
      if (schedule.teacherId === newSchedule.teacherId &&
          schedule.dayOfWeek === newSchedule.dayOfWeek &&
          schedule.startTime === newSchedule.startTime) {
        conflictIds.push(`teacher-${schedule.id}`);
      }
    });
    
    return conflictIds;
  };

  // Returns a map: { [time]: ScheduleEntry[] } for the given day
  const getScheduleForDay = (day: string) => {
    const daySchedules = filteredSchedules.filter(s => s.dayOfWeek === day);
    const map: Record<string, ScheduleEntry[]> = {};
    timeSlots.forEach(time => {
      map[time] = daySchedules.filter(s => s.startTime === time);
    });
    return map;
  };

  const handleCreateSchedule = () => {
    setSelectedSchedule(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditSchedule = (schedule: ScheduleEntry) => {
    setSelectedSchedule(schedule);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setSchedules(schedules.filter(s => s.id !== scheduleId));
    toast.success('Schedule deleted successfully');
  };

  const handleSaveSchedule = async (scheduleData: Partial<ScheduleEntry>) => {
    // Map dayOfWeek string to integer (0=Monday, 1=Tuesday, ...)
    const dayOfWeekMap: Record<string, number> = {
      'Monday': 0,
      'Tuesday': 1,
      'Wednesday': 2,
      'Thursday': 3,
      'Friday': 4
    };
    // Find classId for selected grade/section
    let classId = null;
    try {
      const classes = await getClasses();
      const cls = classes.find((c: any) => c.gradeId === selectedGrade && c.sectionId === selectedSection);
      if (cls) classId = cls.id;
    } catch {}

    if (!classId) {
      toast.error('Class not found for selected grade/section');
      return;
    }

    // Prevent duplicate schedule for same class, day, and startTime
    const duplicate = schedules.find(sch => sch.classId === classId && sch.dayOfWeek === (typeof scheduleData.dayOfWeek === 'string' ? dayOfWeekMap[scheduleData.dayOfWeek] : scheduleData.dayOfWeek) && sch.startTime === scheduleData.startTime);
    if (!isEditing && duplicate) {
      toast.error('A schedule already exists for this class at the same day and time.');
      return;
    }

    // Build payload with all required fields for backend
    const payload = {
      classId,
      subjectId: scheduleData.subjectId || scheduleData.subject || '',
      teacherId: scheduleData.teacherId || '1', // fallback
      dayOfWeek: typeof scheduleData.dayOfWeek === 'string' ? dayOfWeekMap[scheduleData.dayOfWeek] : scheduleData.dayOfWeek,
      startTime: scheduleData.startTime || '',
      endTime: scheduleData.endTime || '',
      room: scheduleData.room || scheduleData.classroom || '',
    };
    console.log('Creating/updating schedule with payload:', payload);

    try {
      if (isEditing && selectedSchedule) {
        await updateSchedule(selectedSchedule.id, payload);
        toast.success('Schedule updated successfully');
      } else {
        await createSchedule(payload);
        toast.success('Schedule created successfully');
      }
      // Re-fetch schedules from backend
      const backendSchedules = await getSchedules(classId);
      setSchedules(Array.isArray(backendSchedules) ? backendSchedules : backendSchedules.schedules || []);
      setIsDialogOpen(false);
      setConflicts([]);
    } catch (e: any) {
      let errorMsg = 'Failed to save schedule';
      if (e?.response?.data) {
        errorMsg += ': ' + (e.response.data.details || e.response.data.error || '');
        if (e.response.data.stack) {
          errorMsg += '\n' + e.response.data.stack;
        }
      }
      toast.error(errorMsg);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Class Scheduling</h1>
          <p className="text-gray-600">Create and manage class timetables</p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={handleCreateSchedule} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Schedule</span>
          </Button>
        )}
      </div>

      {/* List of all schedules
      {(schedules && schedules.length > 0) ? (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">All Schedules</h2>
          <ul className="list-disc pl-5">
            {schedules.map(sch => (
              <li key={sch.id}>
                {(subjects.find(s => s.id === sch.subject || s.id === sch.subjectId)?.name || sch.subject)}
                {' - '}
                {(teachers.find(t => t.id === sch.teacherId)?.firstName + ' ' + teachers.find(t => t.id === sch.teacherId)?.lastName || sch.teacher)}
                {' - '}
                {sch.dayOfWeek} {sch.startTime} - {sch.endTime}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mb-4 text-gray-500">No schedules found.</div>
      )} */}

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center space-x-2">
          <Label>Grade:</Label>
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {grades.map(grade => (
                <SelectItem key={grade.id} value={grade.id}>
                  {grade.name ? grade.name.replace('-', ' ').toUpperCase() : '-'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Label>Section:</Label>
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sections.map(section => (
                <SelectItem key={section.id} value={section.id}>{section.name ? section.name : section.id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>
              Weekly Schedule - {grades.find(g => g.id === selectedGrade)?.name?.replace('-', ' ').toUpperCase() || '-'}
              {sections.length > 0 && ` Section ${sections.find(s => s.id === selectedSection)?.name || selectedSection}`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-50 min-w-20">Time</th>
                  {daysOfWeek.map(day => (
                    <th key={day} className="border p-2 bg-gray-50 min-w-40">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(time => (
                  <tr key={time}>
                    <td className="border p-2 font-medium text-center bg-gray-50">{time}</td>
                    {daysOfWeek.map(day => {
                      const dayScheduleMap = getScheduleForDay(day);
                      const periods = dayScheduleMap[time] || [];
                      return (
                        <td key={`${day}-${time}`} className="border p-1 h-20 relative">
                          {periods.length > 0 ? (
                            <div className="flex flex-col gap-2 h-full">
                              {periods.map(period => (
                                <div key={period.id} 
                                  className="bg-yellow-200 text-gray-900 p-2 rounded text-xs flex flex-col justify-between border border-yellow-400 shadow-sm">
                                  <div>
                                    <div className="font-medium">{subjects.find(s => s.id === period.subject || s.id === period.subjectId)?.name || period.subject}</div>
                                    <div className="text-xs opacity-90">{teachers.find(t => t.id === period.teacherId)?.firstName + ' ' + teachers.find(t => t.id === period.teacherId)?.lastName || period.teacher}</div>
                                    {/* classroom removed */}
                                  </div>
                                  {(user?.role === 'admin' || user?.role === 'teacher') && (
                                    <div className="flex space-x-1 mt-1">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEditSchedule(period)}
                                        className="h-5 w-5 p-0 bg-white/20 border-white/30 hover:bg-white/30"
                                      >
                                        <Edit className="w-2 h-2" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteSchedule(period.id)}
                                        className="h-5 w-5 p-0 bg-white/20 border-white/30 hover:bg-white/30"
                                      >
                                        <Trash2 className="w-2 h-2" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ScheduleDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        schedule={selectedSchedule}
        onSave={handleSaveSchedule}
        isEditing={isEditing}
        subjects={filteredSubjects}
        // classrooms removed
        grades={grades}
        sections={sections}
        timeSlots={timeSlots}
        daysOfWeek={daysOfWeek}
        teachers={teachers}
      />
    </div>
  );
};

interface ScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleEntry | null;
  onSave: (scheduleData: any) => void;
  isEditing: boolean;
  subjects: any[];
  classrooms: string[];
  grades: any[];
  sections: any[];
  timeSlots: string[];
  daysOfWeek: string[];
  teachers: any[];
}


const ScheduleDialog = ({ 
  isOpen, 
  onClose, 
  schedule, 
  onSave, 
  isEditing, 
  subjects, 
  classrooms, 
  grades, 
  sections, 
  timeSlots, 
  daysOfWeek, 
  teachers
}: ScheduleDialogProps) => {
  const [formData, setFormData] = useState<any>({});
  const [localTeacherId, setLocalTeacherId] = useState('');
  useEffect(() => {
    if (schedule) {
      setFormData(schedule);
      setLocalTeacherId(schedule.teacherId || '');
    } else {
      setFormData({});
      setLocalTeacherId('');
    }
  }, [schedule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.startTime && formData.startTime !== '' && formData.subjectId) {
      const startHour = parseInt(formData.startTime.split(':')[0]);
      const endTime = `${String(startHour + 1).padStart(2, '0')}:00`;
      onSave({
        ...formData,
        endTime,
      });
    }
    setFormData({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Schedule' : 'Create New Schedule'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="teacher">Teacher</Label>
            <Select
              value={localTeacherId}
              onValueChange={(value) => {
                setLocalTeacherId(value);
                setFormData({ ...formData, teacherId: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map(teacher => (
                  <SelectItem key={teacher.id} value={teacher.id}>{teacher.firstName} {teacher.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Select
              value={formData.subjectId || ''}
              onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="grade">Grade</Label>
              <Select
                value={formData.grade || ''}
                onValueChange={(value) => setFormData({ ...formData, grade: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(grade => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.name ? grade.name.replace('-', ' ').toUpperCase() : '-'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="section">Section</Label>
              <Select
                value={formData.section || ''}
                onValueChange={(value) => setFormData({ ...formData, section: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map(section => (
                    <SelectItem key={section.id} value={section.id}>{section.name ? section.name : section.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Classroom selection removed */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dayOfWeek">Day</Label>
              <Select
                value={formData.dayOfWeek || ''}
                onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map(day => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Select
                value={formData.startTime || ''}
                onValueChange={(value) => setFormData({ ...formData, startTime: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
