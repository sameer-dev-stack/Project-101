
import { Suspense } from 'react';
import EmailVerificationForm from '@/components/auth/EmailVerificationForm';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-md">
        <Suspense fallback={<div>Loading...</div>}>
          <EmailVerificationForm />
        </Suspense>
      </div>
    </div>
  );
}
