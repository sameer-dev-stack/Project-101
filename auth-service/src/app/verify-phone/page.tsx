
import { Suspense } from 'react';
import PhoneVerificationForm from '@/components/auth/PhoneVerificationForm';

export default function VerifyPhonePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-md">
        <Suspense fallback={<div>Loading...</div>}>
          <PhoneVerificationForm />
        </Suspense>
      </div>
    </div>
  );
}
