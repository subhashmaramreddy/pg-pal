import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import apiClient from "@/services/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "tenant";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasRequiredRole, setHasRequiredRole] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      // Check if token exists in localStorage
      const token = localStorage.getItem("auth_token");
      
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      // Verify token is still valid
      const isValid = await apiClient.verifyToken();
      setIsAuthenticated(isValid);

      // Check role if required
      if (isValid && requiredRole) {
        if (requiredRole === "admin") {
          const pgType = localStorage.getItem("pg_type");
          const adminEmail = localStorage.getItem("admin_email");
          setHasRequiredRole(!!pgType && !!adminEmail);
        } else if (requiredRole === "tenant") {
          const tenantId = localStorage.getItem("tenant_id");
          setHasRequiredRole(!!tenantId);
        }
      } else {
        setHasRequiredRole(true);
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      setIsAuthenticated(false);
    }
  };

  // Loading state
  if (isAuthenticated === null || (requiredRole && hasRequiredRole === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to appropriate login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role mismatch
  if (requiredRole && !hasRequiredRole) {
    return <Navigate to="/" replace />;
  }

  // Authenticated and authorized
  return <>{children}</>;
}
