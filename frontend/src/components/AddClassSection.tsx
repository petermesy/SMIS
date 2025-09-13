import { useState } from 'react';
import { api } from '@/lib/api';

export const AddClassSection = () => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/class-sections', { name, grade: Number(grade) });
      setMessage('Class section added!');
      setName('');
      setGrade('');
    } catch (err) {
      setMessage('Failed to add class section.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div>
        <label>Section Name (e.g. A, B, C): </label>
        <input value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label>Grade (e.g. 9, 10, 11, 12): </label>
        <input type="number" value={grade} onChange={e => setGrade(e.target.value)} required min={1} />
      </div>
      <button type="submit">Add Class Section</button>
      {message && <div>{message}</div>}
    </form>
  );
};