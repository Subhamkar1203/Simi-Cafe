import { ReserveClient } from "@/components/ghibli/reserve-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reserve a Table | Simi Cafe",
  description: "Secure your table for a warm, magical afternoon at Simi Cafe.",
};

const DEFAULT_TIME_SLOTS = [
  "10:00 AM - 10:30 AM", "10:30 AM - 11:00 AM", "11:00 AM - 11:30 AM",
  "11:30 AM - 12:00 PM", "12:00 PM - 12:30 PM", "12:30 PM - 1:00 PM",
  "1:00 PM - 1:30 PM", "1:30 PM - 2:00 PM", "2:00 PM - 2:30 PM",
  "2:30 PM - 3:00 PM", "3:00 PM - 3:30 PM", "3:30 PM - 4:00 PM",
  "4:00 PM - 4:30 PM", "4:30 PM - 5:00 PM", "5:00 PM - 5:30 PM",
  "5:30 PM - 6:00 PM", "6:00 PM - 6:30 PM", "6:30 PM - 7:00 PM",
  "7:00 PM - 7:30 PM", "7:30 PM - 8:00 PM", "8:00 PM - 8:30 PM", "8:30 PM - 9:00 PM", "9:00 PM - 9:30 PM"
];

export default async function ReservePage() {
  let timeSlots = DEFAULT_TIME_SLOTS;

  try {
    const res = await fetch("process.env.NEXT_PUBLIC_API_URL/api/client/reservations/availability", {
      next: { revalidate: 60 }
    });

    if (res.ok) {
      const data = await res.json();
      if (data.timeSlots && Array.isArray(data.timeSlots)) {
        timeSlots = data.timeSlots;
      }
    }
  } catch {
    console.error("Error fetching reservation availability, falling back to default slots.");
  }

  return <ReserveClient initialTimeSlots={timeSlots} />;
}
