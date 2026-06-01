import { Metadata } from "next";
import { Shield, Heart, Mail, Clock, UserCheck, Settings } from "lucide-react";
import { HeroContentCard } from "@/components/ui/hero-content-card";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy and data practices for Simi Café.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="site-page relative px-5 pb-32 pt-6 sm:pt-8 md:pt-32 sm:px-8">
      <section className="relative mx-auto max-w-4xl z-10">
        <HeroContentCard
          className="max-w-3xl mb-12"
          eyebrow={<><Shield className="size-4" /> Legal & Privacy</>}
          title="Privacy Policy"
          description={
            <>
              At Simi Café, we respect your privacy and are committed to protecting the personal information you share with us while experiencing our magical world.
              <p className="mt-4 text-sm font-semibold text-[rgb(var(--forest))]">
                Last Updated: May 31, 2026
              </p>
            </>
          }
        />

        <div className="flex flex-col gap-10 rounded-[2.5rem] border border-[rgb(var(--border-soft)_/_0.6)] bg-[rgb(var(--surface-raised)_/_0.85)] p-8 shadow-sm backdrop-blur-md md:p-12">
          
          {/* 1. Information we collect */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-3 font-serif text-3xl font-bold text-foreground">
              <span className="flex size-10 items-center justify-center rounded-full bg-[rgb(var(--accent)_/_0.15)] text-[rgb(var(--accent-foreground))]">
                1
              </span>
              Information We Collect
            </h2>
            <div className="ml-13 space-y-4 text-base leading-relaxed site-muted">
              <p>
                When you visit Simi Café online, create an account, or make a reservation, we collect certain information to enhance your experience:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li><strong>Identity Data:</strong> Your full name and username.</li>
                <li><strong>Contact Data:</strong> Your email address and phone number (if provided for reservations).</li>
                <li><strong>Account Data:</strong> Password credentials and profile preferences (like saved favorite menu items).</li>
                <li><strong>Transaction & Reservation Data:</strong> Details of your table bookings, orders, and payment status (payments are processed securely by third-party providers).</li>
                <li><strong>Usage & Analytics Data:</strong> IP addresses, browser types, interaction with our interactive frontend features, and page visits.</li>
              </ul>
            </div>
          </div>

          <div className="my-2 h-px w-full bg-border/40" />

          {/* 2. How information is used */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-3 font-serif text-3xl font-bold text-foreground">
              <span className="flex size-10 items-center justify-center rounded-full bg-[rgb(var(--accent)_/_0.15)] text-[rgb(var(--accent-foreground))]">
                2
              </span>
              How Information is Used
            </h2>
            <div className="ml-13 space-y-4 text-base leading-relaxed site-muted">
              <p>Your information helps us deliver a warm, storybook experience. We use your data for:</p>
              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <div className="rounded-2xl bg-background/50 p-5 border border-border/40">
                  <UserCheck className="mb-2 size-6 text-[rgb(var(--forest))]" />
                  <h3 className="font-bold text-foreground">Account Management</h3>
                  <p className="text-sm mt-1">To register your account and maintain your personalized profile and favorites.</p>
                </div>
                <div className="rounded-2xl bg-background/50 p-5 border border-border/40">
                  <Clock className="mb-2 size-6 text-[rgb(var(--forest))]" />
                  <h3 className="font-bold text-foreground">Reservation Processing</h3>
                  <p className="text-sm mt-1">To secure your table bookings and send you important updates regarding your visit.</p>
                </div>
                <div className="rounded-2xl bg-background/50 p-5 border border-border/40">
                  <Settings className="mb-2 size-6 text-[rgb(var(--forest))]" />
                  <h3 className="font-bold text-foreground">Service Improvement</h3>
                  <p className="text-sm mt-1">To analyze how you interact with our website to improve our magical digital and physical experiences.</p>
                </div>
                <div className="rounded-2xl bg-background/50 p-5 border border-border/40">
                  <Mail className="mb-2 size-6 text-[rgb(var(--forest))]" />
                  <h3 className="font-bold text-foreground">Communication</h3>
                  <p className="text-sm mt-1">To send you possible email notifications about your account, reservations, or promotional content (if opted-in).</p>
                </div>
              </div>
            </div>
          </div>

          <div className="my-2 h-px w-full bg-border/40" />

          {/* 3. Cookies and analytics */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-3 font-serif text-3xl font-bold text-foreground">
              <span className="flex size-10 items-center justify-center rounded-full bg-[rgb(var(--accent)_/_0.15)] text-[rgb(var(--accent-foreground))]">
                3
              </span>
              Cookies and Analytics
            </h2>
            <div className="ml-13 space-y-4 text-base leading-relaxed site-muted">
              <p>
                We use cookies and similar tracking technologies to track activity on our service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
              </p>
              <p>
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website, such as maintaining a logged-in session.
              </p>
            </div>
          </div>

          <div className="my-2 h-px w-full bg-border/40" />

          {/* 4. Data protection and security */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-3 font-serif text-3xl font-bold text-foreground">
              <span className="flex size-10 items-center justify-center rounded-full bg-[rgb(var(--accent)_/_0.15)] text-[rgb(var(--accent-foreground))]">
                4
              </span>
              Data Protection & Security
            </h2>
            <div className="ml-13 space-y-4 text-base leading-relaxed site-muted">
              <p>
                The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. 
              </p>
              <p>
                We use commercially acceptable means (including industry-standard encryption protocols and secure server architectures) to protect your Personal Data, but we cannot guarantee its absolute security.
              </p>
            </div>
          </div>

          <div className="my-2 h-px w-full bg-border/40" />

          {/* 5. User rights */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-3 font-serif text-3xl font-bold text-foreground">
              <span className="flex size-10 items-center justify-center rounded-full bg-[rgb(var(--accent)_/_0.15)] text-[rgb(var(--accent-foreground))]">
                5
              </span>
              Your User Rights
            </h2>
            <div className="ml-13 space-y-4 text-base leading-relaxed site-muted">
              <p>Depending on your location, you may have the following rights regarding your personal data:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>The right to access, update, or delete the information we have on you.</li>
                <li>The right of rectification (if your information is inaccurate or incomplete).</li>
                <li>The right to object to our processing of your Personal Data.</li>
                <li>The right of restriction (requesting that we restrict processing of your data).</li>
                <li>The right to data portability.</li>
                <li>The right to withdraw consent at any time.</li>
              </ul>
            </div>
          </div>

          <div className="my-2 h-px w-full bg-border/40" />

          {/* 6. Data retention */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-3 font-serif text-3xl font-bold text-foreground">
              <span className="flex size-10 items-center justify-center rounded-full bg-[rgb(var(--accent)_/_0.15)] text-[rgb(var(--accent-foreground))]">
                6
              </span>
              Data Retention
            </h2>
            <div className="ml-13 space-y-4 text-base leading-relaxed site-muted">
              <p>
                We will retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your Personal Data to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our legal agreements and policies.
              </p>
            </div>
          </div>

          <div className="my-2 h-px w-full bg-border/40" />

          {/* 7. Third-party services */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-3 font-serif text-3xl font-bold text-foreground">
              <span className="flex size-10 items-center justify-center rounded-full bg-[rgb(var(--accent)_/_0.15)] text-[rgb(var(--accent-foreground))]">
                7
              </span>
              Third-Party Services
            </h2>
            <div className="ml-13 space-y-4 text-base leading-relaxed site-muted">
              <p>
                We may employ third-party companies and individuals to facilitate our website, to provide the service on our behalf, to perform service-related services or to assist us in analyzing how our website is used.
              </p>
              <p>
                These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
              </p>
            </div>
          </div>

          <div className="my-2 h-px w-full bg-border/40" />

          {/* 8. Children's privacy */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-3 font-serif text-3xl font-bold text-foreground">
              <span className="flex size-10 items-center justify-center rounded-full bg-[rgb(var(--accent)_/_0.15)] text-[rgb(var(--accent-foreground))]">
                8
              </span>
              Children&apos;s Privacy
            </h2>
            <div className="ml-13 space-y-4 text-base leading-relaxed site-muted">
              <p>
                Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13.
              </p>
              <p>
                If you are a parent or guardian and you are aware that your Children has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we take steps to remove that information from our servers.
              </p>
            </div>
          </div>

          <div className="my-2 h-px w-full bg-border/40" />

          {/* 9. Changes to privacy policy */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-3 font-serif text-3xl font-bold text-foreground">
              <span className="flex size-10 items-center justify-center rounded-full bg-[rgb(var(--accent)_/_0.15)] text-[rgb(var(--accent-foreground))]">
                9
              </span>
              Changes to This Policy
            </h2>
            <div className="ml-13 space-y-4 text-base leading-relaxed site-muted">
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date at the top of this Privacy Policy.
              </p>
              <p>
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
            </div>
          </div>

          <div className="my-2 h-px w-full bg-border/40" />

          {/* 10. Contact information */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-3 font-serif text-3xl font-bold text-foreground">
              <span className="flex size-10 items-center justify-center rounded-full bg-[rgb(var(--accent)_/_0.15)] text-[rgb(var(--accent-foreground))]">
                10
              </span>
              Contact Us
            </h2>
            <div className="ml-13 space-y-4 text-base leading-relaxed site-muted">
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us through the following methods:
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <a href="mailto:privacy@simicafe.com" className="inline-flex items-center gap-2 font-semibold text-[rgb(var(--accent-foreground))] hover:underline">
                  <Mail className="size-5" /> privacy@simicafe.com
                </a>
                <p className="flex items-center gap-2 font-medium">
                  <Heart className="size-5 text-rose-500" /> Made with care by the Simi Café Team.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
