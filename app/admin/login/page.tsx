import { AdminLoginForm } from "@/components/features/auth/admin-login-form";

export const metadata = {
  title: "Admin Login | PageRoast AI",
  description: "Administrative access into the roasting engine.",
};

export default function AdminLoginPage() {
  return (
    <AdminLoginForm />
  );
}
