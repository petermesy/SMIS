import { useEffect, useState } from 'react';
import { getUsers, getGrades } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

export default function AdminStudentSummary() {
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [usersRes, gradesRes] = await Promise.all([
          getUsers({ role: 'student' }),
          getGrades(),
        ]);
        setStudents(usersRes || []);
        setGrades(gradesRes || []);
      } catch (err) {
        setStudents([]);
        setGrades([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Map studentId to their grades
  const studentGradeMap: { [studentId: string]: any[] } = {};
  grades.forEach((g: any) => {
    if (!studentGradeMap[g.studentId]) studentGradeMap[g.studentId] = [];
    studentGradeMap[g.studentId].push(g);
  });

  return (
    <Card className="mt-6 shadow-lg border border-gray-200">
      <CardHeader>
        <CardTitle>Student Total Scores & Averages</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Total Points Earned</TableHead>
                <TableHead>Total Possible Points</TableHead>
                <TableHead>Average (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const gradesArr = studentGradeMap[student.id] || [];
                const totalEarned = gradesArr.reduce((sum, g) => sum + (g.pointsEarned || 0), 0);
                const totalPossible = gradesArr.reduce((sum, g) => sum + (g.totalPoints || 0), 0);
                const avg = totalPossible > 0 ? ((totalEarned / totalPossible) * 100).toFixed(2) : 'N/A';
                return (
                  <TableRow key={student.id}>
                    <TableCell>{student.firstName} {student.lastName}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{totalEarned}</TableCell>
                    <TableCell>{totalPossible}</TableCell>
                    <TableCell>{avg}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
