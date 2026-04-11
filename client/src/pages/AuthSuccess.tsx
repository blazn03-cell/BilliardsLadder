import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

export default function AuthSuccess() {
  const { data: authData, isLoading } = useQuery<{ role: string; redirectUrl?: string }>({
    queryKey: ["/api/auth/success"],
    refetchInterval: false,
  });

  useEffect(() => {
    if (!isLoading && authData) {
      const { role } = authData;
      
      const doRedirect = async () => {
        if (role === "admin") {
          window.location.href = "/app?tab=admin";
        } else if (role === "operator") {
          try {
            const res = await fetch("/api/auth/me", { credentials: "include" });
            const me = await res.json();
            const check = await apiRequest(`/api/operator/settings-complete?userId=${me?.id || me?.user?.id}`);
            window.location.href = (check as any)?.complete ? "/app?tab=dashboard" : "/app?tab=operator-settings";
          } catch {
            window.location.href = "/app?tab=operator-settings";
          }
        } else {
          window.location.href = "/app?tab=dashboard";
        }
      };
      doRedirect();
    }
  }, [authData, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-felt-dark flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Completing Sign-Up</h2>
          <p className="text-gray-400">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-felt-dark flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-400 mb-4">⚠️</div>
        <h2 className="text-2xl font-semibold text-white mb-2">Sign-Up Error</h2>
        <p className="text-gray-400 mb-4">There was an issue completing your registration.</p>
        <a 
          href="/" 
          className="text-emerald-400 hover:text-emerald-300 underline"
        >
          Return to homepage
        </a>
      </div>
    </div>
  );
}