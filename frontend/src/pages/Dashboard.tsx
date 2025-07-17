import { useAuth } from '@/contexts/AuthContext';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useEffect, useState } from 'react';
import { getUsers, getClasses } from '@/lib/api';
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

  useEffect(() => {
    async function fetchStats() {
      try {
        const studentsRes = await getUsers({ role: 'STUDENT' });
        setStudentCount(studentsRes.total);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>
      {/* ...existing code... */}
    </div>
  );
}

const TeacherDashboardWrapper = () => <TeacherDashboard />;

const StudentDashboard = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
      <p className="text-gray-600">Welcome back! Let's make today count.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Attendance Rate"
        value="96.2%"
        icon={UserCheck}
        color="green"
      />
      <StatsCard
        title="Average Grade"
        value="87.5%"
        icon={TrendingUp}
        color="blue"
      />
      <StatsCard
        title="Today's Classes"
        value="6"
        icon={BookOpen}
        color="yellow"
      />
      <StatsCard
        title="Assignments Due"
        value="3"
        icon={FileText}
        color="red"
      />
    </div>
    <StudentGrades />
  </div>
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
    switch (user?.role) {
      case 'admin':
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
