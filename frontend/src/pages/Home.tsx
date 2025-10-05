
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  FileText,
  CheckCircle,
  ArrowRight,
  Award,
  Clock,
  Shield
} from 'lucide-react';

export const Home = () => {
  const [showLoginForm, setShowLoginForm] = useState(false);

  const features = [
    {
      icon: Users,
      title: 'User Management',
      description: 'Comprehensive user management for admins, teachers, students, and parents with role-based access control.'
    },
    {
      icon: Calendar,
      title: 'Attendance Management',
      description: 'Digital attendance tracking with real-time notifications and automated parent alerts.'
    },
    {
      icon: Clock,
      title: 'Class Scheduling',
      description: 'Intelligent timetable management with conflict detection and personalized schedules.'
    },
    {
      icon: BookOpen,
      title: 'Academic Management',
      description: 'Complete academic oversight including subjects, grades, exams, and performance tracking.'
    },
    {
      icon: MessageSquare,
      title: 'Communication Hub',
      description: 'Integrated messaging system for seamless communication between all stakeholders.'
    },
    {
      icon: FileText,
      title: 'Document Management',
      description: 'Centralized document storage and sharing for study materials, policies, and announcements.'
    }
  ];

  const benefits = [
    'Streamlined school operations',
    'Improved parent-teacher communication',
    'Real-time attendance monitoring',
    'Automated report generation',
    'Secure data management',
    'Mobile-responsive design'
  ];

  const stats = [
    { label: 'Students Managed', value: '2,500+', icon: GraduationCap },
    { label: 'Teachers Connected', value: '150+', icon: Users },
    { label: 'Classes Scheduled', value: '1,200+', icon: Calendar },
    { label: 'Reports Generated', value: '5,000+', icon: FileText }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden">
                <img src="/logo.png" alt="SMIS" className="w-10 h-10 object-cover" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SMIS</h1> <h2>Sawla Secondary School</h2>
              </div>
            </div>
            <Button onClick={() => window.location.href = '/dashboard'} className="bg-blue-600 hover:bg-blue-700">
              Login
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Top contextual image (image1.png) with overlay text and stats included */}
      <section className="w-full">
        <div className="relative w-full">
          <div
            className="w-full h-96 md:h-[40rem] bg-cover bg-center"
            style={{ backgroundImage: `url('/photo.jpg')` }}
            role="img"
            aria-label="School entrance"
          />

          {/* Dark overlay for contrast */}
          <div className="absolute inset-0 bg-black bg-opacity-40" />

          {/* Overlay content */}
          <div className="absolute inset-0 flex items-start justify-center pt-45 md:pt-40">
            <div className="text-center px-6 md:px-12 lg:px-20"><br></br>
         <br></br> 
              <Badge className="mb-4 bg-blue-200 text-blue-800 inline-flex items-center">
                <Shield className="w-3 h-3 mr-2" />
                Secure & Reliable
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
                Student Management
                <span className="text-blue-300 block">Information System</span>
              </h2>
              <p className="text-white/90 mt-4 max-w-2xl mx-auto">
                Streamline your school operations with a secure, easy-to-use system for managing
                students, teachers, academics, and parent communication.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                >
                  Login
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="px-6 py-3 text-white">
                  Learn More
                </Button>
              </div>
            </div>
          </div>

          {/* Stats area placed inside the hero background so image continues beneath */}
          <div className="relative z-10">
            <div className="py-16 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {stats.map((stat, index) => (
                    <Card key={index} className="text-center">
                      <CardContent className="p-6 bg-white/90">
                        <stat.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                        <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                        <div className="text-gray-600">{stat.label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary image removed — keeping page content that follows */}

      {/* Hero Section */}
     



      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Student Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to run your school efficiently, from student management to academic tracking.
            </p>
          </div>
          
          {/* Features grid on top of a background image */}
          <div
            className="relative rounded-lg overflow-hidden"
            style={{ backgroundImage: `url('/image.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            {/* dark overlay to increase contrast */}
            <div className="absolute inset-0 bg-black bg-opacity-30" />

            <div className="relative z-10 p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Our SMIS?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Built specifically for modern educational institutions, our system provides 
                all the tools you need to manage your school effectively.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="text-center mb-6">
                <Award className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900">Security First</h3>
                <p className="text-gray-600">
                  Built with OWASP security standards, ensuring your data is always protected.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">256-bit</div>
                  <div className="text-sm text-gray-600">Encryption</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Student Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {/* Join Mahtot Primary School in experiencing the future of education management. */}
          </p>
          <Button 
            size="lg" 
            onClick={() => setShowLoginForm(true)}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
          >
            Start Using SMIS Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-lg overflow-hidden">
                  <img src="/logo.png" alt="SMIS" className="w-8 h-8 object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">SMIS</h3>
                  {/* <p className="text-sm text-gray-400">Sawla Secondary & Preparatory School</p> */}
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering education through technology. Our School Management Information System 
                is designed to streamline operations and enhance communication.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>User Management</li>
                <li>Attendance Tracking</li>
                <li>Grade Management</li>
                <li>Communication Tools</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Contact Support</li>
                <li>System Status</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            {/* <p>&copy; 2024 Sawla Secondary and Preparatory School. All rights reserved.</p> */}
            <p>&copy; 2024 Sawla Secondary School. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal would be triggered here */}
      {showLoginForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Login to SMIS</h2>
            <p className="text-gray-600 mb-6">
              Use the demo credentials to explore the system:
            </p>
         
            <div className="flex space-x-4">
              <Button 
                onClick={() => setShowLoginForm(false)} 
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => window.location.href = '/dashboard'} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Continue to Login
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
