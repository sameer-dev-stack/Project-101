
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import OTPInput from './OTPInput';
import { 
  sendEmailOTP, 
  verifyEmailOTP, 
  maskEmail, 
  isValidOTP 
} from '@/lib/utils/otpUtils';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

export default function EmailVerificationForm() {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const { toast } = useToast();
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);
  
  useEffect(() => {
    if(!email) {
      router.push('/signup');
    }
  }, [email, router]);

  const handleVerify = async () => {
    if (!isValidOTP(otp)) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const result = await verifyEmailOTP(email, otp);
      
      if (result.success) {
        setSuccess(true);
        toast({
          title: "Email Verified!",
          description: "Redirecting to login...",
        });
        setTimeout(() => {
          router.push('/?verified=true');
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');

    try {
      const result = await sendEmailOTP(email);
      
      if (result.success) {
        toast({
          title: "Code Sent",
          description: result.message,
        });
        setResendCooldown(30); // 30 second cooldown
        setOtp(''); // Clear current OTP
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => {
    router.push('/signup');
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto border-none shadow-none md:border md:shadow-lg">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold">Email Verified!</h2>
              <p className="text-muted-foreground mt-2">
                Your email has been successfully verified. Redirecting...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-none md:border md:shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-muted-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
             <span className="sr-only">Back to signup</span>
          </Button>
          <CardTitle className="text-2xl font-bold">
            Verify Email
          </CardTitle>
        </div>
        <CardDescription className="pl-12">
          We've sent a 6-digit verification code to
          <br />
          <span className="font-semibold text-primary">{maskEmail(email)}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex justify-center text-primary">
          <Mail className="w-16 h-16" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2 text-center">
            <Label htmlFor="otp-input">
              Enter verification code
            </Label>
            <OTPInput
              value={otp}
              onChange={setOtp}
              disabled={isVerifying}
              error={!!error}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleVerify}
            disabled={otp.length !== 6 || isVerifying}
            className="w-full"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?{' '}
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0 || isResending}
                className="text-primary hover:underline font-medium disabled:text-muted-foreground disabled:no-underline"
              >
                {isResending ? 'Sending...' : 
                 resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 
                 'Resend code'}
              </button>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
