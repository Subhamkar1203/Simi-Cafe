"use client";

import { MessageCircle, User, Phone, Users, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { toaster } from "@/components/ui/toaster";
import { useAuth } from "@/lib/auth-context";
import { ReservationScheduler } from "@/components/ghibli/reservation-scheduler";

export function ReserveClient({ initialTimeSlots }: { initialTimeSlots: string[] }) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    guests: "2",
    special_requests: "",
  });
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [confirmedReservation, setConfirmedReservation] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleScheduleUpdate = (dateTime: { date: Date; time: string } | null) => {
    if (dateTime) {
       setSelectedDate(dateTime.date);
       setSelectedTime(dateTime.time);
       
       const [time, modifier] = dateTime.time.split(" ");
       let [hours, minutes] = time.split(":");
       if (hours === "12") hours = "00";
       if (modifier === "PM") hours = (parseInt(hours, 10) + 12).toString();
       
       const dbTime = `${hours.padStart(2, '0')}:${minutes}:00`;
       const year = dateTime.date.getFullYear();
       const month = String(dateTime.date.getMonth() + 1).padStart(2, '0');
       const day = String(dateTime.date.getDate()).padStart(2, '0');
       const dbDate = `${year}-${month}-${day}`;

       setForm(prev => ({
         ...prev,
         date: dbDate,
         time: dbTime
       }));
    } else {
       setSelectedDate(null);
       setSelectedTime(null);
       setForm(prev => ({ ...prev, date: "", time: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!form.date || !form.time) {
       setStatus("error");
       toaster.create({
         title: "Missing fields",
         description: "Please select a reservation date and time.",
         type: "error"
       });
       return;
    }
    
    setStatus("submitting");

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        toaster.create({
          title: "Reservation failed",
          description: data.error || "Failed to make reservation.",
          type: "error"
        });
        return;
      }

      setConfirmedReservation(data.reservation || { date: form.date, time: form.time, guests: form.guests });
      setStatus("success");
      
      // Reset form but don't redirect, user will click the button in success state
    } catch (err) {
      setStatus("error");
      toaster.create({
        title: "Network Error",
        description: "Please try again.",
        type: "error"
      });
    }
  };

  return (
    <div className="site-page relative px-5 pb-32 pt-28 sm:px-8 sm:pt-32">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.section 
            key="success"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative z-10 mx-auto max-w-2xl text-center py-20"
          >
            <div className="mb-8 inline-flex size-24 items-center justify-center rounded-full bg-[rgb(var(--forest)_/_0.1)] text-[rgb(var(--forest))] shadow-[0_0_50px_rgba(var(--forest)_/_0.2)]">
              <CheckCircle2 className="size-12" />
            </div>
            
            <p className="text-xs font-bold uppercase tracking-[0.24em] site-eyebrow">
              Table Secured
            </p>
            <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-6xl text-[rgb(var(--foreground))]">
              We look forward to <br className="hidden sm:block" /> seeing you.
            </h1>
            
            <div className="mx-auto mt-12 max-w-md rounded-[2rem] border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-raised)_/_0.8)] p-8 shadow-xl backdrop-blur-xl text-left">
              <h3 className="font-serif text-2xl font-bold mb-6">Reservation Details</h3>
              <div className="space-y-4 text-sm font-medium">
                <div className="flex justify-between border-b border-current/10 pb-4">
                  <span className="text-[rgb(var(--foreground)_/_0.6)]">Date</span>
                  <span className="font-bold">{confirmedReservation?.date ? new Date(confirmedReservation.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Confirmed'}</span>
                </div>
                <div className="flex justify-between border-b border-current/10 pb-4">
                  <span className="text-[rgb(var(--foreground)_/_0.6)]">Time</span>
                  <span className="font-bold">{selectedTime || confirmedReservation?.time}</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-[rgb(var(--foreground)_/_0.6)]">Guests</span>
                  <span className="font-bold">{confirmedReservation?.guests} People</span>
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col gap-4 sm:flex-row items-center justify-center">
              {user ? (
                <Button onClick={() => router.push("/account")} size="lg" className="h-14 px-8 rounded-full shadow-lg font-bold">
                  View in Account <ArrowRight className="ml-2 size-4" />
                </Button>
              ) : (
                <Button onClick={() => router.push("/account")} size="lg" className="h-14 px-8 rounded-full shadow-lg font-bold">
                  Create Account to Track <ArrowRight className="ml-2 size-4" />
                </Button>
              )}
              <Button variant="ghost" onClick={() => router.push("/menu")} className="h-14 px-8 rounded-full font-bold text-[rgb(var(--foreground)_/_0.7)] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface-muted))]">
                Browse Menu
              </Button>
            </div>
          </motion.section>
        ) : (
          <motion.section 
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            className="relative z-10 mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1fr_1.2fr] lg:items-start lg:gap-20"
          >
            <div className="max-w-xl site-hero-panel">
              <p className="text-xs font-bold uppercase tracking-[0.24em] site-eyebrow sm:text-sm flex items-center gap-2">
                <Sparkles className="size-4 text-[rgb(var(--accent))]" /> Reserve / Visit
              </p>
              <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-6xl lg:leading-[1.1]">
                Secure your table for a warm, magical afternoon.
              </h1>
              <p className="mt-6 hidden md:block text-base leading-relaxed site-muted sm:text-[17px]">
                Experience our luxury Ghibli-inspired ambience. Choose your preferred time, and we'll have your table ready. Walk-ins are always welcome when seats are available.
              </p>
              
              <div className="mt-10 rounded-[2.5rem] border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface)_/_0.85)] p-8 shadow-md backdrop-blur-3xl sm:p-10">
                <h3 className="font-serif text-3xl font-bold tracking-tight">Your Details</h3>
                <form id="reservation-form" onSubmit={handleSubmit} className="mt-6 space-y-5">

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--foreground)_/_0.6)]">Name</span>
                      <div className="relative mt-2">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[rgb(var(--foreground)_/_0.4)]">
                          <User className="size-4" />
                        </div>
                        <input
                          required
                          name="name"
                          type="text"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Your name"
                          className="h-12 w-full rounded-2xl pl-11 pr-4 site-input shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)] bg-[rgb(var(--surface-raised)_/_0.95)] focus:ring-2 focus:ring-[rgb(var(--accent)_/_0.5)] focus:border-[rgb(var(--accent))] transition-all outline-none font-bold placeholder:font-medium"
                        />
                      </div>
                    </label>
                    
                    <label className="block">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--foreground)_/_0.6)]">Phone</span>
                      <div className="relative mt-2">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[rgb(var(--foreground)_/_0.4)]">
                          <Phone className="size-4" />
                        </div>
                        <input
                          required
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className="h-12 w-full rounded-2xl pl-11 pr-4 site-input shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)] bg-[rgb(var(--surface-raised)_/_0.95)] focus:ring-2 focus:ring-[rgb(var(--accent)_/_0.5)] focus:border-[rgb(var(--accent))] transition-all outline-none font-bold placeholder:font-medium"
                        />
                      </div>
                    </label>

                    <label className="sm:col-span-2 block">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--foreground)_/_0.6)]">Guests</span>
                      <div className="relative mt-2">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[rgb(var(--foreground)_/_0.4)]">
                          <Users className="size-4" />
                        </div>
                        <input
                          required
                          name="guests"
                          type="number"
                          min="1"
                          max="12"
                          value={form.guests}
                          onChange={handleChange}
                          placeholder="2"
                          className="h-12 w-full rounded-2xl pl-11 pr-4 site-input shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)] bg-[rgb(var(--surface-raised)_/_0.95)] focus:ring-2 focus:ring-[rgb(var(--accent)_/_0.5)] focus:border-[rgb(var(--accent))] transition-all outline-none font-bold placeholder:font-medium"
                        />
                      </div>
                    </label>

                    <label className="sm:col-span-2 block">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--foreground)_/_0.6)]">Special Requests (Optional)</span>
                      <textarea
                        name="special_requests"
                        value={form.special_requests}
                        onChange={handleChange}
                        placeholder="Any special occasions or dietary requirements?"
                        rows={3}
                        className="mt-2 w-full rounded-2xl p-4 site-input shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)] bg-[rgb(var(--surface-raised)_/_0.95)] resize-none focus:ring-2 focus:ring-[rgb(var(--accent)_/_0.5)] focus:border-[rgb(var(--accent))] transition-all outline-none font-bold placeholder:font-medium"
                      />
                    </label>
                  </div>

                  <div className="pt-2">
                    <p className="text-sm font-bold text-[rgb(var(--foreground)_/_0.7)]">Opening hours</p>
                    <p className="mt-1 text-sm text-[rgb(var(--foreground)_/_0.5)]">Daily, 10:00 AM - 10:00 PM</p>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Premium Date/Time Scheduler */}
            <div className="flex flex-col gap-6">
              <ReservationScheduler 
                timeSlots={initialTimeSlots}
                onSchedule={handleScheduleUpdate}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
              />
              
              <Button 
                type="submit" 
                form="reservation-form"
                className="h-[3.75rem] w-full rounded-2xl text-lg font-bold shadow-xl transition-transform active:scale-[0.98] bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))] hover:bg-[rgb(var(--accent)_/_0.9)] hover-magic" 
                disabled={status === "submitting" || !selectedDate || !selectedTime}
              >
                {status === "submitting" ? (
                  <div className="flex items-center gap-2">
                    <div className="size-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    Confirming...
                  </div>
                ) : (
                  <>
                    <MessageCircle className="mr-2 size-5" /> Confirm Reservation
                  </>
                )}
              </Button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
