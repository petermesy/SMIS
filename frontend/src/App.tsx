import { useAuth } from "@/contexts/AuthContext";

// Helper component for /classes route to check user role
function ClassesRouteContent() {
  const { user } = useAuth();
  if (user && user.role === 'teacher') {
    return <TeacherClassManagement />;
  }
  return <ComingSoon title="My Classes" description="View and manage your assigned classes." />;
}

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Dashboard } from "@/pages/Dashboard";
import { UserManagement } from "@/pages/UserManagement";
import { ClassScheduling } from "@/pages/ClassScheduling";
import ClassAssignment from "@/pages/ClassAssignment";
// Removed duplicate AppRoutes definition. Only one AppRoutes function should exist below with all routes.

import { AttendanceManagement } from "@/pages/AttendanceManagement";
import { AcademicManagement } from "@/pages/AcademicManagement";
import { Communications } from "@/pages/Communications";
import { DocumentManagement } from "@/pages/DocumentManagement";
import { Settings } from "@/pages/Settings";
import { ComingSoon } from "@/pages/ComingSoon";
import { Home } from "@/pages/Home";
import NotFound from "./pages/NotFound";
import React, { Suspense } from "react";
// import AdminStudentSummary from './pages/AdminStudentSummary';
const TeacherClassManagement = React.lazy(() => import("./pages/TeacherClassManagement"));
import TeacherDashboardAlt from "@/pages/TeacherDashboardAlt"; // Importing the new alternative dashboard component

// removed duplicate useAuth import

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <LoginForm />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[hsl(var(--background))] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-[hsl(var(--background))]">
        <Header />
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-[hsl(var(--background))]">
          {children}
        </main>
      </div>
    </div>
  );
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <Home />
        </PublicRoute>
      } />
      <Route path="/login" element={
        <PublicRoute>
          <LoginForm />
        </PublicRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute>
          <UserManagement />
        </ProtectedRoute>
      } />
      <Route path="/schedule" element={
        <ProtectedRoute>
          <ClassScheduling />
        </ProtectedRoute>
      } />
      <Route path="/class-assignment" element={
        <ProtectedRoute>
          <ClassAssignment />
        </ProtectedRoute>
      } />
      <Route path="/attendance" element={
        <ProtectedRoute>
          <AttendanceManagement />
        </ProtectedRoute>
      } />
      <Route path="/academics" element={
        <ProtectedRoute>
          <AcademicManagement />
        </ProtectedRoute>
      } />
      <Route path="/communications" element={
        <ProtectedRoute>
          <Communications />
        </ProtectedRoute>
      } />
      <Route path="/documents" element={
        <ProtectedRoute>
          <DocumentManagement />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/classes" element={
        <ProtectedRoute>
          <Suspense fallback={<div>Loading...</div>}>
            <ClassesRouteContent />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute>
          <Communications />
        </ProtectedRoute>
      } />
      <Route path="/resources" element={
        <ProtectedRoute>
          <DocumentManagement />
        </ProtectedRoute>
      } />
      <Route path="/grades" element={
        <ProtectedRoute>
          <ComingSoon title="My Grades" description="View your academic performance and grades." />
        </ProtectedRoute>
      } />
      <Route path="/progress" element={
        <ProtectedRoute>
          <ComingSoon title="Child Progress" description="Monitor your child's academic progress and performance." />
        </ProtectedRoute>
      } />
      <Route path="/teacher-dashboard-alt" element={
        <ProtectedRoute>
          <TeacherDashboardAlt /> {/* New route for the alternative teacher dashboard */}
        </ProtectedRoute>
      } />
      {/* Removed deprecated /admin/student-summary route. All summary logic is now in AcademicManagement "All Grades" tab. */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
