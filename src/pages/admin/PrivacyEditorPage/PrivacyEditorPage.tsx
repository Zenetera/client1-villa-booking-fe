import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { LangTabs } from '../../../components/admin/LangTabs';
import styles from './PrivacyEditorPage.module.css';

type EditLang = 'en' | 'el';

const INITIAL_EN = `What we collect

When you submit a booking request through this website, we collect:

\u2022 Your name
\u2022 Your email address
\u2022 Your phone number
\u2022 Check-in and check-out dates
\u2022 Number of guests
\u2022 Any message or special requests you provide

We do not collect sensitive personal data such as passport numbers, payment card details, or health information unless you voluntarily provide it in a message.


Why we collect it

We use your information to:

\u2022 Process and respond to your booking request
\u2022 Send confirmation emails and booking details
\u2022 Contact you about your reservation (reminders, check-in instructions, etc.)
\u2022 Resolve disputes or address issues with your stay
\u2022 Comply with legal and tax obligations

We do not use your information for marketing, newsletters, or any other purpose without your consent.


Who we share it with

Your information is shared only with:

\u2022 Payment processor: Stripe (if paying online). Stripe handles payment data securely and separately.
\u2022 Email service: Brevo. We use Brevo to send confirmation and reminder emails. Your email address and name are shared only for this purpose.
\u2022 The villa owner: Your booking details, contact information, and any messages are visible to the owner to manage your reservation.

We do not sell, rent, or disclose your information to third parties.


Data retention

We retain your booking information for up to 3 years after your stay to maintain records for disputes, tax purposes, and service history. After 3 years, your data is deleted unless legally required to retain it.

You may request deletion of your data at any time by contacting the owner.


Your rights (GDPR)

If you are in the European Union, you have the right to:

\u2022 Access: Request a copy of the personal data we hold about you.
\u2022 Correction: Request that we correct inaccurate or incomplete data.
\u2022 Deletion: Request that we delete your data (the \u201Cright to be forgotten\u201D), except where we have a legal obligation to retain it.
\u2022 Objection: Object to the processing of your data in certain circumstances.

To exercise any of these rights, contact the owner at contact@sunsetvilla.com. We will respond within 30 days.


Security

We take reasonable measures to protect your information from unauthorized access, alteration, or disclosure. However, no method of transmission over the internet is completely secure. We cannot guarantee absolute security.

Payment information is handled by Stripe, which complies with PCI DSS standards and encrypts sensitive data.


Cookies

This website does not use tracking cookies or analytics. We use only essential session cookies to maintain your booking form state while you are submitting a request.


Third-party links

This website may link to external sites such as Google Maps or payment providers. We are not responsible for the privacy practices of third-party websites. Review their privacy policies before sharing information with them.


Changes to this policy

We may update this privacy policy occasionally. Changes will be posted on this page with an updated \u201CLast modified\u201D date. Continued use of the website constitutes acceptance of the updated policy.


Contact

If you have questions about this privacy policy or how we handle your data, contact:

Villa Elara Owner
Email: contact@sunsetvilla.com`;

