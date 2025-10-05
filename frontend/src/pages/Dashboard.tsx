import { useEffect, useState } from 'react';
import { getUsers, getClasses, getGrades } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StudentGrades from './StudentGrades';
import TeacherDashboard from './TeacherDashboard';
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  Calendar,
  TrendingUp,
  Clock,
  MessageCircle,
  FileText
} from 'lucide-react';

const AdminDashboard = () => {
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [teacherCount, setTeacherCount] = useState<number | null>(null);
  const [classCount, setClassCount] = useState<number | null>(null);
  const [maleCount, setMaleCount] = useState<number | null>(null);
  const [femaleCount, setFemaleCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const studentsRes = await getUsers({ role: 'STUDENT' });
        // studentsRes can be an array, or an object with .data/.users and .total
        const studentsArr = Array.isArray(studentsRes)
          ? studentsRes
          : (studentsRes?.users || studentsRes?.data || []);
        const totalStudents = typeof studentsRes?.total === 'number' ? studentsRes.total : studentsArr.length;
        setStudentCount(totalStudents);
        // count genders defensively
        const male = studentsArr.filter((s: any) => {
          const g = ((s && (s.gender || s.sex)) || '').toString().toLowerCase();
          return g === 'male' || g === 'm';
        }).length;
        const female = studentsArr.filter((s: any) => {
          const g = ((s && (s.gender || s.sex)) || '').toString().toLowerCase();
          return g === 'female' || g === 'f';
        }).length;
        setMaleCount(male);
        setFemaleCount(female);
        const teachersRes = await getUsers({ role: 'TEACHER', status: 'ACTIVE' });
        setTeacherCount(teachersRes.total);
        const classesRes = await getClasses();
        setClassCount(Array.isArray(classesRes) ? classesRes.length : 0);
      } catch (e) {
        setStudentCount(null);
        setTeacherCount(null);
        setClassCount(null);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening at your school today.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <StatsCard
          title="Total Students"
          value={studentCount !== null ? studentCount.toLocaleString() : '...'}
          icon={Users}
          trend={{ value: 5.2, isPositive: true }}
          color="blue"
        />
        <StatsCard
          title="Active Teachers"
          value={teacherCount !== null ? teacherCount.toLocaleString() : '...'}
          icon={UserCheck}
          trend={{ value: 2.1, isPositive: true }}
          color="green"
        />
        <StatsCard
          title="Total Classes"
          value={classCount !== null ? classCount.toLocaleString() : '...'}
          icon={BookOpen}
          color="yellow"
        />
        <StatsCard
          title="Attendance Rate"
          value="94.8%"
          icon={TrendingUp}
          trend={{ value: 1.3, isPositive: true }}
          color="green"
        />
        <StatsCard
          title="Male Students"
          value={maleCount !== null ? maleCount.toLocaleString() : '...'}
          icon={Users}
          color="indigo"
        />
        <StatsCard
          title="Female Students"
          value={femaleCount !== null ? femaleCount.toLocaleString() : '...'}
          icon={Users}
          color="pink"
        />
      </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Today's Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium">Staff Meeting</p>
                <p className="text-sm text-gray-600">9:00 AM - 10:00 AM</p>
              </div>
              <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">Ongoing</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Parent-Teacher Conference</p>
                <p className="text-sm text-gray-600">2:00 PM - 5:00 PM</p>
              </div>
              <span className="px-2 py-1 bg-gray-400 text-white text-xs rounded">Upcoming</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Recent Activities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">New student enrolled: John Smith</p>
                <p className="text-xs text-gray-600">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Grade 12 exam results published</p>
                <p className="text-xs text-gray-600">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Library books inventory updated</p>
                <p className="text-xs text-gray-600">6 hours ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}

const TeacherDashboardWrapper = () => <TeacherDashboard />;

const StudentDashboardContent = () => {
  const { user } = useAuth();
  const [averageGrade, setAverageGrade] = useState<number | null>(null);
  const [attendanceRate, setAttendanceRate] = useState<string>('96.2%'); // Placeholder, replace with real if available
  const [todaysClasses, setTodaysClasses] = useState<number>(6); // Placeholder, replace with real if available
  const [assignmentsDue, setAssignmentsDue] = useState<number>(3); // Placeholder, replace with real if available

  useEffect(() => {
    async function fetchGrades() {
      if (user?.role === 'student') {
        const grades = await getGrades();
        const studentGrades = grades.filter((g: any) => g.studentId === user.id);
        const totalEarned = studentGrades.reduce((sum: number, g: any) => sum + (g.pointsEarned || 0), 0);
        const totalPossible = studentGrades.reduce((sum: number, g: any) => sum + (g.totalPoints || 0), 0);
        const avg = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : null;
        setAverageGrade(avg);
      }
    }
    fetchGrades();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600">Welcome back! Your average grade is {averageGrade !== null ? `${averageGrade.toFixed(2)}%` : '...'}.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Attendance Rate"
          value={attendanceRate}
          icon={UserCheck}
          color="green"
        />
        <StatsCard
          title="Average Grade"
          value={averageGrade !== null ? `${averageGrade.toFixed(2)}%` : '...'}
          icon={TrendingUp}
          color="blue"
        />
        <StatsCard
          title="Today's Classes"
          value={todaysClasses.toString()}
          icon={BookOpen}
          color="yellow"
        />
        <StatsCard
          title="Assignments Due"
          value={assignmentsDue.toString()}
          icon={FileText}
          color="red"
        />
      </div>
      <StudentGrades />
    </div>
  );
};

const StudentDashboard = () => (
  <StudentDashboardContent />
);

const ParentDashboard = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
      <p className="text-gray-600">Stay connected with your child's educational journey.</p>
    </div>
  </div>
);



// Dashboard role switcher
const Dashboard = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    const role = (user?.role || '').toString().toLowerCase();
    switch (role) {
      case 'admin':
      case 'superadmin': // allow superadmin to see admin dashboard
        return <AdminDashboard />;
      case 'teacher':
        return <TeacherDashboardWrapper />;
      case 'student':
        return <StudentDashboard />;
      case 'parent':
        return <ParentDashboard />;
      default:
        return <div>Dashboard not available for this role.</div>;
    }
  };

  return (
    <div className="p-6">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
