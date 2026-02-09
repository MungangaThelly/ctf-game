import { redirect } from 'next/navigation';

export default async function SignInRedirect({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  let locale = 'en';

  if (callbackUrl) {
    try {
      const url = new URL(callbackUrl);
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts[0] === 'en' || parts[0] === 'fr') {
        locale = parts[0];
      }
    } catch {
      // Ignore malformed callbackUrl.
    }
  }

  const nextUrl = callbackUrl
    ? `/${locale}/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : `/${locale}/signin`;

  redirect(nextUrl);
}
