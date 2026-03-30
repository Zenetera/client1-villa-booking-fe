import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import styles from './LocationMap.module.css';

export function LocationMap() {
  return (
    <section className={styles.section}>
      <div className={styles.topRow}>
        <div id="location"className={styles.mapWrapper}>
          <iframe
            className={styles.map}
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48456.85488425492!2d14.560055!3d40.633333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x133b975f6cfae565%3A0xc8ddf8e0b8e5e1d0!2sAmalfi%20Coast!5e0!3m2!1sen!2sit!4v1700000000000"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Villa location on map"
          />
        </div>

        <div id="contact" className={styles.rightCol}>
          <h3 className={styles.formHeading}>Send a Message</h3>
          <form className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="contact-name">Name</label>
                <input
                  id="contact-name"
                  type="text"
                  className={styles.input}
                  placeholder="Your name"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  type="email"
                  className={styles.input}
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="contact-subject">Subject</label>
              <input
                id="contact-subject"
                type="text"
                className={styles.input}
                placeholder="Booking inquiry, question…"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                className={styles.textarea}
                rows={6}
                placeholder="Tell us about your stay…"
              />
            </div>
            <button type="submit" className={styles.submitBtn}>Send Message</button>
          </form>
        </div>
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.infoBlock}>
          <div className={styles.iconWrapper}>
            <MapPin size={20} />
          </div>
          <div>
            <h3 className={styles.infoTitle}>Address</h3>
            <p className={styles.infoText}>
              Via Marina Grande, 12<br />
              Amalfi, SA 84011<br />
              Amalfi Coast, Italy
            </p>
          </div>
        </div>

        <div className={styles.infoBlock}>
          <div className={styles.iconWrapper}>
            <Phone size={20} />
          </div>
          <div>
            <h3 className={styles.infoTitle}>Phone</h3>
            <p className={styles.infoText}>+39 089 871 234</p>
          </div>
        </div>

        <div className={styles.infoBlock}>
          <div className={styles.iconWrapper}>
            <Mail size={20} />
          </div>
          <div>
            <h3 className={styles.infoTitle}>Email</h3>
            <p className={styles.infoText}>contact@villahaven.com</p>
          </div>
        </div>

        <div className={styles.infoBlock}>
          <div className={styles.iconWrapper}>
            <Clock size={20} />
          </div>
          <div>
            <h3 className={styles.infoTitle}>Check-in / Check-out</h3>
            <p className={styles.infoText}>
              Check-in: 3:00 PM<br />
              Check-out: 11:00 AM
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
