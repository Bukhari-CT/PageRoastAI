import type { Metadata } from "next";
import { LandingNavbarServer } from "@/components/features/landing/landing-navbar-wrapper";
import { Footer } from "@/components/features/landing/footer";

export const metadata: Metadata = {
  title: "Privacy Policy — PageRoast AI",
  description: "How PageRoast AI collects, uses, and protects your data.",
};

const SECTIONS = [
  {
    title: "Overview",
    body: "This Privacy Policy explains how PageRoast AI (\"we\", \"us\", \"our\") collects, uses, and protects information when you use our website and audit service. By using PageRoast AI, you agree to the collection and use of information as described here.",
  },
  {
    title: "Information We Collect",
    body: "We collect information you provide directly, such as your name, email address, and password when you create an account, and the URLs you submit for auditing. We also collect basic technical information automatically, including IP address, browser type, and pages visited, to keep the service secure and reliable.",
  },
  {
    title: "How We Use Your Information",
    body: "We use your information to operate and improve the audit service, generate the UX reports you request, process payments, communicate with you about your account, and monitor for abuse or security issues. We do not sell your personal information.",
  },
  {
    title: "Cookies",
    body: "We use cookies and similar technologies to keep you signed in, remember your preferences (such as light/dark mode), and understand how the service is used. You can control cookies through your browser settings, though disabling them may affect functionality.",
  },
  {
    title: "Third-Party Services",
    body: "We rely on third-party providers to operate PageRoast AI — including AI/LLM providers to generate audit content and a payment processor to handle purchases. These providers only receive the information necessary to perform their function and are bound by their own privacy and security obligations.",
  },
  {
    title: "Data Retention",
    body: "We retain account information and audit history for as long as your account is active. You may request deletion of your account and associated data at any time by contacting us.",
  },
  {
    title: "Your Rights",
    body: "Depending on your location, you may have the right to access, correct, export, or delete your personal information. To exercise any of these rights, contact us using the details below.",
  },
  {
    title: "Security",
    body: "We use industry-standard safeguards to protect your information, including encrypted connections and hashed credentials. No method of transmission or storage is 100% secure, and we cannot guarantee absolute security.",
  },
  {
    title: "Children's Privacy",
    body: "PageRoast AI is not directed at children under 13, and we do not knowingly collect personal information from children under 13.",
  },
  {
    title: "Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. Material changes will be reflected by updating the \"Last updated\" date below.",
  },
  {
    title: "Contact",
    body: "Questions about this Privacy Policy or your data can be sent to the email address associated with your PageRoast AI account, or through the support channel linked in your dashboard.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbarServer />

      <main className="flex-1 px-6 pt-32 pb-24">
        <div className="max-w-3xl mx-auto">
          <p className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground mb-12">Last updated: August 29, 2026</p>

          <div className="space-y-10">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-bold text-foreground mb-3">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
