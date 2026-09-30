import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="page-loading"><span className="loader" /> Loading your study space</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}
