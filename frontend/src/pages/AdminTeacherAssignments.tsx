import React, { useEffect, useState } from 'react';
import { getTeacherAssignments } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function AdminTeacherAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    // allow admin and superadmin
    const role = (user.role || '').toString().toLowerCase();
    if (role !== 'admin' && role !== 'superadmin') return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getTeacherAssignments();
        // res is likely an array of teacherSubject assignments; map to include academicYear and semester info
        setAssignments(res || []);
      } catch (err: any) {
        console.error('Failed to load teacher assignments', err);
        toast.error('Failed to load teacher assignments');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  // Group by class -> academicYear (aggregate across semesters)
  const groupedByClass = assignments.reduce((acc: any, item: any) => {
    const className = `${item.class?.grade?.name || ''} ${item.class?.classSection?.name || ''}`.trim() || item.class?.id || 'Unassigned Class';
    const ay = item.academicYear?.name || item.class?.academicYear?.name || 'Unknown Year';

    acc[className] = acc[className] || {};
    acc[className][ay] = acc[className][ay] || [];
    acc[className][ay].push(item);
    return acc;
  }, {} as any);

  if (!user) return <div className="p-6">Please login</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Teacher Assignments (All Years & Semesters)</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        Object.keys(groupedByClass).length === 0 ? (
          <div>No teacher assignments found.</div>
        ) : (
          Object.entries(groupedByClass).map(([className, years]: any) => (
            <div key={className} className="mb-6">
              <h2 className="text-xl font-semibold">{className}</h2>
              {Object.entries(years).map(([ay, items]: any) => {
                // items is an array of all assignments for this class in this academic year (all semesters)
                const unique = items.reduce((acc: any[], it: any) => {
                  // de-duplicate by subjectId+teacherId to avoid duplicates across semesters
                  const key = `${it.subject?.id || it.subjectId}-${it.teacher?.id || it.teacherId}`;
                  if (!acc.find(a => a._key === key)) acc.push({ _key: key, item: it });
                  return acc;
                }, [] as any[]).map(x => x.item);

                return (
                  <div key={`${className}-${ay}`} className="mt-3">
                    <h3 className="font-medium mb-3" >{ay}</h3>
                    <Card>
                      <CardHeader>
                        <CardTitle>All Semesters</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {unique.length === 0 ? (
                          <div className="text-sm text-gray-500">No assignments</div>
                        ) : (
                          <div className="space-y-2">
                            {unique.map((it: any) => (
                              <div key={`${it.id || it.subjectId}-${it.teacherId || it.teacher?.id}`} className="flex justify-between items-center border-b pb-2">
                                <div className="text-sm font-medium">{it.subject?.name || it.subjectId}</div>
                                <div className="text-sm text-gray-700">{it.teacher ? `${it.teacher.firstName} ${it.teacher.lastName}` : it.teacherId}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          ))
        )
      )}
    </div>
  );
}
