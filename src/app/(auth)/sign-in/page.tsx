import { redirect } from "next/navigation";

export default function SignInPage() {
  // Przekierowanie do wbudowanej strony logowania NextAuth
  redirect("/api/auth/signin");
}
