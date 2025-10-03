
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  ClipboardList, 
  BookOpen, 
  MessageCircle, 
  FileText, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import RegistrationSidebar from '@/components/layout/RegistrationSidebar';

const navigationItems = {
  admin: [
    { name: 'Super Admin', href: '/super-admin', icon: Users, requiredRole: 'SUPERADMIN' as const },
    { name: 'Audit Logs', href: '/audit-logs', icon: ClipboardList, requiredRole: 'SUPERADMIN' as const },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'User Management', href: '/users', icon: Users },
    { name: 'Class Assignment', href: '/class-assignment', icon: BookOpen },
    { name: 'Class Scheduling', href: '/schedule', icon: Calendar },
    { name: 'Attendance', href: '/attendance', icon: ClipboardList },
    { name: 'Academic Management', href: '/academics', icon: BookOpen },
    { name: 'Manage Semesters', href: '/admin/semesters', icon: Calendar },
    { name: 'Add Section', href: '/admin/class-sections', icon: Calendar },
    { name: 'Registration Requests', href: '/admin/registration-requests', icon: ClipboardList },
    { name: 'Student History', href: '/student-history', icon: ClipboardList },
    
    { name: 'Communications', href: '/communications', icon: MessageCircle },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ],
  teacher: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Classes', href: '/classes', icon: BookOpen },
    { name: 'Attendance', href: '/attendance', icon: ClipboardList },
    { name: 'Schedule', href: '/schedule', icon: Calendar },
    { name: 'Messages', href: '/messages', icon: MessageCircle },
    { name: 'Resources', href: '/resources', icon: FileText },
  ],
  student: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Schedule', href: '/schedule', icon: Calendar },
    { name: 'Attendance', href: '/attendance', icon: ClipboardList },
    { name: 'Registration', href: '/registration', icon: GraduationCap },
    { name: 'Grades', href: '/grades', icon: BookOpen },
    { name: 'Messages', href: '/messages', icon: MessageCircle },
    { name: 'Resources', href: '/resources', icon: FileText },
  ],
  parent: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Child Progress', href: '/progress', icon: BookOpen },
    { name: 'Attendance', href: '/attendance', icon: ClipboardList },
    { name: 'Schedule', href: '/schedule', icon: Calendar },
    { name: 'Messages', href: '/messages', icon: MessageCircle },
  ],
};

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const roleKey = (user.role || '').toString().toLowerCase();
  // Treat superadmin like admin for navigation and privileges
  const mappedRoleKey = roleKey === 'superadmin' ? 'admin' : roleKey;
  const userNavItems = navigationItems[mappedRoleKey] || [];

  return (
    <>
      <div className={cn(
        "fixed left-0 top-0 bottom-0 h-screen bg-[#0b0b0f] dark:bg-[#0b0b0f] shadow-[0_8px_20px_rgba(2,6,23,0.45)] text-white border-transparent transition-all duration-300 flex flex-col overflow-hidden z-40",
        collapsed ? "w-16" : "w-64"
      )}>
      {/* thin right-edge gradient to separate the sidebar from content */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-[rgba(255,255,255,0.06)] via-transparent to-[rgba(0,0,0,0.12)] pointer-events-none" aria-hidden="true" />
      {/* Header */}
  <div className="sticky top-0 z-50 p-4 border-b border-transparent shadow-[0_4px_8px_rgba(0,0,0,0.28)] bg-[#0b0b0f]">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="School Logo" className="w-8 h-8 rounded-full object-cover" />
              <div className="text-sm">
                <p className="font-semibold text-white">SSPS</p>
                <p className="text-white/80">SMIS</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
  <nav className="flex-1 p-4 space-y-1 overflow-hidden">
        {userNavItems
          .filter(item => {
            // If an item has no requiredRole, show it
            if (!('requiredRole' in item)) return true;
            const req = (item as any).requiredRole as string;
            if (!req) return true;
            // Allow SUPERADMIN to see items that require SUPERADMIN and also allow exact role matches
            const userRoleLower = (user.role || '').toString().toLowerCase();
            const reqLower = req.toLowerCase();
            if (userRoleLower === 'superadmin' && reqLower === 'superadmin') return true;
            return reqLower === userRoleLower;
          })
          .map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-800 text-white"
                  : "text-white/90 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("flex-shrink-0", collapsed ? "w-5 h-5" : "w-5 h-5 mr-3") + " text-white/80"} />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

  {/* Registration widget for students */}

  {/* User Profile & Logout */}
  <div className="p-4 border-t border-transparent">
        {!collapsed && (
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 dark:bg-blue-400 rounded-full flex items-center justify-center">
              <span className="text-white dark:text-gray-900 text-sm font-medium">
                {(user.firstName?.charAt(0) || '?')}{(user.lastName?.charAt(0) || '?')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.firstName || ''} {user.lastName || ''}
              </p>
              <p className="text-xs text-white/75 capitalize">
                {user.role}
              </p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={logout}
          className={cn(
            "w-full justify-start text-white hover:bg-red-700/20 hover:text-white",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className={cn("w-5 h-5", !collapsed && "mr-3") + " text-red-300"} />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
      </div>
      {/* spacer to push main content to the right so fixed sidebar doesn't cover it */}
      <div aria-hidden="true" className={cn(collapsed ? "w-16 flex-shrink-0" : "w-64 flex-shrink-0")} />
    </>
  );
};