const INITIAL_EL = `\u03A4\u03B9 \u03C3\u03C5\u03BB\u03BB\u03AD\u03B3\u03BF\u03C5\u03BC\u03B5

\u038C\u03C4\u03B1\u03BD \u03C5\u03C0\u03BF\u03B2\u03AC\u03BB\u03BB\u03B5\u03C4\u03B5 \u03B1\u03AF\u03C4\u03B7\u03C3\u03B7 \u03BA\u03C1\u03AC\u03C4\u03B7\u03C3\u03B7\u03C2 \u03BC\u03AD\u03C3\u03C9 \u03B1\u03C5\u03C4\u03BF\u03CD \u03C4\u03BF\u03C5 \u03B9\u03C3\u03C4\u03CC\u03C4\u03BF\u03C0\u03BF\u03C5, \u03C3\u03C5\u03BB\u03BB\u03AD\u03B3\u03BF\u03C5\u03BC\u03B5:

\u2022 \u03A4\u03BF \u03CC\u03BD\u03BF\u03BC\u03AC \u03C3\u03B1\u03C2
\u2022 \u03A4\u03B7 \u03B4\u03B9\u03B5\u03CD\u03B8\u03C5\u03BD\u03C3\u03B7 email \u03C3\u03B1\u03C2
\u2022 \u03A4\u03BF\u03BD \u03B1\u03C1\u03B9\u03B8\u03BC\u03CC \u03C4\u03B7\u03BB\u03B5\u03C6\u03CE\u03BD\u03BF\u03C5 \u03C3\u03B1\u03C2
\u2022 \u0397\u03BC\u03B5\u03C1\u03BF\u03BC\u03B7\u03BD\u03AF\u03B5\u03C2 \u03AC\u03C6\u03B9\u03BE\u03B7\u03C2 \u03BA\u03B1\u03B9 \u03B1\u03BD\u03B1\u03C7\u03CE\u03C1\u03B7\u03C3\u03B7\u03C2
\u2022 \u0391\u03C1\u03B9\u03B8\u03BC\u03CC \u03B5\u03C0\u03B9\u03C3\u03BA\u03B5\u03C0\u03C4\u03CE\u03BD
\u2022 \u039F\u03C0\u03BF\u03B9\u03BF\u03B4\u03AE\u03C0\u03BF\u03C4\u03B5 \u03BC\u03AE\u03BD\u03C5\u03BC\u03B1 \u03AE \u03B5\u03B9\u03B4\u03B9\u03BA\u03AD\u03C2 \u03B1\u03C0\u03B1\u03B9\u03C4\u03AE\u03C3\u03B5\u03B9\u03C2

\u0394\u03B5\u03BD \u03C3\u03C5\u03BB\u03BB\u03AD\u03B3\u03BF\u03C5\u03BC\u03B5 \u03B5\u03C5\u03B1\u03AF\u03C3\u03B8\u03B7\u03C4\u03B1 \u03C0\u03C1\u03BF\u03C3\u03C9\u03C0\u03B9\u03BA\u03AC \u03B4\u03B5\u03B4\u03BF\u03BC\u03AD\u03BD\u03B1 \u03B5\u03BA\u03C4\u03CC\u03C2 \u03B5\u03AC\u03BD \u03C4\u03B1 \u03C0\u03B1\u03C1\u03AD\u03C7\u03B5\u03C4\u03B5 \u03BF\u03B9\u03BA\u03B5\u03B9\u03BF\u03B8\u03B5\u03BB\u03CE\u03C2 \u03C3\u03B5 \u03BC\u03AE\u03BD\u03C5\u03BC\u03B1.


\u0393\u03B9\u03B1\u03C4\u03AF \u03C4\u03B1 \u03C3\u03C5\u03BB\u03BB\u03AD\u03B3\u03BF\u03C5\u03BC\u03B5

\u03A7\u03C1\u03B7\u03C3\u03B9\u03BC\u03BF\u03C0\u03BF\u03B9\u03BF\u03CD\u03BC\u03B5 \u03C4\u03B1 \u03C3\u03C4\u03BF\u03B9\u03C7\u03B5\u03AF\u03B1 \u03C3\u03B1\u03C2 \u03B3\u03B9\u03B1:

\u2022 \u0395\u03C0\u03B5\u03BE\u03B5\u03C1\u03B3\u03B1\u03C3\u03AF\u03B1 \u03BA\u03B1\u03B9 \u03B1\u03C0\u03AC\u03BD\u03C4\u03B7\u03C3\u03B7 \u03C3\u03C4\u03B7\u03BD \u03B1\u03AF\u03C4\u03B7\u03C3\u03B7 \u03BA\u03C1\u03AC\u03C4\u03B7\u03C3\u03AE\u03C2 \u03C3\u03B1\u03C2
\u2022 \u0391\u03C0\u03BF\u03C3\u03C4\u03BF\u03BB\u03AE email \u03B5\u03C0\u03B9\u03B2\u03B5\u03B2\u03B1\u03AF\u03C9\u03C3\u03B7\u03C2 \u03BA\u03B1\u03B9 \u03BB\u03B5\u03C0\u03C4\u03BF\u03BC\u03B5\u03C1\u03B5\u03B9\u03CE\u03BD \u03BA\u03C1\u03AC\u03C4\u03B7\u03C3\u03B7\u03C2
\u2022 \u0395\u03C0\u03B9\u03BA\u03BF\u03B9\u03BD\u03C9\u03BD\u03AF\u03B1 \u03C3\u03C7\u03B5\u03C4\u03B9\u03BA\u03AC \u03BC\u03B5 \u03C4\u03B7\u03BD \u03BA\u03C1\u03AC\u03C4\u03B7\u03C3\u03AE \u03C3\u03B1\u03C2
\u2022 \u0395\u03C0\u03AF\u03BB\u03C5\u03C3\u03B7 \u03B4\u03B9\u03B1\u03C6\u03BF\u03C1\u03CE\u03BD
\u2022 \u03A3\u03C5\u03BC\u03BC\u03CC\u03C1\u03C6\u03C9\u03C3\u03B7 \u03BC\u03B5 \u03BD\u03BF\u03BC\u03B9\u03BA\u03AD\u03C2 \u03BA\u03B1\u03B9 \u03C6\u03BF\u03C1\u03BF\u03BB\u03BF\u03B3\u03B9\u03BA\u03AD\u03C2 \u03C5\u03C0\u03BF\u03C7\u03C1\u03B5\u03CE\u03C3\u03B5\u03B9\u03C2


\u039C\u03B5 \u03C0\u03BF\u03B9\u03BF\u03C5\u03C2 \u03BC\u03BF\u03B9\u03C1\u03B1\u03B6\u03CC\u03BC\u03B1\u03C3\u03C4\u03B5

\u03A4\u03B1 \u03C3\u03C4\u03BF\u03B9\u03C7\u03B5\u03AF\u03B1 \u03C3\u03B1\u03C2 \u03BA\u03BF\u03B9\u03BD\u03BF\u03C0\u03BF\u03B9\u03BF\u03CD\u03BD\u03C4\u03B1\u03B9 \u03BC\u03CC\u03BD\u03BF \u03C3\u03B5:

\u2022 \u03A0\u03AC\u03C1\u03BF\u03C7\u03BF \u03C0\u03BB\u03B7\u03C1\u03C9\u03BC\u03CE\u03BD: Stripe
\u2022 \u03A5\u03C0\u03B7\u03C1\u03B5\u03C3\u03AF\u03B1 email: Brevo
\u2022 \u03A4\u03BF\u03BD \u03B9\u03B4\u03B9\u03BF\u03BA\u03C4\u03AE\u03C4\u03B7 \u03C4\u03B7\u03C2 \u03B2\u03AF\u03BB\u03B1\u03C2

\u0394\u03B5\u03BD \u03C0\u03C9\u03BB\u03BF\u03CD\u03BC\u03B5 \u03AE \u03BA\u03BF\u03B9\u03BD\u03BF\u03C0\u03BF\u03B9\u03BF\u03CD\u03BC\u03B5 \u03C4\u03B1 \u03C3\u03C4\u03BF\u03B9\u03C7\u03B5\u03AF\u03B1 \u03C3\u03B1\u03C2 \u03C3\u03B5 \u03C4\u03C1\u03AF\u03C4\u03BF\u03C5\u03C2.


\u0394\u03B9\u03B1\u03C4\u03AE\u03C1\u03B7\u03C3\u03B7 \u03B4\u03B5\u03B4\u03BF\u03BC\u03AD\u03BD\u03C9\u03BD

\u0394\u03B9\u03B1\u03C4\u03B7\u03C1\u03BF\u03CD\u03BC\u03B5 \u03C4\u03B1 \u03C3\u03C4\u03BF\u03B9\u03C7\u03B5\u03AF\u03B1 \u03BA\u03C1\u03AC\u03C4\u03B7\u03C3\u03B7\u03C2 \u03AD\u03C9\u03C2 3 \u03C7\u03C1\u03CC\u03BD\u03B9\u03B1 \u03BC\u03B5\u03C4\u03AC \u03C4\u03B7 \u03B4\u03B9\u03B1\u03BC\u03BF\u03BD\u03AE \u03C3\u03B1\u03C2. \u039C\u03C0\u03BF\u03C1\u03B5\u03AF\u03C4\u03B5 \u03BD\u03B1 \u03B6\u03B7\u03C4\u03AE\u03C3\u03B5\u03C4\u03B5 \u03B4\u03B9\u03B1\u03B3\u03C1\u03B1\u03C6\u03AE \u03B1\u03BD\u03AC \u03C0\u03AC\u03C3\u03B1 \u03C3\u03C4\u03B9\u03B3\u03BC\u03AE.


\u03A4\u03B1 \u03B4\u03B9\u03BA\u03B1\u03B9\u03CE\u03BC\u03B1\u03C4\u03AC \u03C3\u03B1\u03C2 (GDPR)

\u0395\u03AC\u03BD \u03B2\u03C1\u03AF\u03C3\u03BA\u03B5\u03C3\u03C4\u03B5 \u03C3\u03C4\u03B7\u03BD \u0395\u03C5\u03C1\u03C9\u03C0\u03B1\u03CA\u03BA\u03AE \u0388\u03BD\u03C9\u03C3\u03B7, \u03AD\u03C7\u03B5\u03C4\u03B5 \u03B4\u03B9\u03BA\u03B1\u03AF\u03C9\u03BC\u03B1:

\u2022 \u03A0\u03C1\u03CC\u03C3\u03B2\u03B1\u03C3\u03B7\u03C2: \u039D\u03B1 \u03B6\u03B7\u03C4\u03AE\u03C3\u03B5\u03C4\u03B5 \u03B1\u03BD\u03C4\u03AF\u03B3\u03C1\u03B1\u03C6\u03BF \u03C4\u03C9\u03BD \u03B4\u03B5\u03B4\u03BF\u03BC\u03AD\u03BD\u03C9\u03BD \u03C3\u03B1\u03C2.
\u2022 \u0394\u03B9\u03CC\u03C1\u03B8\u03C9\u03C3\u03B7\u03C2: \u039D\u03B1 \u03B6\u03B7\u03C4\u03AE\u03C3\u03B5\u03C4\u03B5 \u03B4\u03B9\u03CC\u03C1\u03B8\u03C9\u03C3\u03B7 \u03B1\u03BD\u03B1\u03BA\u03C1\u03B9\u03B2\u03CE\u03BD \u03B4\u03B5\u03B4\u03BF\u03BC\u03AD\u03BD\u03C9\u03BD.
\u2022 \u0394\u03B9\u03B1\u03B3\u03C1\u03B1\u03C6\u03AE\u03C2: \u039D\u03B1 \u03B6\u03B7\u03C4\u03AE\u03C3\u03B5\u03C4\u03B5 \u03B4\u03B9\u03B1\u03B3\u03C1\u03B1\u03C6\u03AE \u03C4\u03C9\u03BD \u03B4\u03B5\u03B4\u03BF\u03BC\u03AD\u03BD\u03C9\u03BD \u03C3\u03B1\u03C2.
\u2022 \u0391\u03BD\u03C4\u03AF\u03C1\u03C1\u03B7\u03C3\u03B7\u03C2: \u039D\u03B1 \u03B1\u03BD\u03C4\u03B9\u03C4\u03B1\u03C7\u03B8\u03B5\u03AF\u03C4\u03B5 \u03C3\u03C4\u03B7\u03BD \u03B5\u03C0\u03B5\u03BE\u03B5\u03C1\u03B3\u03B1\u03C3\u03AF\u03B1 \u03C3\u03B5 \u03BF\u03C1\u03B9\u03C3\u03BC\u03AD\u03BD\u03B5\u03C2 \u03C0\u03B5\u03C1\u03B9\u03C0\u03C4\u03CE\u03C3\u03B5\u03B9\u03C2.

\u0395\u03C0\u03B9\u03BA\u03BF\u03B9\u03BD\u03C9\u03BD\u03AE\u03C3\u03C4\u03B5 \u03C3\u03C4\u03BF contact@sunsetvilla.com. \u0398\u03B1 \u03B1\u03C0\u03B1\u03BD\u03C4\u03AE\u03C3\u03BF\u03C5\u03BC\u03B5 \u03B5\u03BD\u03C4\u03CC\u03C2 30 \u03B7\u03BC\u03B5\u03C1\u03CE\u03BD.


\u0391\u03C3\u03C6\u03AC\u03BB\u03B5\u03B9\u03B1

\u039B\u03B1\u03BC\u03B2\u03AC\u03BD\u03BF\u03C5\u03BC\u03B5 \u03B5\u03CD\u03BB\u03BF\u03B3\u03B1 \u03BC\u03AD\u03C4\u03C1\u03B1 \u03B3\u03B9\u03B1 \u03C4\u03B7\u03BD \u03C0\u03C1\u03BF\u03C3\u03C4\u03B1\u03C3\u03AF\u03B1 \u03C4\u03C9\u03BD \u03C0\u03BB\u03B7\u03C1\u03BF\u03C6\u03BF\u03C1\u03B9\u03CE\u03BD \u03C3\u03B1\u03C2. \u039F\u03B9 \u03C0\u03BB\u03B7\u03C1\u03C9\u03BC\u03AD\u03C2 \u03B4\u03B9\u03B1\u03C7\u03B5\u03B9\u03C1\u03AF\u03B6\u03BF\u03BD\u03C4\u03B1\u03B9 \u03B1\u03C0\u03CC \u03C4\u03BF Stripe \u03C3\u03CD\u03BC\u03C6\u03C9\u03BD\u03B1 \u03BC\u03B5 \u03C4\u03B1 \u03C0\u03C1\u03CC\u03C4\u03C5\u03C0\u03B1 PCI DSS.


Cookies

\u0391\u03C5\u03C4\u03CC\u03C2 \u03BF \u03B9\u03C3\u03C4\u03CC\u03C4\u03BF\u03C0\u03BF\u03C2 \u03B4\u03B5\u03BD \u03C7\u03C1\u03B7\u03C3\u03B9\u03BC\u03BF\u03C0\u03BF\u03B9\u03B5\u03AF cookies \u03C0\u03B1\u03C1\u03B1\u03BA\u03BF\u03BB\u03BF\u03CD\u03B8\u03B7\u03C3\u03B7\u03C2. \u03A7\u03C1\u03B7\u03C3\u03B9\u03BC\u03BF\u03C0\u03BF\u03B9\u03BF\u03CD\u03BC\u03B5 \u03BC\u03CC\u03BD\u03BF \u03B1\u03C0\u03B1\u03C1\u03B1\u03AF\u03C4\u03B7\u03C4\u03B1 cookies \u03C3\u03C5\u03BD\u03B5\u03B4\u03C1\u03AF\u03B1\u03C2.


\u0391\u03BB\u03BB\u03B1\u03B3\u03AD\u03C2 \u03C3\u03C4\u03B7\u03BD \u03C0\u03BF\u03BB\u03B9\u03C4\u03B9\u03BA\u03AE

\u039C\u03C0\u03BF\u03C1\u03B5\u03AF \u03BD\u03B1 \u03B5\u03BD\u03B7\u03BC\u03B5\u03C1\u03CE\u03C3\u03BF\u03C5\u03BC\u03B5 \u03B1\u03C5\u03C4\u03AE\u03BD \u03C4\u03B7\u03BD \u03C0\u03BF\u03BB\u03B9\u03C4\u03B9\u03BA\u03AE \u03BA\u03B1\u03C4\u03AC \u03BA\u03B1\u03B9\u03C1\u03BF\u03CD\u03C2. \u039F\u03B9 \u03B1\u03BB\u03BB\u03B1\u03B3\u03AD\u03C2 \u03B8\u03B1 \u03B1\u03BD\u03B1\u03C1\u03C4\u03CE\u03BD\u03C4\u03B1\u03B9 \u03C3\u03B5 \u03B1\u03C5\u03C4\u03AE \u03C4\u03B7 \u03C3\u03B5\u03BB\u03AF\u03B4\u03B1.


\u0395\u03C0\u03B9\u03BA\u03BF\u03B9\u03BD\u03C9\u03BD\u03AF\u03B1

\u0395\u03C1\u03C9\u03C4\u03AE\u03C3\u03B5\u03B9\u03C2 \u03C3\u03C7\u03B5\u03C4\u03B9\u03BA\u03AC \u03BC\u03B5 \u03B1\u03C5\u03C4\u03AE\u03BD \u03C4\u03B7\u03BD \u03C0\u03BF\u03BB\u03B9\u03C4\u03B9\u03BA\u03AE;

\u0399\u03B4\u03B9\u03BF\u03BA\u03C4\u03AE\u03C4\u03B7\u03C2 Villa Elara
Email: contact@sunsetvilla.com`;

