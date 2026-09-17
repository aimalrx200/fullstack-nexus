import { useState } from "react";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { passkeyClient } from "../lib/auth/passkeyClient";
import { setCredentials } from "../redux/slices/authSlice";
import { queryKeys } from "../lib/api/queryKeys";
import { toast } from "sonner";

export function usePasskey() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);

  const isSupported = passkeyClient.isSupported();

  /**
   * Registers a new passkey credential (Touch ID / Face ID / Windows Hello)
   */
  const registerPasskey = async ({ email, name } = {}) => {
    setIsPasskeyLoading(true);
    try {
      const result = await passkeyClient.registerPasskey({ email, name });
      if (result?.user) {
        dispatch(setCredentials(result.user));
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      }
      toast.success(
        result?.message || "Biometric Passkey registered successfully!",
      );
      return { success: true, data: result };
    } catch (err) {
      const message = err?.message || "Passkey registration failed.";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsPasskeyLoading(false);
    }
  };

  /**
   * Authenticates with an existing biometric passkey
   */
  const authenticatePasskey = async (email) => {
    setIsPasskeyLoading(true);
    try {
      const result = await passkeyClient.authenticatePasskey(email);
      if (result?.user) {
        dispatch(setCredentials(result.user));
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      }
      toast.success(result?.message || "Biometric authentication verified!");
      return { success: true, data: result };
    } catch (err) {
      const message = err?.message || "Biometric authentication failed.";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsPasskeyLoading(false);
    }
  };

  return {
    isSupported,
    isPasskeyLoading,
    registerPasskey,
    authenticatePasskey,
  };
}
