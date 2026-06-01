"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Bell,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  UserPlus,
  UserRound,
  ShoppingBag,
  History,
  Heart,
  CalendarRange,
  Trash2,
  Plus,
  Leaf,
  Sparkles,
  Camera,
  Loader2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { HeroContentCard } from "@/components/ui/hero-content-card";
import cloudinaryLoader from "@/lib/cloudinary-loader";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";
import { toaster } from "@/components/ui/toaster";

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  initialMode?: AuthMode;
  initialReservations?: any[];
}

type AuthMode = "login" | "create" | "forgot";
type FormErrors = Record<string, string>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;

  return (
    <p className="mt-2 text-sm font-semibold site-error" role="alert">
      {message}
    </p>
  );
};

const AuthInput = ({
  label,
  name,
  type = "text",
  value,
  placeholder,
  error,
  onChange,
  children,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  placeholder: string;
  error?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  children?: React.ReactNode;
}) => (
  <label className="block">
    <span className="text-sm font-bold site-muted">{label}</span>
    <div className="relative mt-2 rounded-2xl site-input">
      <input
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className="h-12 w-full rounded-2xl bg-transparent px-4 pr-12 text-sm outline-none placeholder:text-current placeholder:opacity-45"
      />
      {children}
    </div>
    <div id={`${name}-error`}>
      <FieldError message={error} />
    </div>
  </label>
);

const ProfileField = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-raised)_/_0.52)] p-4">
    <p className="text-xs font-bold uppercase tracking-[0.18em] site-muted">{label}</p>
    <p className="mt-2 font-semibold">{value}</p>
  </div>
);

const PasswordToggle = ({
  shown,
  onClick,
  label,
}: {
  shown: boolean;
  onClick: () => void;
  label: string;
}) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="absolute inset-y-0 right-3 grid place-items-center text-[rgb(var(--forest))]"
  >
    {shown ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
  </button>
);

