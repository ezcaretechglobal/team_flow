
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole, Project, Task, AuthState } from './types';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TeamDashboard from './pages/TeamDashboard';
import MyTasks from './pages/MyTasks';
import AdminPortal from './pages/AdminPortal';
import Projects from './pages/Projects';
import { cloudFetch, cloudSave } from './api/config';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const saved = localStorage.getItem('teamflow_auth');
    return saved ? JSON.parse(saved) : { user: null, isAuthenticated: false };
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadAllData = useCallback(async () => {
    setIsSyncing(true);
    const [u, p, t] = await Promise.all([
      cloudFetch('users'),
      cloudFetch('projects'),
      cloudFetch('tasks')
    ]);
    setUsers(u);
    setProjects(p);
    setTasks(t);
    setIsSyncing(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('teamflow_auth', JSON.stringify(authState));
    if (authState.isAuthenticated) {
      loadAllData();
    }
  }, [authState, loadAllData]);

  const handleLogout = () => {
    setAuthState({ user: null, isAuthenticated: false });
  };

  const syncProjects = async (newProjects: Project[]) => {
    setProjects(newProjects);
    await cloudSave('projects', newProjects);
  };

  const syncTasks = async (newTasks: Task[]) => {
    setTasks(newTasks);
    await cloudSave('tasks', newTasks);
  };

  const syncUsers = async (newUsers: User[]) => {
    setUsers(newUsers);
    await cloudSave('users', newUsers);
  };

  const ProtectedRoute = ({ children, requireAdmin = false }: { children?: React.ReactNode, requireAdmin?: boolean }) => {
    if (!authState.isAuthenticated) return <Navigate to="/login" replace />;
    if (requireAdmin && authState.user?.role !== UserRole.ADMIN) return <Navigate to="/dashboard" replace />;
    
    return (
      <div className="flex flex-col min-h-screen">
        <Navigation user={authState.user} onLogout={handleLogout} />
        {isSyncing && (
          <div className="bg-indigo-600 text-white text-[10px] py-1 text-center font-bold tracking-widest animate-pulse">
            ☁️ 구글 시트와 실시간 동기화 중...
          </div>
        )}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full relative">
          {children}
          <button 
            onClick={loadAllData}
            className="fixed bottom-6 right-6 p-3 bg-white border border-gray-200 rounded-full shadow-lg hover:rotate-180 transition-transform duration-500 text-indigo-600"
            title="새로고침"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        </main>
      </div>
    );
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login setAuthState={setAuthState} />} />
        <Route path="/signup" element={<Signup setAuthState={setAuthState} />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <TeamDashboard projects={projects} tasks={tasks} />
          </ProtectedRoute>
        } />
        
        <Route path="/my-tasks" element={
          <ProtectedRoute>
            <MyTasks currentUser={authState.user!} tasks={tasks} />
          </ProtectedRoute>
        } />

        <Route path="/projects" element={
          <ProtectedRoute>
            <Projects 
              currentUser={authState.user!} 
              projects={projects} 
              tasks={tasks}
              onProjectsChange={syncProjects}
              onTasksChange={syncTasks}
            />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminPortal users={users} onUsersChange={syncUsers} />
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
