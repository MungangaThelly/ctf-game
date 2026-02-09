import { redirect } from 'next/navigation';

export default async function ChallengeRedirect({
  params,
}: {
  params: Promise<{ challengeId: string }>;
}) {
  const { challengeId } = await params;
  redirect(`/en/challenges/${challengeId}`);
}
