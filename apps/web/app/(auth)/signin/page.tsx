import { AuthHeader } from "../components/auth-header";
import { DemoHelper } from "./components/demo-helper";
import { SignInForm } from "./components/signin-form";

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
