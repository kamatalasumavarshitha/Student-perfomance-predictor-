import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function AuthMenu() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  if (!user) {
    return (
      <Button asChild size="sm" variant="outline">
        <Link to="/login">
          <LogIn className="h-4 w-4" />
          Sign in
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-xs text-muted-foreground sm:inline">{user.email}</span>
      <Button size="sm" variant="ghost" onClick={() => supabase.auth.signOut()}>
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}