export function PrivacyEditorPage() {
  const [editLang, setEditLang] = useState<EditLang>('en');
  const [contents, setContents] = useState<Record<EditLang, string>>({
    en: INITIAL_EN,
    el: INITIAL_EL,
  });
  const [lastUpdated, setLastUpdated] = useState('March 2026');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.subtitle}>Edit the privacy policy shown to guests</p>
        </div>
        <div className={styles.headerControls}>
          <LangTabs value={editLang} onChange={setEditLang} />
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.previewLink}
          >
            <ExternalLink size={14} />
            View live page
          </a>
        </div>
      </div>

      <form className={styles.form} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        {editLang === 'en' && (
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Document Settings</h2>
            <div className={styles.field}>
              <label className={styles.label}>Last Modified</label>
              <input
                type="text"
                className={styles.input}
                value={lastUpdated}
                onChange={(e) => setLastUpdated(e.target.value)}
                placeholder="e.g. March 2026"
              />
            </div>
          </div>
        )}

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.sectionTitle}>Content</h2>
            <span className={styles.formatHint}>
              Use blank lines to separate paragraphs. Start a line with &bull; for list items.
              Section headings are lines that appear before a blank line and a body paragraph.
            </span>
          </div>
          <textarea
            className={styles.editor}
            value={contents[editLang]}
            onChange={(e) => setContents((prev) => ({ ...prev, [editLang]: e.target.value }))}
            rows={40}
            spellCheck
          />
        </div>

        <div className={styles.actions}>
          <button type="submit" className={`${styles.saveButton} ${saved ? styles.saved : ''}`}>
            {saved ? 'Saved' : 'Save Changes'}
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => {
              setContents((prev) => ({
                ...prev,
                [editLang]: editLang === 'en' ? INITIAL_EN : INITIAL_EL,
              }));
              if (editLang === 'en') setLastUpdated('March 2026');
            }}
          >
            Discard
          </button>
        </div>
      </form>
    </div>
  );
}
