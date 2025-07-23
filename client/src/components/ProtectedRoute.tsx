import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  element: JSX.Element;
  allowedRoles: string[];
}

const ProtectedRoute = ({ element, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();

  const storageUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  const storageToken = localStorage.getItem('token') || sessionStorage.getItem('token');

  const user = storageUser ? JSON.parse(storageUser) : null;

  if (!user || !storageToken) {
    // Not authenticated — redirect to login, preserving the intended path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user.role || 'User';

  if (!allowedRoles.includes(userRole)) {
    // Role not allowed — optional: show unauthorized page or redirect
    return <Navigate to="/unauthorized" replace />;
  }

  return element;
};

export default ProtectedRoute;