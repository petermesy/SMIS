import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AcademicYear {
  id: string;
  name: string;
}
interface Grade {
  id: string;
  name: string;
  level?: number;
}

export const AddClassSection = () => {
  const [name, setName] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [academicYearId, setAcademicYearId] = useState('');
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch academic years and grades from backend
    const fetchData = async () => {
      try {
        const [yearsRes, gradesRes] = await Promise.all([
          api.get('/academic-years'),
          api.get('/grades/levels'),
        ]);
        setAcademicYears(yearsRes.data);
        setGrades(gradesRes.data);
        if (yearsRes.data.length > 0) setAcademicYearId(yearsRes.data[0].id);
        if (gradesRes.data.length > 0) setGradeId(gradesRes.data[0].id);
      } catch (err) {
        setError('Failed to load academic years or grades.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/class-sections', { name, gradeId, academicYearId });
      setMessage('Class section added!');
      setName('');
      setGradeId(grades.length > 0 ? grades[0].id : '');
      setAcademicYearId(academicYears.length > 0 ? academicYears[0].id : '');
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setMessage('Failed: ' + (err.response.data.error.message || err.response.data.error));
      } else {
        setMessage('Failed to add class section.');
      }
    }
  };

  if (loading) return <div>Loading academic years and grades...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Add Class Section</CardTitle>
      </CardHeader>
      <CardContent>
        <Form>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Section Name (e.g. A, B, C):</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Grade:</label>
              <Select value={gradeId} onValueChange={setGradeId} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.length === 0 && <SelectItem value="__no_grades" disabled>No grades found</SelectItem>}
                  {grades.map(grade => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.name} {grade.level ? `(Level ${grade.level})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Academic Year:</label>
              <Select value={academicYearId} onValueChange={setAcademicYearId} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.length === 0 && <SelectItem value="__no_academic_years" disabled>No academic years found</SelectItem>}
                  {academicYears.map(year => (
                    <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Add Class Section</Button>
            {message && <div className="mt-2 text-center text-sm text-green-600">{message}</div>}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};