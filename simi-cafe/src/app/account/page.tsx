import { SignInPage } from "@/components/ui/sign-in";
import { cookies } from "next/headers";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account | Simi Cafe",
  description: "Manage your reservations, favorites, and account details.",
};

export default async function AccountPage() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const cookieString = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

  let initialReservations = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/client/reservations/user`, {
      headers: {
        Cookie: cookieString
      },
      // Since it's user-specific, do not cache
      cache: "no-store"
    });

    if (res.ok) {
      const data = await res.json();
      if (data.reservations) {
        initialReservations = data.reservations;
      }
    }
  } catch (error) {
    console.error("Error fetching user reservations on server:", error);
  }

  return (
    <div className="site-page relative px-5 pb-32 pt-6 sm:px-8 sm:pt-8 md:pt-32">
      <section className="mx-auto max-w-2xl">
        <SignInPage initialReservations={initialReservations} />
      </section>
    </div>
  );
}
