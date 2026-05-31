import { AuthHeader } from "../components/auth-header";
import { RegisterForm } from "./components/register-form";

export default function RegisterPage() {
  return (
    <>
      <AuthHeader
        description="Start building your real-time webhook infrastructure."
        title="Create an account"
      />

      <RegisterForm />
    </>
  );
}
