import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useIsFetching } from '@tanstack/react-query';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const isFetching = useIsFetching();
  
  if (isFetching > 0 && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black">
        <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;