import { redirect } from "next/navigation";

export default function AdminPage() {
  // Redirect to admin login by default
  redirect("/admin/login");
}
