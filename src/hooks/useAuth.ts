import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";

export function useAuth({ redirectOnUnauthenticated = false } = {}) {
  const navigate = useNavigate();

  const {
    data: user,
    isLoading,
    error,
  } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  if (redirectOnUnauthenticated && !isLoading && error) {
    navigate("/login");
  }

  return {
    user: user ?? null,
    isLoading,
    isAdmin: user?.role === "ADMIN",
    isManager: user?.role === "MANAGER" || user?.role === "ADMIN",
    logout: () => logoutMutation.mutate(),
  };
}
