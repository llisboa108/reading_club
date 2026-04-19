import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";

export function usePasswordValidation(password: string) {
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const validate = async () => {
      if (!password) {
        setErrors([]);
        setIsValid(false);
        return;
      }

      setChecking(true);

      try {
        await apiRequest("/auth/validate-password/", "POST", {
          password,
        });

        setErrors([]);
        setIsValid(true);
      } catch (err: any) {
        const backendErrors =
          err?.errors ||
          ["Password does not meet security requirements"];

        setErrors(backendErrors);
        setIsValid(false);
      } finally {
        setChecking(false);
      }
    };

    const timeout = setTimeout(validate, 400);
    return () => clearTimeout(timeout);
  }, [password]);

  return {
    isValid,
    errors,
    checking,
  };
}