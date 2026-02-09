import { redirect } from 'next/navigation';

export default async function SignUpRedirect({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  let locale = 'en';

  if (callbackUrl) {
    try {
      // Handle both absolute and relative URLs
      const pathname = callbackUrl.startsWith('http') 
        ? new URL(callbackUrl).pathname 
        : callbackUrl;
      
      const parts = pathname.split('/').filter(Boolean);
      if (parts[0] === 'en' || parts[0] === 'fr') {
        locale = parts[0];
      }
    } catch {
      // Ignore malformed callbackUrl.
    }
  }

  const nextUrl = callbackUrl
    ? `/${locale}/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : `/${locale}/signup`;

  redirect(nextUrl);
}
