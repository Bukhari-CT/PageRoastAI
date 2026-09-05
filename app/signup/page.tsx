import { SignupForm } from "@/components/features/auth/signup-form";
import { isGoogleAuthConfigured } from "@/shared/config/env";

export default function SignupPage() {
  return <SignupForm googleEnabled={isGoogleAuthConfigured} />;
}
