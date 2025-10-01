import { useEffect, useState } from 'react';
import { getStudentHistory, addStudentHistory } from '@/lib/api';

interface StudentHistoryProps {
  studentId: string;
}

export const StudentHistory: React.FC<StudentHistoryProps> = ({ studentId }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [event, setEvent] = useState('');
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getStudentHistory(studentId).then(setHistory);
  }, [studentId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await addStudentHistory({ studentId, event, count });
    setEvent('');
    setCount(1);
    setLoading(false);
    getStudentHistory(studentId).then(setHistory);
  };

  return (
    <div>
      <h3 className="font-bold mb-2">Student History</h3>
      <ul className="mb-4">
        {history.map(h => (
          <li key={h.id}>{h.event} {h.count} times (on {new Date(h.date).toLocaleDateString()})</li>
        ))}
      </ul>
      <form onSubmit={handleAdd} className="flex gap-2 items-center">
        <select value={event} onChange={e => setEvent(e.target.value)} required className="border px-2 py-1">
          <option value="">Select event</option>
          <option value="repeated">Repeated</option>
          <option value="dropped out">Dropped Out</option>
          <option value="promoted">Promoted</option>
        </select>
        <input type="number" value={count} min={1} onChange={e => setCount(Number(e.target.value))} className="border px-2 py-1 w-16" />
        <button type="submit" disabled={loading} className="bg-blue-500 text-white px-3 py-1 rounded">Add</button>
      </form>
    </div>
  );
};
