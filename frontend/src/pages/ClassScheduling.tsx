
import { useState, useEffect } from 'react';
import { getClasses, getSchedules, createSchedule, updateSchedule, deleteSchedule, getGradeLevelsWithSections } from '@/lib/api';
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
  classroom: string;
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
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
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
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Amharic'];
  const classrooms = ['Room 101', 'Room 102', 'Room 103', 'Lab 1', 'Lab 2', 'Library'];

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
        setSchedules(Array.isArray(backendSchedules) ? backendSchedules : backendSchedules.schedules || []);
      } catch (e) {
        setSchedules([]);
      }
    }
    fetchSchedules();
  }, [selectedGrade, selectedSection]);

  // No need to filter by grade/section anymore, as schedules are fetched per class
  const filteredSchedules = schedules;

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
      
      // Check classroom conflict
      if (schedule.classroom === newSchedule.classroom &&
          schedule.dayOfWeek === newSchedule.dayOfWeek &&
          schedule.startTime === newSchedule.startTime) {
        conflictIds.push(`classroom-${schedule.id}`);
      }
    });
    
    return conflictIds;
  };

  const getScheduleForDay = (day: string) => {
    const daySchedules = filteredSchedules.filter(s => s.dayOfWeek === day);
    return timeSlots.map(time => ({
      time,
      periods: daySchedules.filter(s => s.startTime === time)
    }));
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

    try {
      if (isEditing && selectedSchedule) {
        await updateSchedule(selectedSchedule.id, { ...selectedSchedule, ...scheduleData, classId });
        toast.success('Schedule updated successfully');
      } else {
        await createSchedule({ ...scheduleData, classId });
        toast.success('Schedule created successfully');
      }
      // Re-fetch schedules from backend
      const backendSchedules = await getSchedules(classId);
      setSchedules(Array.isArray(backendSchedules) ? backendSchedules : backendSchedules.schedules || []);
      setIsDialogOpen(false);
      setConflicts([]);
    } catch (e) {
      toast.error('Failed to save schedule');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Class Scheduling</h1>
          <p className="text-gray-600">Create and manage class timetables</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <Button onClick={handleCreateSchedule} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Schedule</span>
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center space-x-2">
          <Label>Grade:</Label>
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {grades.map(grade => (
                <SelectItem key={grade} value={grade}>
                  {grade.replace('-', ' ').toUpperCase()}
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
                <SelectItem key={section} value={section}>{section}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Weekly Schedule - {selectedGrade.replace('-', ' ').toUpperCase()} Section {selectedSection}</span>
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
                      const daySchedule = getScheduleForDay(day);
                      const timeSlot = daySchedule.find(slot => slot.time === time);
                      const period = timeSlot?.periods[0];
                      
                      return (
                        <td key={`${day}-${time}`} className="border p-1 h-20 relative">
                          {period && (
                            <div className={`${period.color} text-white p-2 rounded text-xs h-full flex flex-col justify-between`}>
                              <div>
                                <div className="font-medium">{period.subject}</div>
                                <div className="text-xs opacity-90">{period.teacher}</div>
                                <div className="text-xs opacity-75">{period.classroom}</div>
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
                          )}
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
        subjects={subjects}
        classrooms={classrooms}
        grades={grades}
        sections={sections}
        timeSlots={timeSlots}
        daysOfWeek={daysOfWeek}
      />
    </div>
  );
};

interface ScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleEntry | null;
  onSave: (scheduleData: Partial<ScheduleEntry>) => void;
  isEditing: boolean;
  subjects: string[];
  classrooms: string[];
  grades: string[];
  sections: string[];
  timeSlots: string[];
  daysOfWeek: string[];
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
  daysOfWeek 
}: ScheduleDialogProps) => {
  const [formData, setFormData] = useState<Partial<ScheduleEntry>>({});

  useEffect(() => {
    if (schedule) {
      setFormData(schedule);
    } else {
      setFormData({});
    }
  }, [schedule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.startTime && formData.startTime !== '') {
      const startHour = parseInt(formData.startTime.split(':')[0]);
      const endTime = `${String(startHour + 1).padStart(2, '0')}:00`;
      
      onSave({
        ...formData,
        endTime,
        duration: 60,
        teacher: 'John Smith', // This should come from teacher selection
        teacherId: '1',
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
            <Label htmlFor="subject">Subject</Label>
            <Select
              value={formData.subject || ''}
              onValueChange={(value) => setFormData({ ...formData, subject: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
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
                    <SelectItem key={grade} value={grade}>
                      {grade.replace('-', ' ').toUpperCase()}
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
                    <SelectItem key={section} value={section}>{section}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="classroom">Classroom</Label>
            <Select
              value={formData.classroom || ''}
              onValueChange={(value) => setFormData({ ...formData, classroom: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select classroom" />
              </SelectTrigger>
              <SelectContent>
                {classrooms.map(classroom => (
                  <SelectItem key={classroom} value={classroom}>{classroom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
