import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function Registration() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [semesterName, setSemesterName] = useState<string | null>(null);
  const [academicYearName, setAcademicYearName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const res = await api.get('/students/registration-eligibility');
        setData(res.data);

        // best-effort friendly names for the open semester/academic year
        if (res.data?.openSemesterId) {
          try {
            const sems = await api.get('/semesters');
            const sem = (sems.data || []).find((s: any) => s.id === res.data.openSemesterId);
            if (sem) {
              setSemesterName(sem.name || null);
              if (sem.academicYearId) {
                const years = await api.get('/academic-years');
                const ay = (years.data || []).find((y: any) => y.id === sem.academicYearId);
                if (ay) setAcademicYearName(ay.name || ay.id || null);
              }
            }
          } catch (e) {
            // ignore — best-effort only
          }
        }
      } catch (err) {
        console.error('Failed to load registration info', err);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleRegister = async () => {
    if (!data?.openSemesterId) return setMsg('No open semester');
    setSubmitting(true);
    setMsg(null);
    try {
      await api.post('/student-registration-requests', { semesterId: data.openSemesterId });
      setMsg('Registration request submitted');
    } catch (err: any) {
      setMsg(err?.response?.data?.error || 'Failed to register');
    }
    setSubmitting(false);
  };

  if (!user) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Registration</h1>
      {loading ? <div>Loading...</div> : (
        <div className="space-y-4 max-w-3xl">
          {/* Banner */}
          {data?.openSemesterId ? (
            <div className="mb-3 p-3 rounded bg-green-50 border border-green-200 text-green-800 text-sm">
              Registration is OPEN for <strong>{semesterName || data.openSemesterId}</strong>
              {academicYearName ? <> ({academicYearName})</> : null}
            </div>
          ) : null}

          {/* Ineligibility box (matches screenshot) */}
          {!data?.eligible && (
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded text-red-700">
              <div className="font-semibold mb-2">You are not eligible to register for the upcoming semester/year.</div>
              <div className="mb-2">Your averages:</div>
              <div>English: <strong>{data?.averages?.English !== undefined ? (data.averages.English).toFixed(2) + '%' : 'N/A'}</strong></div>
              <div>Maths: <strong>{data?.averages?.Maths !== undefined ? (data.averages.Maths).toFixed(2) + '%' : 'N/A'}</strong></div>
              <div className="mt-4">To be eligible you must have both English and Maths averages at or above 50% across the academic year.</div>
              {data?.reason && <div className="mt-2 text-sm text-red-600">Reason: {data.reason}</div>}
            </div>
          )}

          {/* Current enrollment summary */}
          {data?.currentEnrollment ? (
            <div className="p-3 border rounded">
              <div className="font-semibold">Current Enrollment</div>
              <div>{data.currentEnrollment.gradeName || `Grade ${data.currentEnrollment.gradeLevel}`} {data.currentEnrollment.section || ''}</div>
              <div className="text-sm text-gray-600">Semester: {data.currentEnrollment.semesterName || data.currentEnrollment.semesterId}</div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No current enrollment data.</div>
          )}

          {/* Eligibility summary */}
          <div className="mt-2 p-3 border rounded bg-white text-sm max-w-md">
            <div className="font-medium">Registration eligibility</div>
            <div>Eligible: <strong>{data?.eligible ? 'Yes' : 'No'}</strong></div>
            <div>English average: <strong>{data?.averages?.English !== undefined ? (data.averages.English).toFixed(2) + '%' : 'N/A'}</strong></div>
            <div>Maths average: <strong>{data?.averages?.Maths !== undefined ? (data.averages.Maths).toFixed(2) + '%' : 'N/A'}</strong></div>
            {data?.reason && <div className="text-sm text-red-600 mt-2">Reason: {data.reason}</div>}
          </div>

          {/* Action */}
          <div className="max-w-md">
            <button disabled={!data?.eligible || !data?.openSemesterId || submitting} onClick={handleRegister} className="mt-2 w-full bg-blue-600 text-white px-3 py-2 rounded disabled:opacity-50">{submitting ? 'Submitting...' : 'Register'}</button>
            {msg && <div className="text-sm mt-2">{msg}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
