import { useEffect, useState } from 'react';
import { getSemesters } from '@/lib/api';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AdminSemesters() {
  const { user } = useAuth();
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    getSemesters()
      .then(setSemesters)
      .catch(() => setError('Failed to load semesters'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleRegistration = async (semesterId: string, currentValue: boolean) => {
    setUpdating(semesterId);
    try {
  await api.patch(`/semesters/${semesterId}/registration`, { registrationOpen: !currentValue });
      setSemesters(semesters => semesters.map(s => s.id === semesterId ? { ...s, registrationOpen: !currentValue } : s));
    } catch (err) {
      toast.error('Failed to update registration status');
    } finally {
      setUpdating(null);
    }
  };

  if (!user || user.role !== 'admin') return <div>Access denied</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Semesters</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Start Date</th>
                <th className="border px-2 py-1">End Date</th>
                <th className="border px-2 py-1">Registration Open</th>
                <th className="border px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              {semesters.map(sem => (
                <tr key={sem.id}>
                  <td className="border px-2 py-1">{sem.name}</td>
                  <td className="border px-2 py-1">{new Date(sem.startDate).toLocaleDateString()}</td>
                  <td className="border px-2 py-1">{new Date(sem.endDate).toLocaleDateString()}</td>
                  <td className="border px-2 py-1">{sem.registrationOpen ? 'Yes' : 'No'}</td>
                  <td className="border px-2 py-1">
                    <button
                      className={`px-3 py-1 rounded ${sem.registrationOpen ? 'bg-red-600' : 'bg-green-600'} text-white`}
                      onClick={() => handleToggleRegistration(sem.id, sem.registrationOpen)}
                      disabled={updating === sem.id}
                    >
                      {updating === sem.id ? 'Updating...' : sem.registrationOpen ? 'Close Registration' : 'Open Registration'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
