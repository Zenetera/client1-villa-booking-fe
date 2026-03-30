import React from 'react';
import styles from './PrivacyPage.module.css';

export function PrivacyPage() {
  return (
    <div className={styles.container}>
      <article className={styles.content}>
        <h1>Privacy policy</h1>

        <section>
          <h2>What we collect</h2>
          <p>
            When you submit a booking request through this website, we collect:
          </p>
          <ul>
            <li>Your name</li>
            <li>Your email address</li>
            <li>Your phone number</li>
            <li>Check-in and check-out dates</li>
            <li>Number of guests</li>
            <li>Any message or special requests you provide</li>
          </ul>
          <p>
            We do not collect sensitive personal data such as passport numbers, payment card details, or health information unless you voluntarily provide it in a message.
          </p>
        </section>

        <section>
          <h2>Why we collect it</h2>
          <p>
            We use your information to:
          </p>
          <ul>
            <li>Process and respond to your booking request</li>
            <li>Send confirmation emails and booking details</li>
            <li>Contact you about your reservation (reminders, check-in instructions, etc.)</li>
            <li>Resolve disputes or address issues with your stay</li>
            <li>Comply with legal and tax obligations</li>
          </ul>
          <p>
            We do not use your information for marketing, newsletters, or any other purpose without your consent.
          </p>
        </section>

        <section>
          <h2>Who we share it with</h2>
          <p>
            Your information is shared only with:
          </p>
          <ul>
            <li>
              <strong>Payment processor:</strong>
              {' '}
              Stripe (if paying online). Stripe handles payment data securely and separately.
            </li>
            <li>
              <strong>Email service:</strong>
              {' '}
              Brevo. We use Brevo to send confirmation and reminder emails. Your email address and name are shared only for this purpose.
            </li>
            <li>
              <strong>The villa owner:</strong>
              {' '}
              Your booking details, contact information, and any messages are visible to the owner to manage your reservation.
            </li>
          </ul>
          <p>
            We do not sell, rent, or disclose your information to third parties.
          </p>
        </section>

        <section>
          <h2>Data retention</h2>
          <p>
            We retain your booking information for up to 3 years after your stay to maintain records for disputes, tax purposes, and service history. After 3 years, your data is deleted unless legally required to retain it.
          </p>
          <p>
            You may request deletion of your data at any time by contacting the owner.
          </p>
        </section>

        <section>
          <h2>Your rights (GDPR)</h2>
          <p>
            If you are in the European Union, you have the right to:
          </p>
          <ul>
            <li>
              <strong>Access:</strong>
              {' '}
              Request a copy of the personal data we hold about you.
            </li>
            <li>
              <strong>Correction:</strong>
              {' '}
              Request that we correct inaccurate or incomplete data.
            </li>
            <li>
              <strong>Deletion:</strong>
              {' '}
              Request that we delete your data (the "right to be forgotten"), except where we have a legal obligation to retain it.
            </li>
            <li>
              <strong>Objection:</strong>
              {' '}
              Object to the processing of your data in certain circumstances.
            </li>
          </ul>
          <p>
            To exercise any of these rights, contact the owner at
            {' '}
            <a href="mailto:contact@villaelara.com">contact@villaelara.com</a>
            . We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2>Security</h2>
          <p>
            We take reasonable measures to protect your information from unauthorized access, alteration, or disclosure. However, no method of transmission over the internet is completely secure. We cannot guarantee absolute security.
          </p>
          <p>
            Payment information is handled by Stripe, which complies with PCI DSS standards and encrypts sensitive data.
          </p>
        </section>

        <section>
          <h2>Cookies</h2>
          <p>
            This website does not use tracking cookies or analytics. We use only essential session cookies to maintain your booking form state while you are submitting a request.
          </p>
        </section>

        <section>
          <h2>Third-party links</h2>
          <p>
            This website may link to external sites such as Google Maps or payment providers. We are not responsible for the privacy practices of third-party websites. Review their privacy policies before sharing information with them.
          </p>
        </section>

        <section>
          <h2>Changes to this policy</h2>
          <p>
            We may update this privacy policy occasionally. Changes will be posted on this page with an updated "Last modified" date. Continued use of the website constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            If you have questions about this privacy policy or how we handle your data, contact:
          </p>
          <p>
            <strong>Villa Elara Owner</strong>
            <br />
            Email:
            {' '}
            <a href="mailto:contact@villaelara.com">contact@villaelara.com</a>
          </p>
        </section>

        <p className={styles.lastUpdated}>
          Last modified: March 2026
        </p>
      </article>
    </div>
  );
}
