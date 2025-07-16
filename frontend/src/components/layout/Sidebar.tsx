
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

const navigationItems = {
  admin: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'User Management', href: '/users', icon: Users },
    { name: 'Class Assignment', href: '/class-assignment', icon: BookOpen },
    { name: 'Class Scheduling', href: '/schedule', icon: Calendar },
    { name: 'Attendance', href: '/attendance', icon: ClipboardList },
    { name: 'Academic Management', href: '/academics', icon: BookOpen },
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

  const userNavItems = navigationItems[user.role] || [];

  return (
    <div className={cn(
      "bg-white dark:bg-[hsl(var(--sidebar-background))] border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div className="text-sm">
                <p className="font-semibold text-gray-900 dark:text-gray-100">Sawla Secondary</p>
                <p className="text-gray-600 dark:text-gray-400">SMIS</p>
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
      <nav className="flex-1 p-4 space-y-1">
        {userNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <item.icon className={cn("flex-shrink-0", collapsed ? "w-5 h-5" : "w-5 h-5 mr-3") + " dark:text-blue-300"} />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        {!collapsed && (
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 dark:bg-blue-400 rounded-full flex items-center justify-center">
              <span className="text-white dark:text-gray-900 text-sm font-medium">
                {(user.firstName?.charAt(0) || '?')}{(user.lastName?.charAt(0) || '?')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user.firstName || ''} {user.lastName || ''}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                {user.role}
              </p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={logout}
          className={cn(
            "w-full justify-start text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-400",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className={cn("w-5 h-5", !collapsed && "mr-3") + " dark:text-red-400"} />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
};
