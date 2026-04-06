import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { loginSchema, signupSchema, type LoginValues, type SignupValues } from "@/schemas/auth";

/**
 * Hook for handling login logic
 */
export function useLogin() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (values: LoginValues) => {
        setLoading(true);
        setError(null);

        try {
            const { error: authError } = await authClient.signIn.email({
                email: values.email,
                password: values.password,
                callbackURL: "/dashboard",
            });

            if (authError) {
                setError(authError.message || "Invalid email or password.");
                return { success: false };
            }

            // Client-side redirect if callbackURL didn't already trigger it
            router.push("/dashboard");
            return { success: true };
        } catch (err: unknown) {
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
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const signup = async (values: SignupValues) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // @ts-ignore - custom fields firstName/lastName are verified server-side
            const { error: authError } = await authClient.signUp.email({
                email: values.email,
                password: values.password,
                name: `${values.firstName} ${values.lastName}`,
                firstName: values.firstName,
                lastName: values.lastName,
            } as any);

            if (authError) {
                setError(authError.message || "Something went wrong during signup.");
                return { success: false };
            }

            setSuccess(true);
            return { success: true };
        } catch (err: unknown) {
            setError("An unexpected error occurred. Please try again.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    return { signup, loading, error, success };
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

