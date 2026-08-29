export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12 text-green-100">
      <h1 className="mb-6 text-3xl font-bold text-green-400">Privacy Policy</h1>
      <div className="space-y-4 text-sm leading-7">
        <p>Last updated: August 29, 2026.</p>
        <p>We store account details needed to operate the service: email address, username, optional name and phone number, password hash, account status, and access flags.</p>
        <p>Game progress is currently stored in your browser. Vercel Analytics is enabled to provide aggregated usage and performance information. Stripe processes payment information; this application does not store complete card details.</p>
        <p>You may request access, correction, or deletion of your account data by contacting help@nuhar.se.</p>
        <p>Do not submit secrets, personal information, or third-party data as challenge payloads.</p>
      </div>
    </article>
  );
}
