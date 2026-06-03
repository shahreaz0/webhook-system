import { AuthHeader } from "../_components/auth-header";
import { DemoHelper } from "./_components/demo-helper";
import { SignInForm } from "./_components/signin-form";

export default function SignInPage() {
  return (
    <>
      <AuthHeader
        description="Manage subscriptions, endpoints, and event deliveries."
        title="Sign in to your account"
      />

      <SignInForm />

      <DemoHelper />
    </>
  );
}
