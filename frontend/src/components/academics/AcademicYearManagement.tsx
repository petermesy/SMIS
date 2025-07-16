
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
import { Calendar, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
  description?: string;
  createdAt: string;
}

interface Semester {
  id: string;
  name: string;
  yearId: string;
  yearName: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
  description?: string;
  createdAt: string;
}

export const AcademicYearManagement = () => {
  const { user } = useAuth();
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isYearDialogOpen, setIsYearDialogOpen] = useState(false);
  const [isSemesterDialogOpen, setIsSemesterDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [isEditingYear, setIsEditingYear] = useState(false);
  const [isEditingSemester, setIsEditingSemester] = useState(false);

  // Mock data
  useEffect(() => {
    const mockAcademicYears: AcademicYear[] = [
      {
        id: '1',
        name: '2023-2024',
        startDate: '2023-09-01',
        endDate: '2024-06-30',
        status: 'completed',
        description: 'Academic Year 2023-2024',
        createdAt: '2023-08-01T00:00:00Z',
      },
      {
        id: '2',
        name: '2024-2025',
        startDate: '2024-09-01',
        endDate: '2025-06-30',
        status: 'active',
        description: 'Current Academic Year 2024-2025',
        createdAt: '2024-08-01T00:00:00Z',
      },
    ];

    const mockSemesters: Semester[] = [
      {
        id: '1',
        name: 'First Semester',
        yearId: '2',
        yearName: '2024-2025',
        startDate: '2024-09-01',
        endDate: '2024-12-20',
        status: 'completed',
        description: 'First Semester of 2024-2025',
        createdAt: '2024-08-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Second Semester',
        yearId: '2',
        yearName: '2024-2025',
        startDate: '2025-01-08',
        endDate: '2025-06-30',
        status: 'active',
        description: 'Second Semester of 2024-2025',
        createdAt: '2024-08-01T00:00:00Z',
      },
    ];

    setAcademicYears(mockAcademicYears);
    setSemesters(mockSemesters);
  }, []);

  const handleCreateYear = () => {
    setSelectedYear(null);
    setIsEditingYear(false);
    setIsYearDialogOpen(true);
  };

  const handleEditYear = (year: AcademicYear) => {
    setSelectedYear(year);
    setIsEditingYear(true);
    setIsYearDialogOpen(true);
  };

  const handleDeleteYear = (yearId: string) => {
    const relatedSemesters = semesters.filter(s => s.yearId === yearId);
    if (relatedSemesters.length > 0) {
      toast.error('Cannot delete academic year with existing semesters');
      return;
    }
    setAcademicYears(academicYears.filter(y => y.id !== yearId));
    toast.success('Academic year deleted successfully');
  };

  const handleSaveYear = (yearData: any) => {
    if (isEditingYear && selectedYear) {
      setAcademicYears(academicYears.map(y => 
        y.id === selectedYear.id ? { ...y, ...yearData } : y
      ));
      toast.success('Academic year updated successfully');
    } else {
      const newYear: AcademicYear = {
        id: Date.now().toString(),
        ...yearData,
        createdAt: new Date().toISOString(),
      };
      setAcademicYears([...academicYears, newYear]);
      toast.success('Academic year created successfully');
    }
    setIsYearDialogOpen(false);
  };

  const handleCreateSemester = () => {
    setSelectedSemester(null);
    setIsEditingSemester(false);
    setIsSemesterDialogOpen(true);
  };

  const handleEditSemester = (semester: Semester) => {
    setSelectedSemester(semester);
    setIsEditingSemester(true);
    setIsSemesterDialogOpen(true);
  };

  const handleDeleteSemester = (semesterId: string) => {
    setSemesters(semesters.filter(s => s.id !== semesterId));
    toast.success('Semester deleted successfully');
  };

  const handleSaveSemester = (semesterData: any) => {
    const selectedAcademicYear = academicYears.find(y => y.id === semesterData.yearId);
    
    if (isEditingSemester && selectedSemester) {
      setSemesters(semesters.map(s => 
        s.id === selectedSemester.id ? { 
          ...s, 
          ...semesterData,
          yearName: selectedAcademicYear?.name || ''
        } : s
      ));
      toast.success('Semester updated successfully');
    } else {
      const newSemester: Semester = {
        id: Date.now().toString(),
        ...semesterData,
        yearName: selectedAcademicYear?.name || '',
        createdAt: new Date().toISOString(),
      };
      setSemesters([...semesters, newSemester]);
      toast.success('Semester created successfully');
    }
    setIsSemesterDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <XCircle className="w-4 h-4" />;
      case 'upcoming': return <Calendar className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600 mt-2">Only administrators can manage academic years and semesters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Academic Year & Semester Management</h2>
          <p className="text-gray-600">Manage academic years and semesters for the school</p>
        </div>
      </div>

      {/* Academic Years Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Academic Years</CardTitle>
            <Button onClick={handleCreateYear}>
              <Plus className="w-4 h-4 mr-2" />
              Add Academic Year
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {academicYears.map((year) => (
              <Card key={year.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{year.name}</h3>
                      <Badge className={getStatusColor(year.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(year.status)}
                          <span className="capitalize">{year.status}</span>
                        </div>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <p><strong>Start:</strong> {new Date(year.startDate).toLocaleDateString()}</p>
                    <p><strong>End:</strong> {new Date(year.endDate).toLocaleDateString()}</p>
                    {year.description && <p className="text-gray-600">{year.description}</p>}
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditYear(year)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteYear(year.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Semesters Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Semesters</CardTitle>
            <Button onClick={handleCreateSemester}>
              <Plus className="w-4 h-4 mr-2" />
              Add Semester
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {semesters.map((semester) => (
              <Card key={semester.id} className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{semester.name}</h3>
                      <p className="text-sm text-gray-600">{semester.yearName}</p>
                      <Badge className={getStatusColor(semester.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(semester.status)}
                          <span className="capitalize">{semester.status}</span>
                        </div>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <p><strong>Start:</strong> {new Date(semester.startDate).toLocaleDateString()}</p>
                    <p><strong>End:</strong> {new Date(semester.endDate).toLocaleDateString()}</p>
                    {semester.description && <p className="text-gray-600">{semester.description}</p>}
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSemester(semester)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSemester(semester.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Academic Year Dialog */}
      <AcademicYearDialog
        isOpen={isYearDialogOpen}
        onClose={() => setIsYearDialogOpen(false)}
        academicYear={selectedYear}
        onSave={handleSaveYear}
        isEditing={isEditingYear}
      />

      {/* Semester Dialog */}
      <SemesterDialog
        isOpen={isSemesterDialogOpen}
        onClose={() => setIsSemesterDialogOpen(false)}
        semester={selectedSemester}
        onSave={handleSaveSemester}
        isEditing={isEditingSemester}
        academicYears={academicYears}
      />
    </div>
  );
};

