import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { loginSchema } from "@/lib/validation";
import { z } from "zod";

const AdminAuth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Verify admin access via server-side Edge Function
      const { data, error } = await supabase.functions.invoke('verify-admin', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!error && data?.isAdmin) {
        navigate("/admin/dashboard");
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate inputs before submitting
    try {
      loginSchema.parse({ email, password });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errorMessage = validationError.errors[0]?.message || "Invalid input";
        toast({ title: "Validation Error", description: errorMessage, variant: "destructive" });
      }
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    if (data.user) {
      // Verify admin access via server-side Edge Function
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-admin', {
        headers: {
          Authorization: `Bearer ${data.session?.access_token}`,
        },
      });

      if (verifyError || !verifyData?.isAdmin) {
        await supabase.auth.signOut();
        toast({ title: "Access denied", description: "Admin access required", variant: "destructive" });
      } else {
        navigate("/admin/dashboard");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full font-poppins font-bold" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AdminAuth;
