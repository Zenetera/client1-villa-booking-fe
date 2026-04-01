import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { LangTabs } from '../../../components/admin/LangTabs';
import styles from './TermsEditorPage.module.css';

type EditLang = 'en' | 'el';

const INITIAL_EN = `Booking request and confirmation

When you submit a booking request through this website, you are making an offer to rent Sunset Villa. Your request is pending until the owner reviews and confirms it. The owner may accept, decline, or contact you with questions. Confirmation is at the owner's sole discretion.

Once confirmed, the booking becomes a binding reservation between you and the owner. You will receive a confirmation email with your reference code, dates, and total price.


Deposit and payment

A non-refundable deposit is required to secure your booking. The deposit amount will be shown during checkout. The deposit is non-refundable under all circumstances, including guest-initiated cancellation.

The final balance is due 30 days before your check-in date. Payment instructions will be provided in your confirmation email. If payment is not received by the due date, the booking may be cancelled.

All prices are quoted in EUR and include the nightly rate plus tourist tax. No additional fees apply.


Cancellation policy

\u2022 More than 30 days before check-in: 50% refund of deposit.
\u2022 15\u201330 days before check-in: 25% refund of deposit.
\u2022 Fewer than 15 days before check-in: No refund. Deposit is forfeited.

Cancellations must be made in writing to the owner. The date of the owner's email response determines the refund tier.


House rules

By confirming your booking, you agree to comply with the house rules displayed on the villa detail page. Key rules include:

\u2022 Check-in after 3:00 PM, check-out by 11:00 AM.
\u2022 Quiet hours between 10:00 PM and 8:00 AM.
\u2022 No parties, events, or excessive noise.
\u2022 No smoking indoors.
\u2022 No pets without prior written approval.
\u2022 Maximum occupancy as stated in your booking.

Violation of house rules may result in immediate eviction without refund. The owner reserves the right to inspect the villa during your stay if necessary.


Damage and liability

You are responsible for any damage to the villa or furnishings beyond normal wear and tear caused by you or your guests. Damage costs will be deducted from your deposit or billed separately.

The owner is not liable for:

\u2022 Personal injury or death while on the property.
\u2022 Loss, theft, or damage to personal belongings.
\u2022 Loss of business or enjoyment due to circumstances beyond the owner's control (weather, illness, etc.).
\u2022 Utility outages, internet disruptions, or appliance malfunctions.

You use the villa at your own risk and should obtain travel insurance covering cancellation and injury.


Early departure

If you depart before your check-out date, no refund will be issued. The villa is considered occupied for the full duration of your booking.


Changes by the owner

The owner reserves the right to cancel a confirmed booking if circumstances beyond their control make the villa unavailable (natural disaster, emergency repairs, etc.). In such cases, a full refund will be issued, and the owner will assist in finding alternative accommodation.


Guest conduct

Guests must behave respectfully and not disturb neighbors. Disruptive behavior, illegal activity, or violation of house rules may result in immediate eviction and forfeiture of all payments.


Disputes and governing law

These terms are governed by the laws of Greece. Any disputes shall be resolved through good-faith negotiation. If unresolved, disputes may be referred to local civil courts.


Contact

Questions about these terms? Contact the owner at contact@sunsetvilla.com.`;