export const SignInPage: React.FC<SignInPageProps> = ({
  title,
  description,
  initialMode = "login",
  initialReservations = [],
}) => {
  const { user, isLoading, signup, verifySignupOtp, login, logout, refresh } = useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"profile" | "reservations" | "orders" | "favorites">("profile");
  const [orders, setOrders] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>(initialReservations);

  useEffect(() => {
    if (user && activeTab === "orders") {
      fetch("/api/orders").then(res => res.json()).then(data => setOrders(data.orders || []));
    } else if (user && activeTab === "favorites") {
      fetch("/api/user/favorites").then(res => res.json()).then(data => setFavorites(data.favorites || []));
    } else if (user && activeTab === "reservations" && reservations.length === 0) {
      fetch("/api/reservations/user").then(res => res.json()).then(data => setReservations(data.reservations || []));
    }
  }, [user, activeTab]);

  const { addItem } = useCart();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toaster.create({ title: "Invalid File", description: "Please select an image file.", type: "error" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toaster.create({ title: "File Too Large", description: "Image must be under 5MB.", type: "error" });
      return;
    }

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/profile/image", {
        method: "PATCH",
        body: formData,
      });

      if (res.ok) {
        await refresh();
        toaster.create({ title: "Profile Updated", description: "Your avatar has been updated successfully.", type: "success" });
      } else {
        const data = await res.json();
        toaster.create({ title: "Upload Failed", description: data.error || "Failed to upload image.", type: "error" });
      }
    } catch (error) {
      toaster.create({ title: "Error", description: "Network error during upload.", type: "error" });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get("msg") === "favorites" && !user) {
        toaster.create({
          title: "Login Required",
          description: "Log in to save your favorite café picks.",
          type: "info"
        });
      }
    }
  }, [user]);

  const heading = useMemo(() => {
    if (title) return title;
    if (mode === "create") return "Create Account";
    if (mode === "forgot") return "Forgot Password";
    return "Login";
  }, [mode, title]);

  const helperText = useMemo(() => {
    if (description) return description;
    if (mode === "create") {
      return "Set up your cafe profile with the required details below.";
    }
    if (mode === "forgot") {
      return "Enter your email to prepare reset instructions.";
    }
    return "Access your profile, reservation details, and account preferences.";
  }, [description, mode]);

  const updateField = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrors({});
    setIsVerifyingOtp(false);
    setOtp("");
  };

  const validateCreate = () => {
    const nextErrors: FormErrors = {};

    if (!form.fullName.trim()) nextErrors.fullName = "Full Name is required.";
    if (!EMAIL_PATTERN.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!form.phone.trim() || form.phone.trim().length < 10) {
      nextErrors.phone = "Enter a valid phone number (at least 10 digits).";
    }
    if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }
    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Confirm Password is required.";
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }
    if (!agreePolicy) {
      nextErrors.policy = "You must agree to the Privacy Policy and Terms of Service.";
    }

    return nextErrors;
  };

  const validateLogin = () => {
    const nextErrors: FormErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    }
    if (!form.password) {
      nextErrors.password = "Password is required.";
    }

    return nextErrors;
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateCreate();

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    const result = await signup({
      name: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      password: form.password,
    });
    setSubmitting(false);

    if (!result.ok) {
      if (result.error === "Validation Error" && result.details) {
        const nextErrors: FormErrors = {};
        result.details.forEach((d: any) => {
          let field = d.path.split(".").pop();
          if (field === "name") field = "fullName";
          if (field) nextErrors[field] = d.message;
        });
        setErrors(nextErrors);
      } else {
        setErrors({ email: result.error ?? "Signup failed." });
      }
      return;
    }

    if (result.requiresOtp) {
      setIsVerifyingOtp(true);
      toaster.create({
        title: "OTP Sent",
        description: "An OTP has been sent to your email/phone.",
        type: "success"
      });
      return;
    }

    setForm(emptyForm);
    toaster.create({
      title: "Account Created",
      description: "Welcome to Simi Café!",
      type: "success"
    });
  };

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      setErrors({ otp: "Please enter a valid 6-digit OTP." });
      return;
    }

    setSubmitting(true);
    const result = await verifySignupOtp({
      name: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      password: form.password,
      otp: otp.trim()
    });
    setSubmitting(false);

    if (!result.ok) {
      if (result.error === "Validation Error" && result.details) {
        setErrors({ otp: result.details[0]?.message ?? "OTP Verification failed." });
      } else {
        setErrors({ otp: result.error ?? "OTP Verification failed." });
      }
      return;
    }

    setForm(emptyForm);
    setOtp("");
    setIsVerifyingOtp(false);
    toaster.create({
      title: "Account Verified",
      description: "Your account is ready.",
      type: "success"
    });
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateLogin();

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    const result = await login({
      email: form.email.trim().toLowerCase(),
      password: form.password,
    });
    setSubmitting(false);

    if (!result.ok) {
      if (result.error === "Validation Error" && result.details) {
        const nextErrors: FormErrors = {};
        result.details.forEach((d: any) => {
          const field = d.path.split(".").pop();
          if (field) nextErrors[field] = d.message;
        });
        setErrors(nextErrors);
      } else {
        setErrors({
          password: result.error ?? "Login failed. Check your credentials.",
        });
      }
      return;
    }

    setForm(emptyForm);
    setErrors({});
    toaster.create({
      title: "Welcome Back!",
      description: "You have successfully logged in.",
      type: "success"
    });
  };

  const handleForgot = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.email.trim()) {
      setErrors({ email: "Email is required." });
      return;
    }

    setErrors({});
    toaster.create({
      title: "Email Sent",
      description: "Password reset instructions are ready for your cafe account.",
      type: "success"
    });
  };

  const handleSignOut = async () => {
    await logout();
    setErrors({});
    setMode("login");
    toaster.create({
      title: "Signed Out",
      description: "You have been logged out safely.",
      type: "info"
    });
  };

  const cancelReservation = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;
    const res = await fetch(`/api/reservations/${id}`, { method: "PATCH" });
    if (res.ok) {
      setReservations(reservations.map(r => r.id === id ? { ...r, status: "cancelled" } : r));
      toaster.create({ title: "Reservation Cancelled", description: "Your reservation has been cancelled.", type: "info" });
    } else {
      toaster.create({ title: "Error", description: "Failed to cancel reservation.", type: "error" });
    }
  };

  const removeFavorite = async (id: number) => {
    const res = await fetch(`/api/user/favorites?menu_item_id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setFavorites(favorites.filter(f => f.id !== id));
    } else {
      toaster.create({ title: "Error", description: "Failed to remove favorite.", type: "error" });
    }
  };



  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-[2rem] site-panel">
        <div className="size-8 animate-spin rounded-full border-4 border-[rgb(var(--border-soft))] border-t-[rgb(var(--accent))]" />
      </div>
    );
  }

  if (user) {
    const activeOrders = orders.filter(o => !["completed", "cancelled"].includes(o.status));
    const pastOrders = orders.filter(o => ["completed", "cancelled"].includes(o.status));

    return (
      <HeroContentCard
        className="shadow-2xl"
        eyebrow="Account"
        title={
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <span>Welcome, {user.name}</span>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-muted)_/_0.62)] px-4 py-2 text-sm font-bold sm:mt-0">
              <ShieldCheck className="size-4 text-[rgb(var(--forest))]" />
              Signed in
            </span>
          </div>
        }
      >

        {/* Premium Segmented Tabs Navigation */}
        <div className="mb-8 flex rounded-full border border-[rgb(var(--border-soft)_/_0.3)] bg-[rgb(var(--surface-raised)_/_0.6)] p-1.5 shadow-inner">
          <button onClick={() => setActiveTab("profile")} className={cn("flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-bold transition-all duration-300", activeTab === "profile" ? "bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))] shadow-md" : "text-[rgb(var(--foreground)_/_0.6)] hover:bg-[rgb(var(--surface)_/_0.5)] hover:text-[rgb(var(--foreground))]")}>
            <UserRound className="size-4" /> <span className="hidden sm:inline">Profile</span>
          </button>
          <button onClick={() => setActiveTab("reservations")} className={cn("flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-bold transition-all duration-300", activeTab === "reservations" ? "bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))] shadow-md" : "text-[rgb(var(--foreground)_/_0.6)] hover:bg-[rgb(var(--surface)_/_0.5)] hover:text-[rgb(var(--foreground))]")}>
            <CalendarRange className="size-4" /> <span className="hidden sm:inline">Reservations</span>
          </button>
          <button onClick={() => setActiveTab("orders")} className={cn("flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-bold transition-all duration-300", activeTab === "orders" ? "bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))] shadow-md" : "text-[rgb(var(--foreground)_/_0.6)] hover:bg-[rgb(var(--surface)_/_0.5)] hover:text-[rgb(var(--foreground))]")}>
            <ShoppingBag className="size-4" /> <span className="hidden sm:inline">Orders</span>
          </button>
          <button onClick={() => setActiveTab("favorites")} className={cn("flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-bold transition-all duration-300", activeTab === "favorites" ? "bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))] shadow-md" : "text-[rgb(var(--foreground)_/_0.6)] hover:bg-[rgb(var(--surface)_/_0.5)] hover:text-[rgb(var(--foreground))]")}>
            <Heart className="size-4" /> <span className="hidden sm:inline">Favorites</span>
          </button>
        </div>

        {activeTab === "profile" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Avatar Section */}
            <div className="mb-8 flex flex-col items-center sm:flex-row sm:items-center sm:gap-6">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                />
                <div className="relative size-32 overflow-hidden rounded-full border-4 border-[rgb(var(--surface-raised))] shadow-[0_0_20px_rgba(var(--accent)/0.15)] transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(var(--accent)/0.3)] group-hover:border-[rgb(var(--accent)/0.4)]">
                  {isUploadingAvatar ? (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <Loader2 className="size-8 animate-spin text-white" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                      <Camera className="size-8 text-white" />
                    </div>
                  )}
                  <Image
                    src={user.profile_image || "simi-cafe/static/Defaultpp"}
                    alt="Profile Avatar"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 33vw"
                    loader={cloudinaryLoader}
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-col items-center sm:items-start sm:mt-0">
                <h3 className="font-serif text-3xl font-bold">{user.name}</h3>
                <p className="site-muted mt-1">{user.email}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileField label="Full Name" value={user.name} />
              <ProfileField label="Email" value={user.email} />
              <ProfileField label="Phone" value={user.phone} />
              <ProfileField label="Total Visits" value={String(user.total_visits)} />
              <ProfileField label="Charms Earned" value={String(user.charm_count)} />
              <ProfileField label="Charms Redeemed" value={String(user.charms_redeemed)} />
              <ProfileField label="Progress to Next Charm" value={`${user.total_visits % 3} / 3 Visits`} />
            </div>

            {/* Upcoming Reservation Widget */}
            {(() => {
              const upcoming = reservations.filter(r => !["cancelled", "completed", "rejected"].includes(r.status))
                .sort((a, b) => new Date(`${a.reservation_date} ${a.reservation_time}`).getTime() - new Date(`${b.reservation_date} ${b.reservation_time}`).getTime())[0];
              
              if (!upcoming) return null;
              
              return (
                <div className="relative mt-8 overflow-hidden rounded-[2rem] border border-[rgb(var(--border-soft)_/_0.6)] bg-[rgb(var(--surface-muted)_/_0.4)] p-8 shadow-sm backdrop-blur-md">
                   <div className="absolute right-0 top-0 -mr-4 -mt-4 text-[rgb(var(--forest)_/_0.06)]">
                     <CalendarRange className="size-40" />
                   </div>
                   <div className="relative z-10">
                     <p className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--forest))] mb-1">Upcoming Visit</p>
                     <h3 className="font-serif text-3xl font-bold leading-tight">Table for {upcoming.guests}</h3>
                     <p className="mt-2 text-[17px] font-medium text-[rgb(var(--foreground)_/_0.85)]">
                       {new Date(upcoming.reservation_date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })} at {upcoming.reservation_time}
                     </p>
                     <Button size="sm" variant="secondary" className="mt-6 rounded-xl shadow-sm" onClick={() => setActiveTab('reservations')}>
                       Manage Reservation
                     </Button>
                   </div>
                </div>
              )
            })()}

            <div className="mt-8 rounded-[2rem] border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-raised)_/_0.48)] p-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex size-10 items-center justify-center rounded-full bg-[rgb(var(--surface-muted))] shrink-0">
                  <Bell className="size-5 text-[rgb(var(--forest))]" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[17px]">Account notifications</p>
                  <p className="mt-1 text-[15px] site-muted">Receive reservation reminders and account messages.</p>
                </div>
                <input type="checkbox" checked={emailUpdates} onChange={(e) => setEmailUpdates(e.target.checked)} className="mt-2 size-5 accent-[rgb(var(--forest))]" aria-label="Toggle notifications" />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button type="button" className="sm:flex-1"><UserRound /> Save Profile</Button>
              <Button type="button" variant="secondary" className="sm:flex-1" onClick={handleSignOut}><LogOut /> Sign Out</Button>
            </div>
          </div>
        )}

        {activeTab === "reservations" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="mb-6 text-2xl font-bold font-serif flex items-center gap-2">
              <CalendarRange className="size-6 text-[rgb(var(--forest))]" /> Your Reservations
            </h2>
            
            {reservations.length === 0 ? (
              <div className="relative overflow-hidden rounded-[2.5rem] p-10 text-center shadow-xl site-card border border-[rgb(var(--border-soft))]">
                <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dlupquidc/image/upload/f_auto,q_auto,c_fill,w_800/simi-cafe/static/totoro_field')] bg-cover bg-center opacity-20 blur-[4px] pointer-events-none mix-blend-luminosity" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-raised)] to-transparent opacity-80 pointer-events-none" />
                <Sparkles className="relative z-10 size-12 text-[rgb(var(--accent))] mb-5 opacity-80" />
                <h3 className="relative z-10 font-serif text-3xl font-bold text-[rgb(var(--foreground))] mb-2">Awaiting your visit</h3>
                <p className="relative z-10 text-[15px] text-[rgb(var(--foreground)_/_0.6)] mb-8 max-w-sm">You haven't made any reservations yet. Secure a table for your magical café moment.</p>
                <Button className="relative z-10 shadow-xl rounded-full h-12 px-8 font-bold bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))] hover:bg-[rgb(var(--accent)_/_0.9)] hover:-translate-y-0.5 transition-all" onClick={() => window.location.href = '/reserve'}>
                  <CalendarRange className="mr-2 size-4" /> Reserve a Table
                </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {reservations.map((reservation) => {
                  const isError = ['cancelled', 'rejected'].includes(reservation.status);
                  
                  const getStep = () => {
                    if (isError) return -1;
                    if (reservation.status === 'pending') return 1;
                    if (['confirmed', 'approved'].includes(reservation.status)) return 2;
                    if (reservation.status === 'completed') return 3;
                    return 0;
                  };
                  
                  const step = getStep();
                  const canCancel = ["pending", "confirmed", "approved"].includes(reservation.status);

                  return (
                    <div key={reservation.id} className="relative overflow-hidden rounded-[2rem] border border-[rgb(var(--border-soft)_/_0.8)] bg-[rgb(var(--surface-raised)_/_0.6)] p-6 sm:p-8 shadow-sm backdrop-blur-xl transition hover:shadow-md hover:border-[rgb(var(--accent)_/_0.3)] group">
                      
                      {/* Timeline Header */}
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-serif text-2xl font-bold">Table for {reservation.guests}</span>
                          <span className="text-sm font-bold text-[rgb(var(--foreground)_/_0.5)]">#{reservation.id}</span>
                        </div>
                        
                        {/* Visual Progress Bar */}
                        <div className="relative flex items-center justify-between mt-6">
                          <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-[rgb(var(--border-soft))] rounded-full overflow-hidden">
                            {!isError && (
                              <div 
                                className="h-full bg-[rgb(var(--accent))] transition-all duration-1000 ease-out" 
                                style={{ width: step === 1 ? '15%' : step === 2 ? '50%' : '100%' }}
                              />
                            )}
                            {isError && (
                              <div className="h-full w-full bg-red-500/40" />
                            )}
                          </div>
                          
                          {/* Step 1 */}
                          <div className="relative flex flex-col items-center gap-2 z-10 bg-[rgb(var(--surface-raised))] px-2">
                            <div className={cn("flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors", step >= 1 && !isError ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))]" : "border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-muted))] text-muted-foreground", isError && "border-red-500/50 bg-red-500/10 text-red-500")}>
                              {isError ? '✕' : '1'}
                            </div>
                            <span className={cn("text-[10px] font-bold uppercase tracking-wider", step >= 1 && !isError ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--foreground)_/_0.4)]", isError && "text-red-500")}>Requested</span>
                          </div>
                          
                          {/* Step 2 */}
                          <div className="relative flex flex-col items-center gap-2 z-10 bg-[rgb(var(--surface-raised))] px-2">
                            <div className={cn("flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors", step >= 2 && !isError ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))]" : "border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-muted))] text-muted-foreground", isError && "opacity-50")}>
                              {isError ? '✕' : '2'}
                            </div>
                            <span className={cn("text-[10px] font-bold uppercase tracking-wider", step >= 2 && !isError ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--foreground)_/_0.4)]", isError && "opacity-50")}>Confirmed</span>
                          </div>
                          
                          {/* Step 3 */}
                          <div className="relative flex flex-col items-center gap-2 z-10 bg-[rgb(var(--surface-raised))] px-2">
                            <div className={cn("flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors", step === 3 && !isError ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))]" : "border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-muted))] text-muted-foreground", isError && "opacity-50")}>
                              {isError ? '✕' : '3'}
                            </div>
                            <span className={cn("text-[10px] font-bold uppercase tracking-wider", step === 3 && !isError ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--foreground)_/_0.4)]", isError && "opacity-50")}>Completed</span>
                          </div>
                        </div>
                        {isError && (
                          <p className="mt-4 text-center text-xs font-bold text-red-500 uppercase tracking-widest">Reservation {reservation.status}</p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between gap-6 border-t border-[rgb(var(--border-soft)_/_0.5)] pt-6">
                        <div className="flex gap-8">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--foreground)_/_0.5)] mb-1">Date</p>
                            <p className="font-medium">{new Date(reservation.reservation_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--foreground)_/_0.5)] mb-1">Time</p>
                            <p className="font-medium">{reservation.reservation_time}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:items-end justify-center">
                          {canCancel && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => cancelReservation(reservation.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-500/10 font-semibold"
                            >
                              Cancel Booking
                            </Button>
                          )}
                          {!canCancel && reservation.status !== 'completed' && (
                             <Button 
                               variant="secondary" 
                               size="sm" 
                               onClick={() => window.location.href = '/reserve'}
                               className="rounded-full"
                             >
                               Rebook
                             </Button>
                          )}
                        </div>
                      </div>
                      
                      {reservation.special_requests && (
                        <div className="mt-5 p-4 rounded-2xl bg-[rgb(var(--surface)_/_0.5)] text-sm italic border border-current/5 shadow-inner">
                          <span className="font-bold not-italic block mb-1 text-xs uppercase tracking-wider text-[rgb(var(--foreground)_/_0.5)]">Special Requests</span>
                          {reservation.special_requests}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8">
            <div>
              <h2 className="mb-4 text-xl font-bold font-serif flex items-center gap-2"><ShoppingBag className="size-5"/> Active Orders</h2>
              {activeOrders.length === 0 ? (
                <p className="text-muted-foreground italic">No active orders right now.</p>
              ) : (
                <div className="grid gap-4">
                  {activeOrders.map(order => (
                    <div key={order.id} className="rounded-2xl border bg-[rgb(var(--surface-raised)_/_0.5)] p-4 shadow-sm">
                      <div className="flex justify-between border-b pb-2 mb-2">
                        <span className="font-bold">Order #{order.id}</span>
                        <span className="rounded-full bg-[rgb(var(--accent)_/_0.2)] px-2 py-1 text-xs font-bold text-[rgb(var(--forest))] uppercase">{order.status}</span>
                      </div>
                      <p className="text-sm site-muted mb-2">{new Date(order.created_at).toLocaleString()}</p>
                      <ul className="text-sm">
                        {order.items?.map((item: any) => (
                          <li key={item.id} className="flex justify-between">
                            <span>{item.quantity}x {item.name}</span>
                            <span>₹{item.price * item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 flex justify-between border-t pt-2 font-bold">
                        <span>Total:</span>
                        <span>₹{order.total_amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="mb-4 text-xl font-bold font-serif flex items-center gap-2"><History className="size-5"/> Order History</h2>
              {pastOrders.length === 0 ? (
                <p className="text-muted-foreground italic">No past orders.</p>
              ) : (
                <div className="grid gap-4 opacity-80">
                  {pastOrders.map(order => (
                    <div key={order.id} className="rounded-2xl border bg-muted/20 p-4 shadow-sm">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold">Order #{order.id}</span>
                        <span className="text-xs font-bold uppercase">{order.status}</span>
                      </div>
                      <p className="text-sm site-muted">{new Date(order.created_at).toLocaleDateString()}</p>
                      <div className="mt-2 text-sm">
                        {order.items?.map((i: any) => i.name).join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "favorites" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="mb-6 text-2xl font-bold font-serif flex items-center gap-2">
              <Heart className="size-6 text-red-500 fill-red-500" /> Saved Favorites
            </h2>
            
            {favorites.length === 0 ? (
              <div className="relative overflow-hidden rounded-[2.5rem] p-8 shadow-xl site-card border border-[rgb(var(--border-soft))] flex flex-col items-center text-center">
                <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dlupquidc/image/upload/f_auto,q_auto,c_fill,w_800/simi-cafe/static/spirited_away_flowers')] bg-cover bg-center opacity-30 blur-[2px] pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--surface-raised)] to-transparent opacity-90 pointer-events-none" />
                <p className="relative z-10 text-lg font-bold text-[rgb(var(--foreground))] mb-4 opacity-90">No favorites yet. Save the dishes that charm you.</p>
                <Button className="relative z-10 shadow-lg" onClick={() => window.location.href = '/menu'}>Explore Menu</Button>
              </div>
            ) : (
              <div className="grid gap-5 xl:grid-cols-2">
                {favorites.map((item) => {
                  const itemDiet = item.is_vegan ? "Vegan" : item.is_veg ? "Veg" : "Non-Veg";

                  return (
                    <article
                      key={item.id}
                      className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-raised)_/_0.6)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-[#1a1a1a]/80"
                    >
                      <div className="flex flex-col sm:flex-row h-full">
                        <div className="relative aspect-[4/3] sm:aspect-square sm:w-2/5 overflow-hidden">
                          <Image
                            src={item.image_url || "simi-cafe/static/placeholder"}
                            alt={item.name}
                            fill
                            className={cn(
                              "object-cover transition-transform duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:scale-110",
                              !item.image_url && "opacity-75 mix-blend-luminosity saturate-50"
                            )}
                            sizes="(max-width: 640px) 100vw, 33vw"
                            loader={cloudinaryLoader}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                          <button 
                            onClick={() => removeFavorite(item.id)}
                            className="absolute right-3 top-3 rounded-full bg-white/20 p-2 text-white backdrop-blur-md transition hover:bg-red-500/80 hover:text-white"
                            aria-label="Remove from favorites"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>

                        <div className="flex flex-1 flex-col justify-between p-5">
                          <div>
                            <div className="flex items-start justify-between gap-4 mb-1">
                              <h3 className="text-xl font-bold leading-tight">{item.name}</h3>
                              <p className="text-lg font-bold site-price shrink-0">₹{item.price}</p>
                            </div>
                            
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--surface-muted)_/_0.9)] px-2.5 py-1 text-[10px] font-bold shadow-sm uppercase tracking-wider mb-3">
                              <Leaf className={`size-3 ${item.is_vegan ? "text-green-600" : item.is_veg ? "text-green-500" : "text-red-400"}`} />
                              {itemDiet}
                            </span>
                            
                            <p className="text-sm leading-relaxed site-muted line-clamp-3">{item.description}</p>
                          </div>

                          <div className="mt-4 pt-4 border-t border-[rgb(var(--border-soft))] flex justify-end">
                            <Button 
                              onClick={() => addItem({
                                menu_item_id: item.id,
                                name: item.name,
                                price: Number(item.price),
                                quantity: 1,
                                image_url: item.image_url
                              })}
                              size="sm"
                              className="rounded-xl flex gap-1.5 items-center"
                            >
                              <Plus className="size-4" /> Add to Cart
                            </Button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </HeroContentCard>
    );
  }

  return (
    <HeroContentCard
      className="shadow-2xl"
      title={heading}
      description={helperText}
    >
      <div className="mb-7 flex rounded-full site-card p-1">
        {[
          { value: "login", label: "Login", icon: KeyRound },
          { value: "create", label: "Create Account", icon: UserPlus },
        ].map((item) => {
          const Icon = item.icon;
          const active = mode === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => switchMode(item.value as AuthMode)}
              className={cn(
                "flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-bold site-muted",
                active &&
                  "bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))] shadow-sm",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {mode === "create" && !isVerifyingOtp && (
        <form className="mt-7 space-y-5" onSubmit={handleCreate} noValidate>
          <AuthInput label="Full Name" name="fullName" value={form.fullName} placeholder="Your full name" error={errors.fullName} onChange={updateField} />
          <AuthInput label="Email" name="email" type="email" value={form.email} placeholder="you@example.com" error={errors.email} onChange={updateField} />
          <AuthInput label="Phone Number" name="phone" type="tel" value={form.phone} placeholder="+91 98765 43210" error={errors.phone} onChange={updateField}>
            <Phone className="absolute inset-y-0 right-3 my-auto size-5 text-[rgb(var(--forest)_/_0.5)]" />
          </AuthInput>
          <AuthInput label="Password" name="password" type={showPassword ? "text" : "password"} value={form.password} placeholder="At least 6 characters" error={errors.password} onChange={updateField}>
            <PasswordToggle shown={showPassword} onClick={() => setShowPassword((current) => !current)} label={showPassword ? "Hide password" : "Show password"} />
          </AuthInput>
          <AuthInput label="Confirm Password" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} placeholder="Re-enter your password" error={errors.confirmPassword} onChange={updateField}>
            <PasswordToggle shown={showConfirmPassword} onClick={() => setShowConfirmPassword((current) => !current)} label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"} />
          </AuthInput>
          <div className="flex items-start gap-3 mt-4">
            <input 
              type="checkbox" 
              id="agreePolicy"
              checked={agreePolicy} 
              onChange={(e) => {
                setAgreePolicy(e.target.checked);
                setErrors((cur) => ({ ...cur, policy: "" }));
              }} 
              className="mt-1 size-4 shrink-0 rounded border-[rgb(var(--border-soft))] accent-[rgb(var(--forest))]" 
            />
            <div className="flex-1">
              <label htmlFor="agreePolicy" className="text-sm site-muted leading-relaxed cursor-pointer">
                I agree to the <Link href="/privacy-policy" className="font-bold text-[rgb(var(--foreground))] hover:underline" target="_blank">Privacy Policy</Link> and <Link href="#" className="font-bold text-[rgb(var(--foreground))] hover:underline" target="_blank">Terms of Service</Link>
              </label>
              <FieldError message={errors.policy} />
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? "Creating…" : "Create Account"}
          </Button>
        </form>
      )}

      {mode === "create" && isVerifyingOtp && (
        <form className="mt-7 space-y-5" onSubmit={handleVerifyOtp} noValidate>
          <AuthInput label="Enter 6-digit OTP" name="otp" type="text" value={otp} placeholder="000000" error={errors.otp} onChange={(e) => { setOtp(e.target.value); setErrors((cur) => ({ ...cur, otp: "" })) }} />
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? "Verifying…" : "Verify & Create Account"}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => { setIsVerifyingOtp(false); }}>
            Back to Edit Details
          </Button>
        </form>
      )}

      {mode === "login" && (
        <form className="mt-7 space-y-5" onSubmit={handleLogin} noValidate>
          <AuthInput label="Email" name="email" type="email" value={form.email} placeholder="you@example.com" error={errors.email} onChange={updateField} />
          <AuthInput label="Password" name="password" type={showPassword ? "text" : "password"} value={form.password} placeholder="Your password" error={errors.password} onChange={updateField}>
            <PasswordToggle shown={showPassword} onClick={() => setShowPassword((current) => !current)} label={showPassword ? "Hide password" : "Show password"} />
          </AuthInput>
          <div className="flex items-center justify-end gap-4 text-sm">
            <button type="button" onClick={() => switchMode("forgot")} className="font-bold text-[rgb(var(--forest))] hover:underline">Forgot Password</button>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? "Logging in…" : "Login"}
          </Button>
          <p className="text-center text-sm site-muted">
            New here? <button type="button" onClick={() => switchMode("create")} className="font-bold text-[rgb(var(--forest))] hover:underline">Create Account</button>
          </p>
        </form>
      )}

      {mode === "forgot" && (
        <form className="mt-7 space-y-5" onSubmit={handleForgot} noValidate>
          <AuthInput label="Email" name="email" type="email" value={form.email} placeholder="you@example.com" error={errors.email} onChange={updateField} />
          <Button type="submit" className="w-full" size="lg"><Mail /> Send Reset Link</Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => switchMode("login")}>Back to Login</Button>
        </form>
      )}
    </HeroContentCard>
  );
};
