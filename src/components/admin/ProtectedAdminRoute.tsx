import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route wrapper that verifies admin access before rendering content.
 * Prevents unauthorized UI exposure by not rendering children until verification completes.
 */
const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifyAdminAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/admin/auth", { replace: true });
          return;
        }

        // Verify admin access via server-side Edge Function
        const { data, error } = await supabase.functions.invoke('verify-admin', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!isMounted) return;

        if (error || !data?.isAdmin) {
          navigate("/", { replace: true });
          return;
        }

        setIsVerified(true);
      } catch (error) {
        if (isMounted) {
          navigate("/", { replace: true });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifyAdminAccess();

    // Re-verify on auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setIsVerified(false);
      setIsLoading(true);
      verifyAdminAccess();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Don't render anything until verification is complete
  if (isLoading || !isVerified) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verifying access...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