const INITIAL_EL = `A\u03AF\u03C4\u03B7\u03C3\u03B7 \u03BA\u03C1\u03AC\u03C4\u03B7\u03C3\u03B7\u03C2 \u03BA\u03B1\u03B9 \u03B5\u03C0\u03B9\u03B2\u03B5\u03B2\u03B1\u03AF\u03C9\u03C3\u03B7

\u038C\u03C4\u03B1\u03BD \u03C5\u03C0\u03BF\u03B2\u03AC\u03BB\u03BB\u03B5\u03C4\u03B5 \u03B1\u03AF\u03C4\u03B7\u03C3\u03B7 \u03BA\u03C1\u03AC\u03C4\u03B7\u03C3\u03B7\u03C2 \u03BC\u03AD\u03C3\u03C9 \u03B1\u03C5\u03C4\u03BF\u03CD \u03C4\u03BF\u03C5 \u03B9\u03C3\u03C4\u03CC\u03C4\u03BF\u03C0\u03BF\u03C5, \u03BA\u03AC\u03BD\u03B5\u03C4\u03B5 \u03C0\u03C1\u03BF\u03C3\u03C6\u03BF\u03C1\u03AC \u03B3\u03B9\u03B1 \u03B5\u03BD\u03BF\u03B9\u03BA\u03AF\u03B1\u03C3\u03B7 \u03C4\u03B7\u03C2 \u0392\u03AF\u03BB\u03B1\u03C2 Sunset. \u0397 \u03B1\u03AF\u03C4\u03B7\u03C3\u03AE \u03C3\u03B1\u03C2 \u03B5\u03BA\u03BA\u03C1\u03B5\u03BC\u03B5\u03AF \u03BC\u03AD\u03C7\u03C1\u03B9 \u03BD\u03B1 \u03C4\u03B7\u03BD \u03B5\u03BE\u03B5\u03C4\u03AC\u03C3\u03B5\u03B9 \u03BA\u03B1\u03B9 \u03BD\u03B1 \u03C4\u03B7\u03BD \u03B5\u03C0\u03B9\u03B2\u03B5\u03B2\u03B1\u03B9\u03CE\u03C3\u03B5\u03B9 \u03BF \u03B9\u03B4\u03B9\u03BF\u03BA\u03C4\u03AE\u03C4\u03B7\u03C2.

\u039C\u03B5\u03C4\u03AC \u03C4\u03B7\u03BD \u03B5\u03C0\u03B9\u03B2\u03B5\u03B2\u03B1\u03AF\u03C9\u03C3\u03B7, \u03B7 \u03BA\u03C1\u03AC\u03C4\u03B7\u03C3\u03B7 \u03B3\u03AF\u03BD\u03B5\u03C4\u03B1\u03B9 \u03B4\u03B5\u03C3\u03BC\u03B5\u03C5\u03C4\u03B9\u03BA\u03AE. \u0398\u03B1 \u03BB\u03AC\u03B2\u03B5\u03C4\u03B5 email \u03B5\u03C0\u03B9\u03B2\u03B5\u03B2\u03B1\u03AF\u03C9\u03C3\u03B7\u03C2 \u03BC\u03B5 \u03C4\u03BF\u03BD \u03BA\u03C9\u03B4\u03B9\u03BA\u03CC \u03B1\u03BD\u03B1\u03C6\u03BF\u03C1\u03AC\u03C2, \u03C4\u03B9\u03C2 \u03B7\u03BC\u03B5\u03C1\u03BF\u03BC\u03B7\u03BD\u03AF\u03B5\u03C2 \u03BA\u03B1\u03B9 \u03C4\u03B7 \u03C3\u03C5\u03BD\u03BF\u03BB\u03B9\u03BA\u03AE \u03C4\u03B9\u03BC\u03AE.


\u03A0\u03C1\u03BF\u03BA\u03B1\u03C4\u03B1\u03B2\u03BF\u03BB\u03AE \u03BA\u03B1\u03B9 \u03C0\u03BB\u03B7\u03C1\u03C9\u03BC\u03AE

\u0391\u03C0\u03B1\u03B9\u03C4\u03B5\u03AF\u03C4\u03B1\u03B9 \u03BC\u03B7 \u03B5\u03C0\u03B9\u03C3\u03C4\u03C1\u03B5\u03C6\u03CC\u03BC\u03B5\u03BD\u03B7 \u03C0\u03C1\u03BF\u03BA\u03B1\u03C4\u03B1\u03B2\u03BF\u03BB\u03AE \u03B3\u03B9\u03B1 \u03C4\u03B7\u03BD \u03B5\u03BE\u03B1\u03C3\u03C6\u03AC\u03BB\u03B9\u03C3\u03B7 \u03C4\u03B7\u03C2 \u03BA\u03C1\u03AC\u03C4\u03B7\u03C3\u03AE\u03C2 \u03C3\u03B1\u03C2. \u0397 \u03C0\u03C1\u03BF\u03BA\u03B1\u03C4\u03B1\u03B2\u03BF\u03BB\u03AE \u03B4\u03B5\u03BD \u03B5\u03C0\u03B9\u03C3\u03C4\u03C1\u03AD\u03C6\u03B5\u03C4\u03B1\u03B9 \u03C3\u03B5 \u03BA\u03B1\u03BC\u03AF\u03B1 \u03C0\u03B5\u03C1\u03AF\u03C0\u03C4\u03C9\u03C3\u03B7.

\u0397 \u03C4\u03B5\u03BB\u03B9\u03BA\u03AE \u03B5\u03BE\u03CC\u03C6\u03BB\u03B7\u03C3\u03B7 \u03BF\u03C6\u03B5\u03AF\u03BB\u03B5\u03C4\u03B1\u03B9 30 \u03B7\u03BC\u03AD\u03C1\u03B5\u03C2 \u03C0\u03C1\u03B9\u03BD \u03C4\u03B7\u03BD \u03AC\u03C6\u03B9\u03BE\u03AE \u03C3\u03B1\u03C2.

\u038C\u03BB\u03B5\u03C2 \u03BF\u03B9 \u03C4\u03B9\u03BC\u03AD\u03C2 \u03B5\u03AF\u03BD\u03B1\u03B9 \u03C3\u03B5 EUR \u03BA\u03B1\u03B9 \u03C0\u03B5\u03C1\u03B9\u03BB\u03B1\u03BC\u03B2\u03AC\u03BD\u03BF\u03C5\u03BD \u03C4\u03B7 \u03B2\u03C1\u03B1\u03B4\u03B9\u03BD\u03AE \u03C4\u03B9\u03BC\u03AE \u03C0\u03BB\u03AD\u03BF\u03BD \u03C4\u03BF\u03C5\u03C1\u03B9\u03C3\u03C4\u03B9\u03BA\u03CC \u03C6\u03CC\u03C1\u03BF.


\u03A0\u03BF\u03BB\u03B9\u03C4\u03B9\u03BA\u03AE \u03B1\u03BA\u03CD\u03C1\u03C9\u03C3\u03B7\u03C2

\u2022 \u03A0\u03B5\u03C1\u03B9\u03C3\u03C3\u03CC\u03C4\u03B5\u03C1\u03B5\u03C2 \u03B1\u03C0\u03CC 30 \u03B7\u03BC\u03AD\u03C1\u03B5\u03C2 \u03C0\u03C1\u03B9\u03BD \u03C4\u03B7\u03BD \u03AC\u03C6\u03B9\u03BE\u03B7: \u0395\u03C0\u03B9\u03C3\u03C4\u03C1\u03BF\u03C6\u03AE 50% \u03C4\u03B7\u03C2 \u03C0\u03C1\u03BF\u03BA\u03B1\u03C4\u03B1\u03B2\u03BF\u03BB\u03AE\u03C2.
\u2022 15\u201330 \u03B7\u03BC\u03AD\u03C1\u03B5\u03C2 \u03C0\u03C1\u03B9\u03BD \u03C4\u03B7\u03BD \u03AC\u03C6\u03B9\u03BE\u03B7: \u0395\u03C0\u03B9\u03C3\u03C4\u03C1\u03BF\u03C6\u03AE 25% \u03C4\u03B7\u03C2 \u03C0\u03C1\u03BF\u03BA\u03B1\u03C4\u03B1\u03B2\u03BF\u03BB\u03AE\u03C2.
\u2022 \u039B\u03B9\u03B3\u03CC\u03C4\u03B5\u03C1\u03B5\u03C2 \u03B1\u03C0\u03CC 15 \u03B7\u03BC\u03AD\u03C1\u03B5\u03C2 \u03C0\u03C1\u03B9\u03BD \u03C4\u03B7\u03BD \u03AC\u03C6\u03B9\u03BE\u03B7: \u039A\u03B1\u03BC\u03AF\u03B1 \u03B5\u03C0\u03B9\u03C3\u03C4\u03C1\u03BF\u03C6\u03AE.

\u039F\u03B9 \u03B1\u03BA\u03C5\u03C1\u03CE\u03C3\u03B5\u03B9\u03C2 \u03C0\u03C1\u03AD\u03C0\u03B5\u03B9 \u03BD\u03B1 \u03B3\u03AF\u03BD\u03BF\u03BD\u03C4\u03B1\u03B9 \u03B5\u03B3\u03B3\u03C1\u03AC\u03C6\u03C9\u03C2 \u03C0\u03C1\u03BF\u03C2 \u03C4\u03BF\u03BD \u03B9\u03B4\u03B9\u03BF\u03BA\u03C4\u03AE\u03C4\u03B7.


\u039A\u03B1\u03BD\u03CC\u03BD\u03B5\u03C2 \u03C3\u03C0\u03B9\u03C4\u03B9\u03BF\u03CD

\u039C\u03B5 \u03C4\u03B7\u03BD \u03B5\u03C0\u03B9\u03B2\u03B5\u03B2\u03B1\u03AF\u03C9\u03C3\u03B7 \u03C4\u03B7\u03C2 \u03BA\u03C1\u03AC\u03C4\u03B7\u03C3\u03AE\u03C2 \u03C3\u03B1\u03C2, \u03C3\u03C5\u03BC\u03C6\u03C9\u03BD\u03B5\u03AF\u03C4\u03B5 \u03BD\u03B1 \u03C4\u03B7\u03C1\u03B5\u03AF\u03C4\u03B5 \u03C4\u03BF\u03C5\u03C2 \u03BA\u03B1\u03BD\u03CC\u03BD\u03B5\u03C2:

\u2022 \u0386\u03C6\u03B9\u03BE\u03B7 \u03BC\u03B5\u03C4\u03AC \u03C4\u03B9\u03C2 3:00 \u03BC.\u03BC., \u03B1\u03BD\u03B1\u03C7\u03CE\u03C1\u03B7\u03C3\u03B7 \u03AD\u03C9\u03C2 11:00 \u03C0.\u03BC.
\u2022 \u038F\u03C1\u03B5\u03C2 \u03B7\u03C3\u03C5\u03C7\u03AF\u03B1\u03C2 10:00 \u03BC.\u03BC. \u2013 8:00 \u03C0.\u03BC.
\u2022 \u0391\u03C0\u03B1\u03B3\u03BF\u03C1\u03B5\u03CD\u03BF\u03BD\u03C4\u03B1\u03B9 \u03C0\u03AC\u03C1\u03C4\u03B9 \u03BA\u03B1\u03B9 \u03C5\u03C0\u03B5\u03C1\u03B2\u03BF\u03BB\u03B9\u03BA\u03CC\u03C2 \u03B8\u03CC\u03C1\u03C5\u03B2\u03BF\u03C2.
\u2022 \u0391\u03C0\u03B1\u03B3\u03BF\u03C1\u03B5\u03CD\u03B5\u03C4\u03B1\u03B9 \u03C4\u03BF \u03BA\u03AC\u03C0\u03BD\u03B9\u03C3\u03BC\u03B1 \u03C3\u03B5 \u03B5\u03C3\u03C9\u03C4\u03B5\u03C1\u03B9\u03BA\u03BF\u03CD\u03C2 \u03C7\u03CE\u03C1\u03BF\u03C5\u03C2.
\u2022 \u039A\u03B1\u03C4\u03BF\u03B9\u03BA\u03AF\u03B4\u03B9\u03B1 \u03BC\u03CC\u03BD\u03BF \u03BA\u03B1\u03C4\u03CC\u03C0\u03B9\u03BD \u03B3\u03C1\u03B1\u03C0\u03C4\u03AE\u03C2 \u03AD\u03B3\u03BA\u03C1\u03B9\u03C3\u03B7\u03C2.


\u0396\u03B7\u03BC\u03B9\u03AD\u03C2 \u03BA\u03B1\u03B9 \u03B5\u03C5\u03B8\u03CD\u03BD\u03B7

\u0395\u03AF\u03C3\u03C4\u03B5 \u03C5\u03C0\u03B5\u03CD\u03B8\u03C5\u03BD\u03BF\u03B9 \u03B3\u03B9\u03B1 \u03BF\u03C0\u03BF\u03B9\u03B1\u03B4\u03AE\u03C0\u03BF\u03C4\u03B5 \u03B6\u03B7\u03BC\u03B9\u03AC \u03C0\u03AD\u03C1\u03B1\u03BD \u03C4\u03B7\u03C2 \u03C6\u03C5\u03C3\u03B9\u03BF\u03BB\u03BF\u03B3\u03B9\u03BA\u03AE\u03C2 \u03C6\u03B8\u03BF\u03C1\u03AC\u03C2. \u039F \u03B9\u03B4\u03B9\u03BF\u03BA\u03C4\u03AE\u03C4\u03B7\u03C2 \u03B4\u03B5\u03BD \u03B5\u03C5\u03B8\u03CD\u03BD\u03B5\u03C4\u03B1\u03B9 \u03B3\u03B9\u03B1 \u03C0\u03C1\u03BF\u03C3\u03C9\u03C0\u03B9\u03BA\u03CC \u03C4\u03C1\u03B1\u03C5\u03BC\u03B1\u03C4\u03B9\u03C3\u03BC\u03CC, \u03B1\u03C0\u03CE\u03BB\u03B5\u03B9\u03B1 \u03AE \u03BA\u03BB\u03BF\u03C0\u03AE \u03C0\u03C1\u03BF\u03C3\u03C9\u03C0\u03B9\u03BA\u03CE\u03BD \u03B1\u03BD\u03C4\u03B9\u03BA\u03B5\u03B9\u03BC\u03AD\u03BD\u03C9\u03BD.


\u0395\u03C6\u03B1\u03C1\u03BC\u03BF\u03C3\u03C4\u03AD\u03BF \u03B4\u03AF\u03BA\u03B1\u03B9\u03BF

\u039F\u03B9 \u03C0\u03B1\u03C1\u03CC\u03BD\u03C4\u03B5\u03C2 \u03CC\u03C1\u03BF\u03B9 \u03B4\u03B9\u03AD\u03C0\u03BF\u03BD\u03C4\u03B1\u03B9 \u03B1\u03C0\u03CC \u03C4\u03B7\u03BD \u03B5\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AE \u03BD\u03BF\u03BC\u03BF\u03B8\u03B5\u03C3\u03AF\u03B1.


\u0395\u03C0\u03B9\u03BA\u03BF\u03B9\u03BD\u03C9\u03BD\u03AF\u03B1

\u0395\u03C1\u03C9\u03C4\u03AE\u03C3\u03B5\u03B9\u03C2 \u03C3\u03C7\u03B5\u03C4\u03B9\u03BA\u03AC \u03BC\u03B5 \u03C4\u03BF\u03C5\u03C2 \u03CC\u03C1\u03BF\u03C5\u03C2; \u0395\u03C0\u03B9\u03BA\u03BF\u03B9\u03BD\u03C9\u03BD\u03AE\u03C3\u03C4\u03B5 \u03C3\u03C4\u03BF contact@sunsetvilla.com.`;

export function TermsEditorPage() {
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
          <h1 className={styles.title}>Terms &amp; Conditions</h1>
          <p className={styles.subtitle}>Edit the terms of service shown to guests</p>
        </div>
        <div className={styles.headerControls}>
          <LangTabs value={editLang} onChange={setEditLang} />
          <a
            href="/terms"
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
              <label className={styles.label}>Last Updated</label>
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
            rows={36}
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
