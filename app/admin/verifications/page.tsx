'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerificationsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main admin page
    router.replace('/admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-white">Redirecting...</div>
    </div>
  );
}