interface AcademicYearDialogProps {
  isOpen: boolean;
  onClose: () => void;
  academicYear: AcademicYear | null;
  onSave: (data: any) => void;
  isEditing: boolean;
}

const AcademicYearDialog = ({ isOpen, onClose, academicYear, onSave, isEditing }: AcademicYearDialogProps) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (academicYear) {
      setFormData(academicYear);
    } else {
      setFormData({
        status: 'upcoming',
      });
    }
  }, [academicYear]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('Start date must be before end date');
      return;
    }

    onSave(formData);
    setFormData({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Academic Year' : 'Create Academic Year'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Academic Year Name</Label>
            <Input
              id="name"
              placeholder="e.g., 2024-2025"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status || ''}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the academic year..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update' : 'Create'} Academic Year
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface SemesterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  semester: Semester | null;
  onSave: (data: any) => void;
  isEditing: boolean;
  academicYears: AcademicYear[];
}

const SemesterDialog = ({ isOpen, onClose, semester, onSave, isEditing, academicYears }: SemesterDialogProps) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (semester) {
      setFormData(semester);
    } else {
      setFormData({
        status: 'upcoming',
      });
    }
  }, [semester]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.yearId || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('Start date must be before end date');
      return;
    }

    onSave(formData);
    setFormData({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Semester' : 'Create Semester'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Semester Name</Label>
            <Input
              id="name"
              placeholder="e.g., First Semester"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="yearId">Academic Year</Label>
            <Select
              value={formData.yearId || ''}
              onValueChange={(value) => setFormData({ ...formData, yearId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map(year => (
                  <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status || ''}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the semester..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update' : 'Create'} Semester
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
