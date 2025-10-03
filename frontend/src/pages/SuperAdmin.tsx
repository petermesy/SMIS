import { useEffect, useState } from 'react';
import { listAdmins, setUserStatusApi, changeUserRoleApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

export default function SuperAdminPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState<{ type: 'status' | 'promote' | null, user?: any, target?: string | null }>({ type: null });
  const [confirmInput, setConfirmInput] = useState('');

  useEffect(() => {
    setLoading(true);
    listAdmins()
      .then(res => {
        setAdmins(res.admins || []);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load admins');
      })
      .finally(() => setLoading(false));
  }, []);

  const setProcessing = (id: string, on: boolean) => {
    setProcessingIds((prev) => on ? [...prev, id] : prev.filter(x => x !== id));
  };

  const toggleStatus = async (user: any) => {
    const target = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setConfirmPayload({ type: 'status', user, target });
    setConfirmOpen(true);
  };

  const promoteToSuper = async (user: any) => {
    if ((user.role || '').toString().toLowerCase() === 'superadmin') {
      toast('User is already a SUPERADMIN');
      return;
    }
    setConfirmPayload({ type: 'promote', user });
    setConfirmOpen(true);
  };

  const runConfirmed = async () => {
    if (!confirmPayload.type || !confirmPayload.user) {
      setConfirmOpen(false);
      return;
    }
    const user = confirmPayload.user;
    if (confirmPayload.type === 'status') {
      const target = confirmPayload.target as string;
      try {
        setProcessing(user.id, true);
        await setUserStatusApi(user.id, target as any);
        setAdmins((prev) => prev.map(a => a.id === user.id ? { ...a, status: target } : a));
        toast.success('Status updated');
      } catch (e) {
        console.error(e);
        toast.error('Failed to update status');
      } finally {
        setProcessing(user.id, false);
        setConfirmOpen(false);
      }
    } else if (confirmPayload.type === 'promote') {
      // stricter confirmation: require exact email match
      if ((confirmPayload.user?.email || '').toLowerCase() !== confirmInput.trim().toLowerCase()) {
        toast.error('Confirmation text did not match the user email');
        return;
      }
      try {
        setProcessing(user.id, true);
        await changeUserRoleApi(user.id, 'SUPERADMIN');
        setAdmins((prev) => prev.map(a => a.id === user.id ? { ...a, role: 'SUPERADMIN' } : a));
        toast.success('User promoted to SUPERADMIN');
      } catch (e) {
        console.error(e);
        toast.error('Failed to change role');
      } finally {
        setProcessing(user.id, false);
        setConfirmOpen(false);
        setConfirmInput('');
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Super Admin</h2>
      {loading ? (
        <div className="flex items-center">Loading admins...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border">
            <thead>
              <tr className="bg-gray-100"><th className="p-2 text-left">Name</th><th className="p-2 text-left">Email</th><th className="p-2">Role</th><th className="p-2">Status</th><th className="p-2">Actions</th></tr>
            </thead>
            <tbody>
              {admins.map(a => {
                const processing = processingIds.includes(a.id);
                return (
                  <tr key={a.id} className="border-t">
                    <td className="p-2">{a.firstName} {a.lastName}</td>
                    <td className="p-2">{a.email}</td>
                    <td className="p-2 text-center">{a.role}</td>
                    <td className="p-2 text-center">{a.status}</td>
                    <td className="p-2">
                      <Button size="sm" onClick={() => toggleStatus(a)} className="mr-2" disabled={processing}>
                        {processing ? '...' : (a.status === 'ACTIVE' ? 'Disable' : 'Enable')}
                      </Button>
                                      <Button size="sm" onClick={() => promoteToSuper(a)} disabled={processing || (a.role || '').toString().toLowerCase() === 'superadmin'}>
                                        {processing ? '...' : ((a.role || '').toString().toLowerCase() === 'superadmin' ? 'Super' : 'Make Super')}
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {admins.length === 0 && (
                <tr><td colSpan={5} className="p-4 text-center text-sm text-gray-600">No admins found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmPayload.type === 'promote' ? 'Confirm Promotion' : 'Confirm Action'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-yellow-600" />
              <div>
                {confirmPayload.type === 'promote' ? (
                  <p>Promote <strong>{confirmPayload.user?.email}</strong> to SUPERADMIN? This grants full privileges.</p>
                ) : (
                  <p>Set status of <strong>{confirmPayload.user?.email}</strong> to <strong>{confirmPayload.target}</strong>?</p>
                )}
              </div>
            </div>
            {confirmPayload.type === 'promote' && (
              <div className="text-sm">
                <p className="mb-2 text-muted-foreground">Type the user's email to confirm:</p>
                <input value={confirmInput} onChange={(e) => setConfirmInput(e.target.value)} placeholder="user@example.com" className="w-full border px-2 py-1 rounded" />
              </div>
            )}
          </div>
          <DialogFooter>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => { setConfirmOpen(false); setConfirmInput(''); }}>Cancel</Button>
              <Button className={confirmPayload.type === 'promote' ? 'bg-red-600 hover:bg-red-700 text-white' : ''} onClick={runConfirmed}>{confirmPayload.type === 'promote' ? 'Promote (destructive)' : 'Confirm'}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
