import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

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
          api.get('/grades'),
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
    <form onSubmit={handleSubmit} className="space-y-2">
      <div>
        <label>Section Name (e.g. A, B, C): </label>
        <input value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label>Grade: </label>
        <select value={gradeId} onChange={e => setGradeId(e.target.value)} required>
          <option value="" disabled>Select grade</option>
          {grades.length === 0 && <option disabled>No grades found</option>}
          {grades.map(grade => (
            <option key={grade.id} value={grade.id}>
              {grade.name} {grade.level ? `(Level ${grade.level})` : ''}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Academic Year: </label>
        <select value={academicYearId} onChange={e => setAcademicYearId(e.target.value)} required>
          <option value="" disabled>Select academic year</option>
          {academicYears.length === 0 && <option disabled>No academic years found</option>}
          {academicYears.map(year => (
            <option key={year.id} value={year.id}>{year.name}</option>
          ))}
        </select>
      </div>
      <button type="submit">Add Class Section</button>
      {message && <div>{message}</div>}
    </form>
  );
};