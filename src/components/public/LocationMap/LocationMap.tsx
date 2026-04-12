import { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import {
  fetchPublicContactInfo,
  fetchVilla,
  submitContactInquiry,
} from '../../../api/villa';
import type { PublicContactInfo } from '../../../api/villa';
import styles from './LocationMap.module.css';

function formatTime(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${suffix}`;
}

export function LocationMap() {
  const { t, lang } = useLanguage();
  const [contact, setContact] = useState<PublicContactInfo | null>(null);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [mapSrc, setMapSrc] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = formName.trim();
    const email = formEmail.trim();
    const subject = formSubject.trim();
    const message = formMessage.trim();
    if (!name || !email || !subject || !message || !/^\S+@\S+\.\S+$/.test(email)) {
      setFormError(t.contact.errorMessage);
      setFormStatus('error');
      setSubmitting(false);
      return;
    }
    setSubmitting(true);
    setFormStatus('idle');
    setFormError(null);
    try {
      await submitContactInquiry({ name, email, subject, message });
      setFormStatus('success');
      setFormName('');
      setFormEmail('');
      setFormSubject('');
      setFormMessage('');
    } catch (err) {
      setFormStatus('error');
      setFormError(err instanceof Error ? err.message : t.contact.errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchPublicContactInfo()
      .then(setContact)
      .catch(() => {});
    fetchVilla(lang)
      .then((villa) => {
        setCheckIn(villa.checkInTime);
        setCheckOut(villa.checkOutTime);
        if (villa.latitude != null && villa.longitude != null) {
          const q = encodeURIComponent(`${villa.latitude},${villa.longitude}`);
          setMapSrc(`https://maps.google.com/maps?q=${q}&z=15&output=embed`);
        }
      })
      .catch(() => {});
  }, [lang]);

  const addressLines = contact
    ? [
        contact.streetAddress,
        [contact.city, contact.region, contact.postalCode].filter(Boolean).join(', '),
        contact.country,
      ].filter(Boolean)
    : [];

  return (
    <section className={styles.section}>
      <div className={styles.topRow}>
        <div id="location" className={styles.mapWrapper}>
          {mapSrc && (
            <iframe
              className={styles.map}
              src={mapSrc}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={t.contact.mapTitle}
            />
          )}
        </div>

        <div id="contact" className={styles.rightCol}>
          <h3 className={styles.formHeading}>{t.contact.formHeading}</h3>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="contact-name">{t.contact.name}</label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  className={styles.input}
                  placeholder={t.contact.namePlaceholder}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="contact-email">{t.guestInfo.email}</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  className={styles.input}
                  placeholder={t.contact.emailPlaceholder}
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="contact-subject">{t.contact.subject}</label>
              <input
                id="contact-subject"
                type="text"
                required
                className={styles.input}
                placeholder={t.contact.subjectPlaceholder}
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="contact-message">{t.contact.message}</label>
              <textarea
                id="contact-message"
                className={styles.textarea}
                rows={6}
                required
                placeholder={t.contact.messagePlaceholder}
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                disabled={submitting}
              />
            </div>
            {formStatus === 'success' && (
              <div role="status" aria-live="polite" aria-atomic="true">
                <div className={styles.formSuccess}>{t.contact.successMessage}</div>
              </div>
            )}
            {formStatus === 'error' && (
              <div role="alert" aria-live="assertive" aria-atomic="true">
                <div className={styles.formError}>{formError || t.contact.errorMessage}</div>
              </div>
            )}
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? t.contact.sending : t.contact.sendButton}
            </button>
          </form>
        </div>
      </div>

      <div className={styles.bottomRow}>
        {addressLines.length > 0 && (
          <div className={styles.infoBlock}>
            <div className={styles.iconWrapper}>
              <MapPin size={20} />
            </div>
            <div>
              <h3 className={styles.infoTitle}>{t.contact.addressTitle}</h3>
              <p className={styles.infoText}>
                {addressLines.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < addressLines.length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>
          </div>
        )}

        {contact?.phone && (
          <div className={styles.infoBlock}>
            <div className={styles.iconWrapper}>
              <Phone size={20} />
            </div>
            <div>
              <h3 className={styles.infoTitle}>{t.contact.phoneTitle}</h3>
              <p className={styles.infoText}>{contact.phone}</p>
            </div>
          </div>
        )}

        {contact?.email && (
          <div className={styles.infoBlock}>
            <div className={styles.iconWrapper}>
              <Mail size={20} />
            </div>
            <div>
              <h3 className={styles.infoTitle}>{t.contact.emailTitle}</h3>
              <p className={styles.infoText}>{contact.email}</p>
            </div>
          </div>
        )}

        {checkIn && checkOut && (
          <div className={styles.infoBlock}>
            <div className={styles.iconWrapper}>
              <Clock size={20} />
            </div>
            <div>
              <h3 className={styles.infoTitle}>{t.contact.checkInOutTitle}</h3>
              <p className={styles.infoText}>
                {t.contact.checkInLabel} {formatTime(checkIn)}<br />
                {t.contact.checkOutLabel} {formatTime(checkOut)}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
