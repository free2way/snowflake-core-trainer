import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ExamApp from '@/components/ExamApp';
import { verifySession } from '@/lib/auth';

export default async function HomePage() {
  const cookieStore = await cookies();
  if (!verifySession(cookieStore.get('snowpath_session')?.value)) redirect('/login');
  return <ExamApp />;
}
