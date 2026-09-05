import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { signupSchema, type LoginValues, type SignupValues } from "@/schemas/auth";
import { sanitizeCallbackUrl } from "@/lib/utils";

/**
 * Hook for handling login logic
 */
export function useLogin() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (values: LoginValues, callbackUrl: string = "/dashboard") => {
        setLoading(true);
        setError(null);

        // ALWAYS sanitize input before using as redirect target
        const safeUrl = sanitizeCallbackUrl(callbackUrl);

        try {
            const { error: authError } = await authClient.signIn.email({
                email: values.email,
                password: values.password,
                callbackURL: safeUrl,
            });

            if (authError) {
                setError(authError.message || "Invalid email or password.");
                return { success: false };
            }

            // Client-side redirect if callbackURL didn't already trigger it
            router.push(safeUrl);
            return { success: true };
        } catch {
            setError("An unexpected error occurred. Please try again.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    return { login, loading, error };
}

/**
 * Hook for handling signup logic
 */
export function useSignup() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState(false);

    const signup = async (values: SignupValues) => {
        setLoading(true);
        setError(null);
        setFieldErrors({});
        setSuccess(false);

        // 1. Zod Validation (including confirmPassword match)
        const validation = signupSchema.safeParse(values);
        if (!validation.success) {
            const flat = validation.error.flatten().fieldErrors;
            const mapped: Record<string, string> = {};
            for (const [key, messages] of Object.entries(flat)) {
                if (messages && messages.length > 0) {
                    mapped[key] = messages[0];
                }
            }
            setFieldErrors(mapped);
            setError(validation.error.errors[0].message);
            setLoading(false);
            return { success: false };
        }

        try {
            const { error: authError } = await authClient.signUp.email({
                email: values.email,
                password: values.password,
                name: `${values.firstName} ${values.lastName}`,
                firstName: values.firstName,
                lastName: values.lastName,
            });

            if (authError) {
                setError(authError.message || "Something went wrong during signup.");
                return { success: false };
            }

            setSuccess(true);
            return { success: true };
        } catch {
            setError("An unexpected error occurred. Please try again.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    return { signup, loading, error, fieldErrors, success };
}

/**
 * Hook for handling logout logic
 */
export function useLogout() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const logout = async () => {
        setLoading(true);
        try {
            await authClient.signOut();
            router.push("/login");
            return { success: true };
        } catch (err) {
            console.error("Logout error", err);
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    return { logout, loading };
}

