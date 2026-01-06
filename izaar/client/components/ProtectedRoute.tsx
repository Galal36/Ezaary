import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAdmin } = useAdminAuth();

  if (!isAdmin) {
    // Redirect to login page with return URL
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
