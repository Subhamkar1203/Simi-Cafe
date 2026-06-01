import { SignInPage } from "@/components/ui/sign-in";

export default function CreateAccountPage() {
  return (
    <div className="site-page relative px-5 pb-32 pt-28 sm:px-8 sm:pt-32">
      <section className="mx-auto max-w-2xl">
        <SignInPage initialMode="create" />
      </section>
    </div>
  );
}
