import { LoginForm } from "@/components/features/auth/login-form";

export default function LoginPage() {
  return (
    <LoginForm
      onNavigate={(view) => {
        // This will be handled by the client component redirecting if it's a push
        // But for static links we could still use standard links or pass a handler
        // Since it's a wrapper, we'll keep it simple as it's already a client component inside.
      }}
    />
  );
}
