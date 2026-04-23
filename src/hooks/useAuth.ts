import { trpc } from "@/providers/trpc";

export function useAuth() {
  const {
    data: user,
    isLoading,
  } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  return {
    user: user ?? null,
    isLoading,
    isAdmin: user?.role === "ADMIN",
    isManager: user?.role === "MANAGER" || user?.role === "ADMIN",
    logout: () => logoutMutation.mutate(),
  };
}
