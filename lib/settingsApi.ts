import { setPasswordAction } from "@/app/actions/settings.actions";

export async function setPassword(password: string) {
  return setPasswordAction(password);
}
