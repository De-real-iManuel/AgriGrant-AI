import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — AgriGrant AI',
  description: 'Read the Terms of Service for AgriGrant AI, the AI-powered Nigerian agricultural grant discovery and application platform.',
};

const BODY = 'text-sm leading-relaxed';
const BODY_COLOR = { color: '#595959', fontFamily: 'Arial, sans-serif' };
const HEAD_COLOR = { color: '#000000', fontFamily: 'Arial, sans-serif' };

function H2({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-xl font-bold mt-2" style={HEAD_COLOR}>
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className={BODY} style={BODY_COLOR}>{children}</p>;
}

function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc list-inside flex flex-col gap-1.5 pl-2" style={BODY_COLOR}>
      {children}
    </ul>
  );
}

function LI({ children }: { children: React.ReactNode }) {
  return <li className={BODY} style={BODY_COLOR}>{children}</li>;
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  const isExternal = href.startsWith('http') || href.startsWith('mailto');
  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="underline break-words"
      style={{ color: '#3030F1', fontFamily: 'Arial, sans-serif' }}
    >
      {children}
    </a>
  );
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      {/* Nav */}
      <header className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: '#E2E8F0' }}>
        <Link href="/" className="flex items-center gap-2.5">
          <AppLogo size={32} />
          <span className="font-bold text-base" style={{ color: '#166534' }}>
            AgriGrant <span style={{ color: '#EAB308' }}>AI</span>
          </span>
        </Link>
        <Link href="/" className="text-sm font-medium" style={{ color: '#595959' }}>
          ← Back to Home
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 flex flex-col gap-7">

        {/* Title */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold" style={HEAD_COLOR}>Terms of Service</h1>
          <p className={BODY} style={BODY_COLOR}>
            Last updated: <strong>June 10, 2026</strong>
          </p>
        </div>

        {/* Intro */}
        <div className="flex flex-col gap-3">
          <P>
            These Terms of Service (&quot;Terms&quot;) govern your access to and use of the AgriGrant AI platform, including our website at <A href="http://agrigrant.xyz">http://agrigrant.xyz</A>, our web application, and all related services (collectively, the &quot;Services&quot;) operated by <strong>REM Labs LLC</strong> (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
          </P>
          <P>
            By creating an account or using any part of our Services, you confirm that you have read, understood, and agree to be bound by these Terms and our <A href="/privacy-policy">Privacy Policy</A>. If you do not agree, you must not use our Services.
          </P>
          <P>
            <strong>Contact:</strong> REM Labs LLC, 10b Agip Road, Port Harcourt, Rivers 500101, Nigeria · <A href="mailto:info@agrigrant.xyz">info@agrigrant.xyz</A>
          </P>
        </div>

        {/* TOC */}
        <div className="flex flex-col gap-2">
          <H2>Table of Contents</H2>
          {[
            ['#eligibility', '1. Eligibility'],
            ['#account', '2. Account Registration'],
            ['#services', '3. Description of Services'],
            ['#ai-disclaimer', '4. AI-Generated Content Disclaimer'],
            ['#acceptable-use', '5. Acceptable Use'],
            ['#ip', '6. Intellectual Property'],
            ['#user-content', '7. User Content'],
            ['#payments', '8. Payments and Subscriptions'],
            ['#termination', '9. Termination'],
            ['#disclaimers', '10. Disclaimers'],
            ['#liability', '11. Limitation of Liability'],
            ['#indemnification', '12. Indemnification'],
            ['#governing-law', '13. Governing Law'],
            ['#changes', '14. Changes to These Terms'],
            ['#contact-us', '15. Contact Us'],
          ].map(([href, label]) => (
            <p key={href} className="text-sm" style={BODY_COLOR}>
              <A href={href as string}>{label}</A>
            </p>
          ))}
        </div>

        {/* 1 */}
        <div className="flex flex-col gap-3" id="eligibility">
          <H2 id="eligibility">1. Eligibility</H2>
          <P>
            You must be at least 18 years old to use our Services. By using AgriGrant AI, you represent and warrant that:
          </P>
          <UL>
            <LI>You are at least 18 years of age.</LI>
            <LI>You have the legal capacity to enter into a binding agreement.</LI>
            <LI>You are not prohibited from using the Services under the laws of Nigeria or any other applicable jurisdiction.</LI>
            <LI>All information you provide to us is accurate, complete, and up to date.</LI>
          </UL>
          <P>
            AgriGrant AI is designed primarily for Nigerian farmers, cooperatives, and agribusinesses. While access is not restricted by location, the grant programs, eligibility criteria, and compliance requirements referenced within the platform are specific to Nigeria and Nigerian regulatory bodies (CBN, NIRSAL, BOA, FMARD, etc.).
          </P>
        </div>

        {/* 2 */}
        <div className="flex flex-col gap-3" id="account">
          <H2 id="account">2. Account Registration</H2>
          <P>
            To access most features of AgriGrant AI, you must create an account. When registering, you agree to:
          </P>
          <UL>
            <LI>Provide accurate, current, and complete information including your full legal name, phone number, email address, Nigerian state, LGA, and farm type.</LI>
            <LI>Verify your email address using the one-time password (OTP) sent to you at registration.</LI>
            <LI>Keep your login credentials confidential. You are responsible for all activity that occurs under your account.</LI>
            <LI>Notify us immediately at <A href="mailto:info@agrigrant.xyz">info@agrigrant.xyz</A> if you suspect any unauthorised access to your account.</LI>
          </UL>
          <P>
            We reserve the right to suspend or terminate accounts that contain false, misleading, or fraudulent information, or that are used in violation of these Terms.
          </P>
        </div>

        {/* 3 */}
        <div className="flex flex-col gap-3" id="services">
          <H2 id="services">3. Description of Services</H2>
          <P>
            AgriGrant AI provides an AI-powered platform that helps Nigerian farmers and agribusinesses with:
          </P>
          <UL>
            <LI><strong>Grant Discovery</strong> — AI-assisted search and matching of agricultural grant programs from federal agencies (CBN, NIRSAL, BOA, FMARD), state governments, international donors (FAO, USAID, World Bank, IFAD), and NGOs.</LI>
            <LI><strong>Eligibility Assessment</strong> — Automated scoring (0–100) of your eligibility against program requirements, including Nigerian compliance checks (BVN, CAC, CRMS, cooperative membership, land documents).</LI>
            <LI><strong>Document Validation</strong> — AI-assisted extraction and cross-referencing of uploaded identity and compliance documents.</LI>
            <LI><strong>Proposal Generation</strong> — AI-written application letters and grant proposals tailored to specific grant bodies and Nigerian government standards.</LI>
            <LI><strong>Submission Assistance</strong> — Submission instructions, follow-up schedules, and (where available) automated portal form filling via RPA robots.</LI>
            <LI><strong>AI Chat Advisor</strong> — Conversational AI assistance for grant-related questions in English and Nigerian Pidgin.</LI>
          </UL>
          <P>
            Services are provided on a <strong>Free</strong> plan (limited features) and a <strong>Pro</strong> plan (full access, coming soon). Feature availability may vary by plan.
          </P>
        </div>

        {/* 4 */}
        <div className="flex flex-col gap-3" id="ai-disclaimer">
          <H2 id="ai-disclaimer">4. AI-Generated Content Disclaimer</H2>
          <P>
            <strong>Important.</strong> AgriGrant AI uses artificial intelligence, including large language models provided by OpenAI and Anthropic via UiPath Agentic Automation, to generate grant matches, eligibility scores, application letters, proposals, and other content.
          </P>
          <UL>
            <LI><strong>Not professional advice.</strong> AI-generated content on this platform does not constitute legal, financial, agricultural, or professional advice. It is for informational and assistive purposes only.</LI>
            <LI><strong>No guarantee of accuracy.</strong> While we work to ensure quality, AI-generated content may contain errors, outdated information, or inaccuracies. Grant program details, deadlines, and eligibility criteria change frequently. Always verify information directly with the relevant grant body before submitting an application.</LI>
            <LI><strong>No guarantee of grant approval.</strong> Using AgriGrant AI does not guarantee that any grant application will be approved, processed, or acknowledged by any government agency, bank, NGO, or donor organisation.</LI>
            <LI><strong>User responsibility.</strong> You are solely responsible for reviewing all AI-generated content before submission, ensuring its accuracy, and for any consequences arising from the submission of a grant application.</LI>
            <LI><strong>Third-party portals.</strong> Where our RPA robots interact with external government portals (NIRSAL, CBN, BOA, etc.), we are not responsible for those platforms' availability, terms, or decisions.</LI>
          </UL>
        </div>

        {/* 5 */}
        <div className="flex flex-col gap-3" id="acceptable-use">
          <H2 id="acceptable-use">5. Acceptable Use</H2>
          <P>You agree to use AgriGrant AI only for lawful purposes and in accordance with these Terms. You must not:</P>
          <UL>
            <LI>Submit false, misleading, or fraudulent information about yourself, your farm, or your compliance status to obtain grant matches or generate applications.</LI>
            <LI>Use the platform to submit grant applications on behalf of another person without their explicit knowledge and consent.</LI>
            <LI>Attempt to circumvent, hack, scrape, reverse-engineer, or disrupt any part of the platform or its underlying systems.</LI>
            <LI>Use automated tools to access the platform in a manner that places an unreasonable load on our infrastructure.</LI>
            <LI>Upload documents that you know to be forged, falsified, or fraudulent.</LI>
            <LI>Use the platform to commit fraud against any Nigerian government agency, financial institution, or donor organisation.</LI>
            <LI>Share your account credentials with third parties or allow others to access the platform using your account.</LI>
            <LI>Use the Services in any way that violates applicable Nigerian or international law.</LI>
          </UL>
          <P>
            Violation of these terms may result in immediate account suspension, termination, and where applicable, reporting to relevant Nigerian authorities including the EFCC.
          </P>
        </div>

        {/* 6 */}
        <div className="flex flex-col gap-3" id="ip">
          <H2 id="ip">6. Intellectual Property</H2>
          <P>
            All content, software, design, trademarks, logos, and technology on the AgriGrant AI platform — including but not limited to the AI agent pipeline, BPMN workflow designs, application templates, and the AgriGrant AI brand — are the exclusive property of <strong>REM Labs LLC</strong> and are protected by applicable intellectual property laws.
          </P>
          <P>
            You are granted a limited, non-exclusive, non-transferable, revocable licence to access and use the Services for your personal, non-commercial agricultural grant purposes. You may not reproduce, distribute, modify, create derivative works from, or commercially exploit any part of the platform without our prior written consent.
          </P>
        </div>

        {/* 7 */}
        <div className="flex flex-col gap-3" id="user-content">
          <H2 id="user-content">7. User Content</H2>
          <P>
            When you upload documents, enter farm profile data, submit application information, or provide any other content through the platform (&quot;User Content&quot;), you:
          </P>
          <UL>
            <LI>Retain ownership of your User Content.</LI>
            <LI>Grant REM Labs LLC a limited, non-exclusive licence to process, store, and use your User Content solely for the purpose of providing the Services to you.</LI>
            <LI>Represent and warrant that your User Content does not infringe on any third party&apos;s rights and does not contain any fraudulent or illegal material.</LI>
          </UL>
          <P>
            We do not sell your personal or farm data to third parties. Your data is processed in accordance with our <A href="/privacy-policy">Privacy Policy</A>.
          </P>
        </div>

        {/* 8 */}
        <div className="flex flex-col gap-3" id="payments">
          <H2 id="payments">8. Payments and Subscriptions</H2>
          <P>
            AgriGrant AI currently offers a <strong>Free plan</strong>. A <strong>Pro plan</strong> is planned at ₦2,500/month (pricing subject to change before launch).
          </P>
          <UL>
            <LI>All payments will be processed securely through <strong>Paystack</strong>. By making a payment, you agree to Paystack&apos;s terms and privacy policy.</LI>
            <LI>Subscriptions will auto-renew at the end of each billing period unless cancelled before the renewal date.</LI>
            <LI>You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of the current billing period — no partial refunds are issued for unused time.</LI>
            <LI>We reserve the right to change pricing at any time. Any price changes will be communicated to you at least 14 days in advance via email.</LI>
            <LI>In the event of a failed payment, we may suspend access to Pro features until payment is resolved.</LI>
          </UL>
        </div>

        {/* 9 */}
        <div className="flex flex-col gap-3" id="termination">
          <H2 id="termination">9. Termination</H2>
          <P>
            <strong>By you:</strong> You may delete your account at any time from your account settings or by emailing <A href="mailto:info@agrigrant.xyz">info@agrigrant.xyz</A>. Upon deletion, your personal data will be handled in accordance with our <A href="/privacy-policy">Privacy Policy</A>.
          </P>
          <P>
            <strong>By us:</strong> We may suspend or terminate your account at any time, with or without notice, if we reasonably believe you have violated these Terms, engaged in fraudulent activity, or if required to do so by law. We may also discontinue the Services at any time.
          </P>
          <P>
            Provisions of these Terms that by their nature should survive termination — including intellectual property rights, disclaimers, limitation of liability, and indemnification — shall survive termination.
          </P>
        </div>

        {/* 10 */}
        <div className="flex flex-col gap-3" id="disclaimers">
          <H2 id="disclaimers">10. Disclaimers</H2>
          <P>
            THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
          </P>
          <P>We do not warrant that:</P>
          <UL>
            <LI>The Services will be uninterrupted, error-free, or secure.</LI>
            <LI>Any grant information, eligibility scores, or AI-generated proposals will be accurate, complete, or current.</LI>
            <LI>Any grant application prepared or submitted using our platform will be successful.</LI>
            <LI>The platform will be compatible with all devices or browsers.</LI>
          </UL>
          <P>
            Grant programs referenced on AgriGrant AI are subject to the policies and decisions of independent government agencies, financial institutions, and donor organisations over which we have no control.
          </P>
        </div>

        {/* 11 */}
        <div className="flex flex-col gap-3" id="liability">
          <H2 id="liability">11. Limitation of Liability</H2>
          <P>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, REM LABS LLC, ITS DIRECTORS, EMPLOYEES, PARTNERS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
          </P>
          <UL>
            <LI>Loss of grant funding or revenue resulting from an unsuccessful application.</LI>
            <LI>Reliance on AI-generated eligibility scores, proposals, or submission instructions.</LI>
            <LI>Data loss, system downtime, or service interruptions.</LI>
            <LI>Actions or decisions made by third-party grant bodies, government portals, or financial institutions.</LI>
          </UL>
          <P>
            OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM YOUR USE OF THE SERVICES SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE THREE (3) MONTHS PRECEDING THE CLAIM, OR ₦10,000, WHICHEVER IS GREATER.
          </P>
        </div>

        {/* 12 */}
        <div className="flex flex-col gap-3" id="indemnification">
          <H2 id="indemnification">12. Indemnification</H2>
          <P>
            You agree to indemnify, defend, and hold harmless REM Labs LLC and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or relating to:
          </P>
          <UL>
            <LI>Your use of the Services.</LI>
            <LI>Your violation of these Terms.</LI>
            <LI>Any false, fraudulent, or misleading information you submit through the platform.</LI>
            <LI>Your violation of any third-party rights or applicable law.</LI>
          </UL>
        </div>

        {/* 13 */}
        <div className="flex flex-col gap-3" id="governing-law">
          <H2 id="governing-law">13. Governing Law</H2>
          <P>
            These Terms are governed by and construed in accordance with the laws of the <strong>Federal Republic of Nigeria</strong>, without regard to its conflict of law provisions.
          </P>
          <P>
            Any disputes arising out of or in connection with these Terms shall first be attempted to be resolved through good-faith negotiation. If unresolved within 30 days, disputes shall be submitted to the exclusive jurisdiction of the courts of <strong>Rivers State, Nigeria</strong>.
          </P>
        </div>

        {/* 14 */}
        <div className="flex flex-col gap-3" id="changes">
          <H2 id="changes">14. Changes to These Terms</H2>
          <P>
            We reserve the right to modify these Terms at any time. When we make material changes, we will notify you by email or by posting a prominent notice on the platform at least <strong>14 days</strong> before the changes take effect.
          </P>
          <P>
            Your continued use of the Services after the effective date of the updated Terms constitutes your acceptance of the revised Terms. If you do not agree to the updated Terms, you must stop using the Services and delete your account.
          </P>
        </div>

        {/* 15 */}
        <div className="flex flex-col gap-3" id="contact-us">
          <H2 id="contact-us">15. Contact Us</H2>
          <P>If you have any questions about these Terms, please contact us:</P>
          <address className="not-italic flex flex-col gap-0.5 text-sm" style={BODY_COLOR}>
            <strong>REM Labs LLC</strong>
            <span>10b Agip Road, Port Harcourt</span>
            <span>Port Harcourt, Rivers 500101</span>
            <span>Nigeria</span>
            <span>Email: <A href="mailto:info@agrigrant.xyz">info@agrigrant.xyz</A></span>
          </address>
        </div>

        {/* Footer */}
        <div
          className="pt-8 mt-4 border-t text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{ borderColor: '#E2E8F0', color: '#94A3B8' }}
        >
          <span>© 2026 REM Labs LLC · AgriGrant AI. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:underline" style={{ color: '#94A3B8' }}>Privacy Policy</Link>
            <Link href="/cookie-policy" className="hover:underline" style={{ color: '#94A3B8' }}>Cookie Policy</Link>
            <Link href="/" className="hover:underline" style={{ color: '#94A3B8' }}>Home</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
