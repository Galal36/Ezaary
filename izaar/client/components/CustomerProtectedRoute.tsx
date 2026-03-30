import { Navigate } from "react-router-dom";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";

interface CustomerProtectedRouteProps {
  children: React.ReactNode;
}

export default function CustomerProtectedRoute({
  children,
}: CustomerProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useCustomerAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="animate-pulse text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: "profile" }} />;
  }

  return <>{children}</>;
}
