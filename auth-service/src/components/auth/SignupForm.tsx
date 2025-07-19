
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupFormData } from '@/lib/validation/authSchemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();


  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
    clearErrors
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      contactMethod: 'email',
      acceptTerms: false
    }
  });

  const contactMethod = watch('contactMethod');
  const passwordValue = watch('password');

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(passwordValue || '');

  const onSubmit = async (data: SignupFormData) => {
    try {
      // Mock API call - replace with actual signup logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Signup data:', data);
      
      toast({
        title: "Account Created! Verify to continue.",
        description: "Redirecting to verification...",
      });
      
      // Redirect to appropriate verification page
      if (data.contactMethod === 'email') {
        router.push(`/verify-email?email=${encodeURIComponent(data.email || '')}`);
      } else {
        router.push(`/verify-phone?phone=${encodeURIComponent(data.phone || '')}`);
      }
      
    } catch (error) {
      console.error('Signup failed:', error);
      toast({
        title: "Signup Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      })
    }
  };

  const handleContactMethodChange = (value: string) => {
    const method = value as 'email' | 'phone';
    setValue('contactMethod', method);
    
    // Clear the opposite field and its errors when switching
    if (method === 'email') {
      setValue('phone', '');
      clearErrors('phone');
    } else {
      setValue('email', '');
      clearErrors('email');
    }
    clearErrors('contactMethod'); // Clear the combined error message
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return 'bg-red-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    if (passwordStrength < 100) return 'bg-blue-500';
    return 'bg-green-500';
  }

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-none md:border md:shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">
          Create an Account
        </CardTitle>
        <CardDescription>
          Join VelocityGo and start your journey today.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                placeholder="John"
                className={errors.firstName ? 'border-destructive' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                placeholder="Doe"
                className={errors.lastName ? 'border-destructive' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Sign up with</Label>
            <RadioGroup
              value={contactMethod}
              onValueChange={handleContactMethodChange}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email-option" />
                <Label htmlFor="email-option">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="phone-option" />
                <Label htmlFor="phone-option">Phone</Label>
              </div>
            </RadioGroup>
            {(errors.email || errors.phone) && !errors.contactMethod && (
                 <p className="text-sm text-destructive">{errors.email?.message || errors.phone?.message}</p>
            )}
             {errors.contactMethod && (
                 <p className="text-sm text-destructive">{errors.contactMethod.message}</p>
            )}
          </div>

          {contactMethod === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="john.doe@example.com"
                className={errors.email ? 'border-destructive' : ''}
              />
            </div>
          )}

          {contactMethod === 'phone' && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="+1 555 123 4567"
                className={errors.phone ? 'border-destructive' : ''}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="••••••••"
                className={errors.password ? 'border-destructive' : ''}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
            
            {passwordValue && (
              <div className="space-y-1.5 pt-1">
                <div className="flex space-x-1">
                  <div className={`h-1 flex-1 rounded ${passwordStrength >= 25 ? getPasswordStrengthColor() : 'bg-muted'}`} />
                  <div className={`h-1 flex-1 rounded ${passwordStrength >= 50 ? getPasswordStrengthColor() : 'bg-muted'}`} />
                  <div className={`h-1 flex-1 rounded ${passwordStrength >= 75 ? getPasswordStrengthColor() : 'bg-muted'}`} />
                  <div className={`h-1 flex-1 rounded ${passwordStrength >= 100 ? getPasswordStrengthColor() : 'bg-muted'}`} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Password strength: {
                    passwordStrength < 50 ? 'Weak' :
                    passwordStrength < 75 ? 'Fair' :
                    passwordStrength < 100 ? 'Good' : 'Strong'
                  }
                </p>
              </div>
            )}
            
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                placeholder="••••••••"
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
               <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
              >
                {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-start space-x-3 pt-2">
            <Checkbox
              id="acceptTerms"
              {...register('acceptTerms')}
              className={errors.acceptTerms ? 'border-destructive' : ''}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="acceptTerms" className="text-sm font-normal">
                I accept the{' '}
                <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
                  Privacy Policy
                </Link>
              </Label>
              {errors.acceptTerms && (
                <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
              )}
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/" className="font-semibold text-primary underline-offset-4 hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
