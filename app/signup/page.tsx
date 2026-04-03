import { SignupForm } from "@/components/features/auth/signup-form";

export default function SignupPage() {
  return (
    <SignupForm
      onNavigate={(view) => {
        // Handled by the client component
      }}
    />
  );
}
