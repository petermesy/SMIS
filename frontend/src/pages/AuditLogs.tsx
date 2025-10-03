import { useEffect, useState } from 'react';
import { getAuditLogs } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function AuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || (user as any).role?.toString().toLowerCase() !== 'superadmin') return;
    setLoading(true);
    getAuditLogs({ page, pageSize: 50 }).then(res => {
      setLogs(res.items || []);
    }).catch(() => alert('Failed to load audit logs')).finally(() => setLoading(false));
  }, [user, page]);

  if (!user || (user as any).role?.toString().toLowerCase() !== 'superadmin') return <div>Access denied</div>;

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Audit Logs</h2>
      {loading ? <div>Loading...</div> : (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="border px-2 py-1">When</th>
                <th className="border px-2 py-1">Actor</th>
                <th className="border px-2 py-1">Role</th>
                <th className="border px-2 py-1">Route</th>
                <th className="border px-2 py-1">Method</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Body</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id}>
                  <td className="border px-2 py-1">{new Date(l.createdAt).toLocaleString()}</td>
                  <td className="border px-2 py-1">{l.actorId}</td>
                  <td className="border px-2 py-1">{l.actorRole}</td>
                  <td className="border px-2 py-1">{l.route}</td>
                  <td className="border px-2 py-1">{l.method}</td>
                  <td className="border px-2 py-1">{l.status}</td>
                  <td className="border px-2 py-1"><pre className="text-xs">{JSON.stringify(l.body || {}, null, 2)}</pre></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <Button onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
        <Button onClick={() => setPage(p => p + 1)}>Next</Button>
      </div>
    </div>
  );
}
