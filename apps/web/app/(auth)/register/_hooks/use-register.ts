import { mutationOptions, useMutation } from "@tanstack/react-query";
import type { InferRequestType, InferResponseType } from "hono/client";
import { toast } from "sonner";
import { hc } from "@/web/lib/api-client";

export function registerMutatationOptions() {
  return mutationOptions({
    mutationKey: ["register"],
    mutationFn: async (
      registerPayload: InferRequestType<typeof hc.auth.register.$post>["json"]
    ) => {
      const res = await hc.auth.register.$post({
        json: {
          name: registerPayload.name,
          email: registerPayload.email,
          password: registerPayload.password,
        },
      });

      const json = await res.json();

      if (!res.ok) {
        return Promise.reject(json);
      }

      return json as InferResponseType<typeof hc.auth.register.$post, 201>;
    },

    onSuccess: () => {
      toast.success("Registration successful");
    },
    onError: (error: any) => {
      toast.error(error.message || "Registration failed");
    },
  });
}

export function useRegister() {
  return useMutation(registerMutatationOptions());
}
