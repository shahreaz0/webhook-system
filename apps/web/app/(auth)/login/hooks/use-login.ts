import { mutationOptions, useMutation } from "@tanstack/react-query";
import type { InferRequestType, InferResponseType } from "hono/client";
import { toast } from "sonner";
import { hc } from "@/web/lib/api-client";

export function loginMutatationOptions() {
  return mutationOptions({
    mutationKey: ["login"],
    mutationFn: async (
      loginPayload: InferRequestType<typeof hc.auth.login.$post>["json"]
    ) => {
      const res = await hc.auth.login.$post({
        json: { email: loginPayload.email, password: loginPayload.password },
      });

      const json = await res.json();

      if (!res.ok) {
        return Promise.reject(json);
      }

      return json as InferResponseType<typeof hc.auth.login.$post, 200>;
    },

    onSuccess: async (data) => {
      const tokenRes = await hc.auth.token.$post({
        header: { token: data.session.token },
      });

      if (!tokenRes.ok) {
        throw new Error("Failed to authenticate session");
      }

      const tokenData = await tokenRes.json();

      if (typeof window !== "undefined") {
        localStorage.setItem("session_token", data.session.token);
        localStorage.setItem("token", tokenData.data.token);
      }

      toast.success("Login successful");
    },
    onError: (error) => {
      toast.error(error.message || "Invalid credentials");
    },
  });
}

export function useLogin() {
  return useMutation(loginMutatationOptions());
}
