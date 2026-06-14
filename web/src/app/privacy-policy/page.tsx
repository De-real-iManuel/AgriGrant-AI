import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — AgriGrant AI',
  description: 'Learn how AgriGrant AI collects, uses, and protects your personal information.',
};

const BODY = 'text-sm leading-relaxed';
const BODY_COLOR = { color: '#595959', fontFamily: 'Arial, sans-serif' };
const HEAD_COLOR = { color: '#000000', fontFamily: 'Arial, sans-serif' };
const LINK_STYLE = { color: '#3030F1', fontFamily: 'Arial, sans-serif', wordBreak: 'break-word' as const };

function H2({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-xl font-bold mt-2" style={HEAD_COLOR}>
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-bold mt-1" style={HEAD_COLOR}>
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className={BODY} style={BODY_COLOR}>{children}</p>;
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  const isExternal = href.startsWith('http') || href.startsWith('mailto');
  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="underline break-words"
      style={LINK_STYLE}
    >
      {children}
    </a>
  );
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc list-inside flex flex-col gap-1.5 pl-2" style={BODY_COLOR}>{children}</ul>;
}

function LI({ children }: { children: React.ReactNode }) {
  return <li className={BODY} style={BODY_COLOR}>{children}</li>;
}

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold" style={HEAD_COLOR}>Privacy Policy</h1>
          <p className={BODY} style={BODY_COLOR}>Last updated: <strong>June 10, 2026</strong></p>
        </div>

        {/* Intro */}
        <div className="flex flex-col gap-3">
          <P>
            This Privacy Notice for <strong>REM Labs LLC</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) describes how and why we might access, collect, store, use, and/or share (&quot;process&quot;) your personal information when you use our services (&quot;Services&quot;), including when you:
          </P>
          <UL>
            <LI>Visit our website at <A href="http://agrigrant.xyz/">http://agrigrant.xyz/</A> or any website of ours that links to this Privacy Notice</LI>
            <LI>Use <strong>AgriGrant AI</strong> — an end-to-end intelligent platform that helps Nigerian smallholder farmers discover, assess eligibility for, and submit agricultural grant applications in under 10 minutes, built on UiPath Agentic Automation orchestrating five specialised AI agents.</LI>
            <LI>Engage with us in other related ways, including any marketing or events</LI>
          </UL>
          <P>
            <strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy rights and choices. If you do not agree with our policies and practices, please do not use our Services. If you still have questions, please contact us at <A href="mailto:info@agrigrant.xyz">info@agrigrant.xyz</A>.
          </P>
        </div>

        {/* Summary */}
        <div className="flex flex-col gap-3">
          <H2>Summary of Key Points</H2>
          <P><em><strong>This summary provides key points from our Privacy Notice.</strong></em></P>
          <P><strong>What personal information do we process?</strong> We may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use.</P>
          <P><strong>Do we process any sensitive personal information?</strong> Some information may be considered &apos;special&apos; or &apos;sensitive&apos; in certain jurisdictions. We may process sensitive personal information when necessary with your consent or as otherwise permitted by applicable law.</P>
          <P><strong>Do we collect any information from third parties?</strong> We do not collect any information from third parties.</P>
          <P><strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.</P>
          <P><strong>In what situations and with which parties do we share personal information?</strong> We may share information in specific situations and with specific third parties.</P>
          <P><strong>How do we keep your information safe?</strong> We have adequate organisational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure.</P>
          <P><strong>What are your rights?</strong> Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information.</P>
          <P><strong>How do you exercise your rights?</strong> The easiest way is by contacting us at <A href="mailto:info@agrigrant.xyz">info@agrigrant.xyz</A>. We will consider and act upon any request in accordance with applicable data protection laws.</P>
        </div>

        {/* Table of Contents */}
        <div className="flex flex-col gap-2" id="toc">
          <H2>Table of Contents</H2>
          {[
            ['#infocollect', '1. What Information Do We Collect?'],
            ['#infouse', '2. How Do We Process Your Information?'],
            ['#whoshare', '3. When and With Whom Do We Share Your Personal Information?'],
            ['#cookies', '4. Do We Use Cookies and Other Tracking Technologies?'],
            ['#ai', '5. Do We Offer Artificial Intelligence-Based Products?'],
            ['#inforetain', '6. How Long Do We Keep Your Information?'],
            ['#infosafe', '7. How Do We Keep Your Information Safe?'],
            ['#infominors', '8. Do We Collect Information From Minors?'],
            ['#privacyrights', '9. What Are Your Privacy Rights?'],
            ['#DNT', '10. Controls for Do-Not-Track Features'],
            ['#otherlaws', '11. Do Other Regions Have Specific Privacy Rights?'],
            ['#policyupdates', '12. Do We Make Updates to This Notice?'],
            ['#contact', '13. How Can You Contact Us About This Notice?'],
            ['#request', '14. How Can You Review, Update, or Delete the Data We Collect From You?'],
          ].map(([href, label]) => (
            <p key={href} className="text-sm" style={BODY_COLOR}>
              <A href={href}>{label}</A>
            </p>
          ))}
        </div>

        {/* Section 1 */}
        <div className="flex flex-col gap-3" id="infocollect">
          <H2 id="infocollect">1. What Information Do We Collect?</H2>
          <H3>Personal information you disclose to us</H3>
          <P><em><strong>In Short:</strong> We collect personal information that you provide to us.</em></P>
          <P>We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.</P>
          <P><strong>Personal Information Provided by You.</strong> The personal information we collect may include: names, phone numbers, email addresses, mailing addresses, passwords, contact preferences, billing addresses, debit/credit card numbers, contact or authentication data.</P>
          <P><strong>Sensitive Information.</strong> When necessary, with your consent or as otherwise permitted by applicable law, we process: social security numbers or other government identifiers; information revealing trade union membership.</P>
          <P><strong>Payment Data.</strong> We may collect data necessary to process your payment if you choose to make purchases. All payment data is handled and stored by <strong>Paystack</strong>. You may find their privacy notice at: <A href="https://paystack.com/privacy/merchant">https://paystack.com/privacy/merchant</A>.</P>
          <P>All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.</P>

          <H3>Information automatically collected</H3>
          <P><em><strong>In Short:</strong> Some information — such as your IP address and/or browser and device characteristics — is collected automatically when you visit our Services.</em></P>
          <P>We automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, and other technical information.</P>
          <P>Like many businesses, we also collect information through cookies and similar technologies.</P>
          <P>The information we collect includes:</P>
          <UL>
            <LI><em>Log and Usage Data.</em> Service-related, diagnostic, usage, and performance information our servers automatically collect when you access or use our Services, including IP address, device information, browser type, pages and files viewed, searches, and other actions.</LI>
            <LI><em>Location Data.</em> We collect location data such as information about your device&apos;s location, which can be either precise or imprecise.</LI>
          </UL>

          <H3>Google API</H3>
          <P>Our use of information received from Google APIs will adhere to the <A href="https://developers.google.com/terms/api-services-user-data-policy">Google API Services User Data Policy</A>, including the <A href="https://developers.google.com/terms/api-services-user-data-policy#limited-use">Limited Use requirements</A>.</P>
        </div>

        {/* Section 2 */}
        <div className="flex flex-col gap-3" id="infouse">
          <H2>2. How Do We Process Your Information?</H2>
          <P><em><strong>In Short:</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.</em></P>
          <P><strong>We process your personal information for a variety of reasons, depending on how you interact with our Services, including:</strong></P>
          <UL>
            <LI><strong>To facilitate account creation and authentication</strong> — so you can create and log in to your account.</LI>
            <LI><strong>To deliver and facilitate delivery of services to the user</strong> — to provide you with the requested service.</LI>
            <LI><strong>To send administrative information to you</strong> — including details about our products and services, changes to our terms and policies.</LI>
            <LI><strong>To post testimonials</strong> — we post testimonials on our Services that may contain personal information.</LI>
            <LI><strong>To comply with our legal obligations</strong> — to comply with our legal obligations, respond to legal requests, and exercise, establish, or defend our legal rights.</LI>
          </UL>
        </div>

        {/* Section 3 */}
        <div className="flex flex-col gap-3" id="whoshare">
          <H2>3. When and With Whom Do We Share Your Personal Information?</H2>
          <P><em><strong>In Short:</strong> We may share information in specific situations described in this section and/or with the following third parties.</em></P>
          <P>We may need to share your personal information in the following situations:</P>
          <UL>
            <LI><strong>Business Transfers.</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</LI>
            <LI><strong>When we use Google Maps Platform APIs.</strong> We may share your information with certain Google Maps Platform APIs. We obtain and store on your device (&apos;cache&apos;) your location for three (3) months. You may revoke your consent anytime by contacting us.</LI>
            <LI><strong>Affiliates.</strong> We may share your information with our affiliates, in which case we will require those affiliates to honour this Privacy Notice.</LI>
            <LI><strong>Business Partners.</strong> We may share your information with our business partners to offer you certain products, services, or promotions.</LI>
          </UL>
        </div>

        {/* Section 4 */}
        <div className="flex flex-col gap-3" id="cookies">
          <H2>4. Do We Use Cookies and Other Tracking Technologies?</H2>
          <P><em><strong>In Short:</strong> We may use cookies and other tracking technologies to collect and store your information.</em></P>
          <P>We may use cookies and similar tracking technologies (like web beacons and pixels) to gather information when you interact with our Services. Some online tracking technologies help us maintain the security of our Services and your account, prevent crashes, fix bugs, save your preferences, and assist with basic site functions.</P>
          <P>We also permit third parties and service providers to use online tracking technologies on our Services for analytics and advertising, including to help manage and display advertisements or tailor advertisements to your interests.</P>
          <P>Specific information about how we use such technologies and how you can refuse certain cookies is set out in our <A href="/cookie-policy">Cookie Policy</A>.</P>

          <H3>Google Analytics</H3>
          <P>We may share your information with Google Analytics to track and analyse the use of the Services, including Google Analytics Demographics and Interests Reporting. To opt out of being tracked by Google Analytics across the Services, visit <A href="https://tools.google.com/dlpage/gaoptout">https://tools.google.com/dlpage/gaoptout</A>. You can also opt out through <A href="https://adssettings.google.com/">Ads Settings</A> or <A href="http://optout.networkadvertising.org/">http://optout.networkadvertising.org/</A>. For more information, see the <A href="https://policies.google.com/privacy">Google Privacy &amp; Terms page</A>.</P>
        </div>

        {/* Section 5 */}
        <div className="flex flex-col gap-3" id="ai">
          <H2>5. Do We Offer Artificial Intelligence-Based Products?</H2>
          <P><em><strong>In Short:</strong> We offer products, features, or tools powered by artificial intelligence, machine learning, or similar technologies.</em></P>
          <P>As part of our Services, we offer AI Products designed to enhance your experience. The terms in this Privacy Notice govern your use of the AI Products within our Services.</P>
          <P><strong>Use of AI Technologies.</strong> We provide the AI Products through third-party service providers (&apos;AI Service Providers&apos;), including <strong>OpenAI</strong> and <strong>Anthropic</strong>. Your input, output, and personal information will be shared with and processed by these AI Service Providers. You must not use the AI Products in any way that violates the terms or policies of any AI Service Provider.</P>
          <P><strong>Our AI Products</strong> are designed for: AI automation, AI applications, and natural language processing.</P>
          <P><strong>How We Process Your Data Using AI.</strong> All personal information processed using our AI Products is handled in line with our Privacy Notice and our agreement with third parties. This ensures high security and safeguards your personal information throughout the process.</P>
        </div>

        {/* Section 6 */}
        <div className="flex flex-col gap-3" id="inforetain">
          <H2>6. How Long Do We Keep Your Information?</H2>
          <P><em><strong>In Short:</strong> We keep your information for as long as necessary to fulfil the purposes outlined in this Privacy Notice unless otherwise required by law.</em></P>
          <P>We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required or permitted by law. No purpose in this notice will require us keeping your personal information for longer than the period of time in which users have an account with us.</P>
          <P>When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymise such information, or securely store your personal information and isolate it from any further processing until deletion is possible.</P>
        </div>

        {/* Section 7 */}
        <div className="flex flex-col gap-3" id="infosafe">
          <H2>7. How Do We Keep Your Information Safe?</H2>
          <P><em><strong>In Short:</strong> We aim to protect your personal information through a system of organisational and technical security measures.</em></P>
          <P>We have implemented appropriate and reasonable technical and organisational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure. You should only access the Services within a secure environment.</P>
        </div>

        {/* Section 8 */}
        <div className="flex flex-col gap-3" id="infominors">
          <H2>8. Do We Collect Information From Minors?</H2>
          <P><em><strong>In Short:</strong> We do not knowingly collect data from or market to children under 18 years of age.</em></P>
          <P>We do not knowingly collect, solicit data from, or market to children under 18 years of age, nor do we knowingly sell such personal information. By using the Services, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent&apos;s use of the Services. If you become aware of any data we may have collected from children under age 18, please contact us at <A href="mailto:info@agrigrant.xyz">info@agrigrant.xyz</A>.</P>
        </div>

        {/* Section 9 */}
        <div className="flex flex-col gap-3" id="privacyrights">
          <H2>9. What Are Your Privacy Rights?</H2>
          <P><em><strong>In Short:</strong> You may review, change, or terminate your account at any time, depending on your country, province, or state of residence.</em></P>
          <P><strong><u>Withdrawing your consent:</u></strong> If we are relying on your consent to process your personal information, you have the right to withdraw your consent at any time by contacting us using the contact details provided in section 13 below.</P>
          <P>However, please note that this will not affect the lawfulness of the processing before its withdrawal nor, when applicable law allows, will it affect the processing of your personal information conducted in reliance on lawful processing grounds other than consent.</P>
          <P><strong><u>Opting out of marketing and promotional communications:</u></strong> You can unsubscribe from our marketing and promotional communications at any time by replying &apos;STOP&apos; or &apos;UNSUBSCRIBE&apos; to the SMS messages that we send, or by contacting us. You will then be removed from the marketing lists. However, we may still communicate with you for service-related purposes.</P>

          <H3>Account Information</H3>
          <P>If you would at any time like to review or change the information in your account or terminate your account, you can:</P>
          <UL>
            <LI>Log in to your account settings and update your user account.</LI>
          </UL>
          <P>Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, we may retain some information in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our legal terms and/or comply with applicable legal requirements.</P>
          <P><strong><u>Cookies and similar technologies:</u></strong> Most web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove or reject cookies. If you choose to remove or reject cookies, this could affect certain features or services of our Services.</P>
          <P>If you have questions or comments about your privacy rights, you may email us at <A href="mailto:info@agrigrant.xyz">info@agrigrant.xyz</A>.</P>
        </div>

        {/* Section 10 */}
        <div className="flex flex-col gap-3" id="DNT">
          <H2>10. Controls for Do-Not-Track Features</H2>
          <P>Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track (&apos;DNT&apos;) feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage, no uniform technology standard for recognising and implementing DNT signals has been finalised. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this Privacy Notice.</P>
        </div>

        {/* Section 11 */}
        <div className="flex flex-col gap-3" id="otherlaws">
          <H2>11. Do Other Regions Have Specific Privacy Rights?</H2>
          <P><em><strong>In Short:</strong> You may have additional rights based on the country you reside in.</em></P>

          <H3>Republic of South Africa</H3>
          <P>At any time, you have the right to request access to or correction of your personal information. You can make such a request by contacting us using the contact details provided in section 14 below.</P>
          <P>If you are unsatisfied with the manner in which we address any complaint with regard to our processing of personal information, you can contact the office of the regulator:</P>
          <P><A href="https://inforegulator.org.za/">The Information Regulator (South Africa)</A></P>
          <P>General enquiries: <A href="mailto:enquiries@inforegulator.org.za">enquiries@inforegulator.org.za</A></P>
          <P>Complaints: <A href="mailto:PAIAComplaints@inforegulator.org.za">PAIAComplaints@inforegulator.org.za</A> &amp; <A href="mailto:POPIAComplaints@inforegulator.org.za">POPIAComplaints@inforegulator.org.za</A></P>
        </div>

        {/* Section 12 */}
        <div className="flex flex-col gap-3" id="policyupdates">
          <H2>12. Do We Make Updates to This Notice?</H2>
          <P><em><strong>In Short:</strong> Yes, we will update this notice as necessary to stay compliant with relevant laws.</em></P>
          <P>We may update this Privacy Notice from time to time. The updated version will be indicated by an updated &apos;Revised&apos; date at the top of this Privacy Notice. If we make material changes to this Privacy Notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this Privacy Notice frequently to be informed of how we are protecting your information.</P>
        </div>

        {/* Section 13 */}
        <div className="flex flex-col gap-3" id="contact">
          <H2>13. How Can You Contact Us About This Notice?</H2>
          <P>If you have questions or comments about this notice, you may email us at <A href="mailto:info@agrigrant.xyz">info@agrigrant.xyz</A> or contact us by post at:</P>
          <address className="not-italic flex flex-col gap-0.5 text-sm" style={BODY_COLOR}>
            <strong>REM Labs LLC</strong>
            <span>10b Agip Road, Port Harcourt</span>
            <span>Port Harcourt, Rivers 500101</span>
            <span>Nigeria</span>
          </address>
        </div>

        {/* Section 14 */}
        <div className="flex flex-col gap-3" id="request">
          <H2>14. How Can You Review, Update, or Delete the Data We Collect From You?</H2>
          <P>Based on the applicable laws of your country, you may have the right to request access to the personal information we collect from you, details about how we have processed it, correct inaccuracies, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law.</P>
          <P>To request to review, update, or delete your personal information, please contact us at <A href="mailto:info@agrigrant.xyz">info@agrigrant.xyz</A>.</P>
        </div>

        {/* Footer */}
        <div
          className="pt-8 mt-4 border-t text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{ borderColor: '#E2E8F0', color: '#94A3B8' }}
        >
          <span>© 2026 REM Labs LLC · AgriGrant AI. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/cookie-policy" className="hover:underline" style={{ color: '#94A3B8' }}>Cookie Policy</Link>
            <Link href="/" className="hover:underline" style={{ color: '#94A3B8' }}>Home</Link>
            <Link href="/sign-up-login-screen" className="hover:underline" style={{ color: '#94A3B8' }}>Sign In</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
