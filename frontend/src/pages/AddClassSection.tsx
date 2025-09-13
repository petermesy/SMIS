import { useState } from 'react';
import axios from 'axios';

export const AddClassSection = () => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.post('/api/class-sections', { name, grade: Number(grade) });
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
        <label>Section Name: </label>
        <input value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label>Grade: </label>
        <input type="number" value={grade} onChange={e => setGrade(e.target.value)} required min={1} />
      </div>
      <button type="submit">Add Class Section</button>
      {message && <div>{message}</div>}
    </form>
  );
};