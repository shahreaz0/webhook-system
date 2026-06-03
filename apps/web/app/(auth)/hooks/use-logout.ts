import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { hc } from "@/web/lib/api-client";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["logout"],
    mutationFn: async () => {
      const sessionToken =
        typeof window === "undefined"
          ? null
          : Cookies.get("webhook_session_token") ||
            Cookies.get("session_token");

      if (typeof window !== "undefined") {
        Cookies.remove("webhook_session_token");
        Cookies.remove("webhook_jwt_token");
        Cookies.remove("webhook_user");
        Cookies.remove("session_token");
        Cookies.remove("token");
      }

      if (sessionToken) {
        try {
          // Fire and forget logout call
          await hc.auth.logout.$post({
            header: {
              token: sessionToken,
            },
          });
        } catch {
          // Ignore API error since we cleared cookies locally
        }
      }
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
