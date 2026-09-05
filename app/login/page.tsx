import { LoginForm } from "@/components/features/auth/login-form";
import { sanitizeCallbackUrl } from "@/lib/utils";
import { isGoogleAuthConfigured } from "@/shared/config/env";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * Server component so OAuth availability is resolved from the environment
 * without exposing configuration to the client bundle.
 */
export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const raw = params?.callbackUrl;
  const callbackUrl = sanitizeCallbackUrl(Array.isArray(raw) ? raw[0] : raw);

  return <LoginForm callbackUrl={callbackUrl} googleEnabled={isGoogleAuthConfigured} />;
}
