import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Alert } from '../components/ui/alert';

export default function AdminRegistrationRequests() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchRequests = () => {
    api.get('/student-registration-requests')
      .then(res => setRequests(res.data))
      .catch(() => setError('Failed to fetch registration requests.'));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await api.post(`/student-registration-requests/${id}/approve`);
      setSuccess(res.data.message || 'Approved!');
      fetchRequests();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to approve request.');
    }
  };

  const handleReject = async (id: string) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await api.post(`/student-registration-requests/${id}/reject`);
      setSuccess(res.data.message || 'Rejected!');
      fetchRequests();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to reject request.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Pending Student Registration Requests</h2>
      {error && <Alert variant="destructive">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <Card><CardContent>No pending requests.</CardContent></Card>
        ) : (
          requests.map((req: any) => (
            <Card key={req.id}>
              <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <div className="font-semibold">{req.student.firstName} {req.student.lastName}</div>
                  <div className="text-sm text-gray-500">Semester: {req.semester.name}</div>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <Button variant="success" onClick={() => handleApprove(req.id)}>Approve</Button>
                  <Button variant="destructive" onClick={() => handleReject(req.id)}>Reject</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}