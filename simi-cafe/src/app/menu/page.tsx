import { MenuClient } from "@/components/ghibli/menu-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu | Simi Cafe",
  description: "Browse our delicious menu, from classic favorites to seasonal specialties.",
};

export default async function MenuPage() {
  let menuData = { items: [], dietTypes: [] };

  try {
    const res = await fetch("process.env.NEXT_PUBLIC_API_URL/api/client/menu", {
      next: { revalidate: 60 } // Revalidate every 60 seconds, or adjust as needed
    });
    if (res.ok) {
      menuData = await res.json();
    } else {
      console.error("Failed to fetch menu data on server", res.status);
    }
  } catch (error) {
    console.error("Error fetching menu data on server:", error);
  }

  return <MenuClient initialMenuData={menuData} />;
}
