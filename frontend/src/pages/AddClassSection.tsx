import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface Grade { id: string; name: string; level?: number; }
interface AcademicYear { id: string; name: string; }

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
        const [gradesRes, yearsRes] = await Promise.all([
          api.get('/grades/levels'),
          api.get('/academic-years'),
        ]);
        setGrades(gradesRes.data);
        setAcademicYears(yearsRes.data);
        setLoading(false);
      } catch (err: any) {
        setError('Failed to load grades or academic years.');
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
      setGradeId('');
      setAcademicYearId('');
    } catch (err) {
      setMessage('Failed to add class section.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div>
        <label>Section Name:</label>
        <input value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label>Grade:</label>
        <select value={gradeId} onChange={e => setGradeId(e.target.value)} required>
          <option value="">Select grade</option>
          {grades.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Academic Year:</label>
        <select value={academicYearId} onChange={e => setAcademicYearId(e.target.value)} required>
          <option value="">Select academic year</option>
          {academicYears.map(y => (
            <option key={y.id} value={y.id}>{y.name}</option>
          ))}
        </select>
      </div>
      <button type="submit">Add Section</button>
      {message && <div>{message}</div>}
    </form>
  );
};