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

  // Group by class -> academicYear -> semester
  const groupedByClass = assignments.reduce((acc: any, item: any) => {
    const className = `${item.class?.grade?.name || ''} ${item.class?.classSection?.name || ''}`.trim() || item.class?.id || 'Unassigned Class';
  const ay = item.academicYear?.name || item.class?.academicYear?.name || 'Unknown Year';
  // Determine semester display: prefer explicit semester, else list semesters for the academic year
  let sem = '';
  if (item.semester?.name) sem = item.semester.name;
  else if (item.academicYear?.semesters?.length) sem = item.academicYear.semesters.map((s: any) => s.name).join(', ');
  else if (item.class?.academicYear?.semesters?.length) sem = item.class.academicYear.semesters.map((s: any) => s.name).join(', ');
  else sem = 'All Semesters';

    acc[className] = acc[className] || {};
    acc[className][ay] = acc[className][ay] || {};
    acc[className][ay][sem] = acc[className][ay][sem] || [];
    acc[className][ay][sem].push(item);
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
              {Object.entries(years).map(([ay, sems]: any) => {
                // Build a semesters array for this academic year (preserve order if present)
                const semesterNames = (() => {
                  // try to find any semester list from the first item in sems
                  const firstSemKey = Object.keys(sems)[0];
                  const firstItems = sems[firstSemKey] || [];
                  const ayObj = firstItems.find((i: any) => i.academicYear)?.academicYear || firstItems[0]?.class?.academicYear;
                  if (ayObj?.semesters && ayObj.semesters.length) return ayObj.semesters.map((s: any) => ({ id: s.id, name: s.name }));
                  // fallback to common two semesters
                  return [ { id: 'first', name: 'First Semester' }, { id: 'second', name: 'Second Semester' } ];
                })();

                return (
                  <div key={`${className}-${ay}`} className="mt-3">
                    <h3 className="font-medium mb-3">{ay}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {semesterNames.map((semDef: any) => {
                        // collect items for this semester: explicit matches OR assignments without semester but matching academic year
                        const itemsForSem: any[] = [];
                        Object.values(sems).forEach((arr: any) => {
                          (arr as any[]).forEach((it: any) => {
                            const itAyId = it.academicYear?.id || it.class?.academicYear?.id;
                            const semId = it.semester?.id || it.semester?.name;
                            if (semId) {
                              // compare by id or name
                              if (semId === semDef.id || semId === semDef.name) {
                                itemsForSem.push(it);
                              }
                            } else {
                              // no semester on assignment: include if academic year matches
                              if (itAyId && ay && (it.academicYear?.name === ay || it.class?.academicYear?.name === ay)) {
                                itemsForSem.push(it);
                              }
                            }
                          });
                        });

                        return (
                          <Card key={`${className}-${ay}-${semDef.id}`} className="mt-0">
                            <CardHeader>
                              <CardTitle>{semDef.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {itemsForSem.length === 0 ? (
                                <div className="text-sm text-gray-500">No assignments</div>
                              ) : (
                                <div className="space-y-2">
                                  {itemsForSem.map((it: any) => (
                                    <div key={it.id} className="flex justify-between items-center border-b pb-2">
                                      <div className="text-sm font-medium">{it.subject?.name || it.subjectId}</div>
                                      <div className="text-sm text-gray-700">{it.teacher ? `${it.teacher.firstName} ${it.teacher.lastName}` : it.teacherId}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
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
