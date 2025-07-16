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

const AdminDashboard = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="text-gray-600">Welcome back! Here's what's happening at your school today.</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Students"
        value="1,247"
        icon={Users}
        trend={{ value: 5.2, isPositive: true }}
        color="blue"
      />
      <StatsCard
        title="Active Teachers"
        value="89"
        icon={UserCheck}
        trend={{ value: 2.1, isPositive: true }}
        color="green"
      />
      <StatsCard
        title="Total Classes"
        value="48"
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
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Child's Attendance"
        value="94.8%"
        icon={UserCheck}
        color="green"
      />
      <StatsCard
        title="Average Grade"
        value="85.3%"
        icon={TrendingUp}
        color="blue"
      />
      <StatsCard
        title="Upcoming Tests"
        value="2"
        icon={FileText}
        color="yellow"
      />
      <StatsCard
        title="Unread Messages"
        value="1"
        icon={MessageCircle}
        color="red"
      />
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Recent Updates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="font-medium">Mathematics Test - Grade: A-</p>
            <p className="text-sm text-gray-600">Your child scored 87% on the recent test</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="font-medium">Parent-Teacher Meeting Scheduled</p>
            <p className="text-sm text-gray-600">December 15, 2024 at 3:00 PM</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const Dashboard = () => {
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
