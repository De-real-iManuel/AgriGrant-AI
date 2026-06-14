import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy — AgriGrant AI',
  description: 'Learn how AgriGrant AI uses cookies and similar technologies on our website.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold" style={{ color: '#000000', fontFamily: 'Arial, sans-serif' }}>
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed" style={{ color: '#595959', fontFamily: 'Arial, sans-serif' }}>
        {children}
      </div>
    </section>
  );
}

function PolicyLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline break-words"
      style={{ color: '#3030F1', fontFamily: 'Arial, sans-serif' }}
    >
      {children}
    </a>
  );
}

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      {/* Minimal nav */}
      <header className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: '#E2E8F0' }}>
        <Link href="/" className="flex items-center gap-2.5">
          <AppLogo size={32} />
          <span className="font-bold text-base" style={{ color: '#166534' }}>
            AgriGrant <span style={{ color: '#EAB308' }}>AI</span>
          </span>
        </Link>
        <Link
          href="/"
          className="text-sm font-medium"
          style={{ color: '#595959' }}
        >
          ← Back to Home
        </Link>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 flex flex-col gap-8">

        {/* Title */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold" style={{ color: '#000000', fontFamily: 'Arial, sans-serif' }}>
            Cookie Policy
          </h1>
          <p className="text-sm" style={{ color: '#595959', fontFamily: 'Arial, sans-serif' }}>
            Last updated: <strong>June 10, 2026</strong>
          </p>
        </div>

        {/* Intro */}
        <div className="flex flex-col gap-3 text-sm leading-relaxed" style={{ color: '#595959', fontFamily: 'Arial, sans-serif' }}>
          <p>
            This Cookie Policy explains how <strong>REM Labs LLC</strong> (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; and &quot;our&quot;) uses cookies and similar technologies to recognize you when you visit our website at{' '}
            <PolicyLink href="http://agrigrant.xyz">http://agrigrant.xyz</PolicyLink>{' '}
            (&quot;Website&quot;). It explains what these technologies are and why we use them, as well as your rights to control our use of them.
          </p>
          <p>
            In some cases we may use cookies to collect personal information, or that becomes personal information if we combine it with other information.
          </p>
        </div>

        <Section title="What are cookies?">
          <p>
            Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
          </p>
          <p>
            Cookies set by the website owner (in this case, <strong>REM Labs LLC</strong>) are called &quot;first-party cookies.&quot; Cookies set by parties other than the website owner are called &quot;third-party cookies.&quot; Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics). The parties that set these third-party cookies can recognize your computer both when it visits the website in question and also when it visits certain other websites.
          </p>
        </Section>

        <Section title="Why do we use cookies?">
          <p>
            We use first- and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as &quot;essential&quot; or &quot;strictly necessary&quot; cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties. Third parties serve cookies through our Website for advertising, analytics, and other purposes. This is described in more detail below.
          </p>
        </Section>

        <Section title="How can I control cookies?">
          <p>
            You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Preference Center. The Cookie Preference Center allows you to select which categories of cookies you accept or reject. Essential cookies cannot be rejected as they are strictly necessary to provide you with services.
          </p>
          <p>
            The Cookie Preference Center can be found in the notification banner and on our Website. If you choose to reject cookies, you may still use our Website though your access to some functionality and areas of our Website may be restricted. You may also set or amend your web browser controls to accept or refuse cookies.
          </p>
          <p>
            The specific types of first- and third-party cookies served through our Website and the purposes they perform are described in the table below (please note that the specific cookies served may vary depending on the specific Online Properties you visit).
          </p>
        </Section>

        <Section title="How can I control cookies on my browser?">
          <p>
            As the means by which you can refuse cookies through your web browser controls vary from browser to browser, you should visit your browser&apos;s help menu for more information. The following is information about how to manage cookies on the most popular browsers:
          </p>
          <ul className="list-disc list-inside flex flex-col gap-1.5 pl-2">
            {[
              { label: 'Chrome', href: 'https://support.google.com/chrome/answer/95647#zippy=%2Callow-or-block-cookies' },
              { label: 'Internet Explorer', href: 'https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d' },
              { label: 'Firefox', href: 'https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop?redirectslug=enable-and-disable-cookies-website-preferences&redirectlocale=en-US' },
              { label: 'Safari', href: 'https://support.apple.com/en-ie/guide/safari/sfri11471/mac' },
              { label: 'Edge', href: 'https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd' },
              { label: 'Opera', href: 'https://help.opera.com/en/latest/web-preferences/' },
            ].map(({ label, href }) => (
              <li key={label}>
                <PolicyLink href={href}>{label}</PolicyLink>
              </li>
            ))}
          </ul>
          <p>In addition, most advertising networks offer you a way to opt out of targeted advertising. If you would like to find out more information, please visit:</p>
          <ul className="list-disc list-inside flex flex-col gap-1.5 pl-2">
            {[
              { label: 'Digital Advertising Alliance', href: 'http://www.aboutads.info/choices/' },
              { label: 'Digital Advertising Alliance of Canada', href: 'https://youradchoices.ca/' },
              { label: 'European Interactive Digital Advertising Alliance', href: 'http://www.youronlinechoices.com/' },
            ].map(({ label, href }) => (
              <li key={label}>
                <PolicyLink href={href}>{label}</PolicyLink>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="What about other tracking technologies, like web beacons?">
          <p>
            Cookies are not the only way to recognize or track visitors to a website. We may use other, similar technologies from time to time, like web beacons (sometimes called &quot;tracking pixels&quot; or &quot;clear gifs&quot;). These are tiny graphics files that contain a unique identifier that enables us to recognize when someone has visited our Website or opened an email including them. This allows us, for example, to monitor the traffic patterns of users from one page within a website to another, to deliver or communicate with cookies, to understand whether you have come to the website from an online advertisement displayed on a third-party website, to improve site performance, and to measure the success of email marketing campaigns. In many instances, these technologies are reliant on cookies to function properly, and so declining cookies will impair their functioning.
          </p>
        </Section>

        <Section title="Do you use Flash cookies or Local Shared Objects?">
          <p>
            Websites may also use so-called &quot;Flash Cookies&quot; (also known as Local Shared Objects or &quot;LSOs&quot;) to, among other things, collect and store information about your use of our services, fraud prevention, and for other site operations.
          </p>
          <p>
            If you do not want Flash Cookies stored on your computer, you can adjust the settings of your Flash player to block Flash Cookies storage using the tools contained in the{' '}
            <PolicyLink href="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager07.html">
              Website Storage Settings Panel
            </PolicyLink>. You can also control Flash Cookies by going to the{' '}
            <PolicyLink href="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager03.html">
              Global Storage Settings Panel
            </PolicyLink>{' '}
            and following the instructions (which may include instructions that explain, for example, how to delete existing Flash Cookies, how to prevent Flash LSOs from being placed on your computer without your being asked, and how to block Flash Cookies that are not being delivered by the operator of the page you are on at the time).
          </p>
          <p>
            Please note that setting the Flash Player to restrict or limit acceptance of Flash Cookies may reduce or impede the functionality of some Flash applications, including, potentially, Flash applications used in connection with our services or online content.
          </p>
        </Section>

        <Section title="Do you serve targeted advertising?">
          <p>
            Third parties may serve cookies on your computer or mobile device to serve advertising through our Website. These companies may use information about your visits to this and other websites in order to provide relevant advertisements about goods and services that you may be interested in. They may also employ technology that is used to measure the effectiveness of advertisements. They can accomplish this by using cookies or web beacons to collect information about your visits to this and other sites in order to provide relevant advertisements about goods and services of potential interest to you. The information collected through this process does not enable us or them to identify your name, contact details, or other details that directly identify you unless you choose to provide these.
          </p>
        </Section>

        <Section title="How often will you update this Cookie Policy?">
          <p>
            We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
          </p>
          <p>
            The date at the top of this Cookie Policy indicates when it was last updated.
          </p>
        </Section>

        <Section title="Where can I get further information?">
          <p>If you have any questions about our use of cookies or other technologies, please contact us at:</p>
          <address className="not-italic flex flex-col gap-1" style={{ color: '#595959', fontFamily: 'Arial, sans-serif' }}>
            <strong>REM Labs LLC</strong>
            <span>10b Agip Road, Port Harcourt</span>
            <span>Port Harcourt, Rivers 500101</span>
            <span>Nigeria</span>
            <span>Phone: 07042111950</span>
          </address>
        </Section>

        {/* Footer */}
        <div
          className="pt-8 mt-4 border-t text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{ borderColor: '#E2E8F0', color: '#94A3B8' }}
        >
          <span>© 2026 REM Labs LLC · AgriGrant AI. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:underline" style={{ color: '#94A3B8' }}>Home</Link>
            <Link href="/sign-up-login-screen" className="hover:underline" style={{ color: '#94A3B8' }}>Sign In</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
