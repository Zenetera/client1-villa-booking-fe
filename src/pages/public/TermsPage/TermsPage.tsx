import styles from './TermsPage.module.css';

export function TermsPage() {
  return (
    <div className={styles.container}>
      <article className={styles.content}>
        <h1>Terms of Service</h1>

        <section>
          <h2>Booking request and confirmation</h2>
          <p>
            When you submit a booking request through this website, you are making an offer to rent Villa Elara. Your request is
            <strong> pending </strong>
            until the owner reviews and confirms it. The owner may accept, decline, or contact you with questions. Confirmation is at the owner's sole discretion.
          </p>
          <p>
            Once confirmed, the booking becomes a binding reservation between you and the owner. You will receive a confirmation email with your reference code, dates, and total price.
          </p>
        </section>

        <section>
          <h2>Deposit and payment</h2>
          <p>
            A non-refundable deposit is required to secure your booking. The deposit amount will be shown during checkout. The deposit is
            <strong> non-refundable </strong>
            under all circumstances, including guest-initiated cancellation.
          </p>
          <p>
            The final balance is due 30 days before your check-in date. Payment instructions will be provided in your confirmation email. If payment is not received by the due date, the booking may be cancelled.
          </p>
          <p>
            All prices are quoted in EUR and include the nightly rate plus tourist tax. No additional fees apply.
          </p>
        </section>

        <section>
          <h2>Cancellation policy</h2>
          <ul>
            <li>
              <strong>More than 30 days before check-in:</strong>
              {' '}
              50% refund of deposit.
            </li>
            <li>
              <strong>15–30 days before check-in:</strong>
              {' '}
              25% refund of deposit.
            </li>
            <li>
              <strong>Fewer than 15 days before check-in:</strong>
              {' '}
              No refund. Deposit is forfeited.
            </li>
          </ul>
          <p>
            Cancellations must be made in writing to the owner. The date of the owner's email response determines the refund tier.
          </p>
        </section>

        <section>
          <h2>House rules</h2>
          <p>
            By confirming your booking, you agree to comply with the house rules displayed on the villa detail page. Key rules include:
          </p>
          <ul>
            <li>Check-in after 3:00 PM, check-out by 11:00 AM.</li>
            <li>Quiet hours between 10:00 PM and 8:00 AM.</li>
            <li>No parties, events, or excessive noise.</li>
            <li>No smoking indoors.</li>
            <li>No pets without prior written approval.</li>
            <li>Maximum occupancy as stated in your booking.</li>
          </ul>
          <p>
            Violation of house rules may result in immediate eviction without refund. The owner reserves the right to inspect the villa during your stay if necessary.
          </p>
        </section>

        <section>
          <h2>Damage and liability</h2>
          <p>
            You are responsible for any damage to the villa or furnishings beyond normal wear and tear caused by you or your guests. Damage costs will be deducted from your deposit or billed separately.
          </p>
          <p>
            The owner is not liable for:
          </p>
          <ul>
            <li>Personal injury or death while on the property.</li>
            <li>Loss, theft, or damage to personal belongings.</li>
            <li>Loss of business or enjoyment due to circumstances beyond the owner's control (weather, illness, etc.).</li>
            <li>Utility outages, internet disruptions, or appliance malfunctions.</li>
          </ul>
          <p>
            You use the villa at your own risk and should obtain travel insurance covering cancellation and injury.
          </p>
        </section>

        <section>
          <h2>Early departure</h2>
          <p>
            If you depart before your check-out date, no refund will be issued. The villa is considered occupied for the full duration of your booking.
          </p>
        </section>

        <section>
          <h2>Changes by the owner</h2>
          <p>
            The owner reserves the right to cancel a confirmed booking if circumstances beyond their control make the villa unavailable (natural disaster, emergency repairs, etc.). In such cases, a full refund will be issued, and the owner will assist in finding alternative accommodation.
          </p>
        </section>

        <section>
          <h2>Guest conduct</h2>
          <p>
            Guests must behave respectfully and not disturb neighbors. Disruptive behavior, illegal activity, or violation of house rules may result in immediate eviction and forfeiture of all payments.
          </p>
        </section>

        <section>
          <h2>Disputes and governing law</h2>
          <p>
            These terms are governed by the laws of Greece. Any disputes shall be resolved through good-faith negotiation. If unresolved, disputes may be referred to local civil courts.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about these terms? Contact the owner at
            {' '}
            <a href="mailto:contact@villaelara.com">contact@villaelara.com</a>
            .
          </p>
        </section>

        <p className={styles.lastUpdated}>
          Last updated: March 2026
        </p>
      </article>
    </div>
  );
}
