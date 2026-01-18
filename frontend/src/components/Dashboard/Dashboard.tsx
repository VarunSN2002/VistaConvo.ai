import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ProtectedRoute from '../ProtectedRoute';
import ProjectsList from './ProjectsList';
import CreateProject from './CreateProject';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black p-8">
        <header className="max-w-7xl mx-auto flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
              VistaConvo.ai
            </h1>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full">
              Live
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">{user?.email}</span>
            <button
              onClick={() => {
                logout();
                nav('/login');
              }}
              className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all"
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Your Projects</h2>
            <CreateProject />  {/* 👈 Uses CreateProject component */}
          </div>
          
          <ProjectsList />   {/* 👈 Uses ProjectsList component */}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;