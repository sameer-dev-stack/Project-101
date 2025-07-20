
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validation/authSchemas';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { LanguageToggle } from '../ui/LanguageToggle';
import { useTranslation } from '@/hooks/use-translation';

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'user@example.com',
      password: 'password123',
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would call your API here.
      // For demo purposes, we log in a mock user.
      // We can add logic to check for a mock admin user.
      if (data.email === 'admin@example.com') {
         login('admin@example.com', 'Admin User', 'admin');
      } else {
         login(data.email, 'John Doe', 'rider');
      }

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-none md:border md:shadow-lg">
      <div className="flex justify-end p-2">
        <LanguageToggle />
      </div>
      <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">{t('welcome')}</CardTitle>
        <CardDescription>
          {t('login_prompt')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleLogin)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">{t('password')}</Label>
              <Link href="#" className="ml-auto inline-block text-sm text-primary underline">
                {t('forgot_password')}
              </Link>
            </div>
             <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className={errors.password ? 'border-destructive' : ''}
              />
               <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                aria-label={showPassword ? t('hide_password') : t('show_password')}
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
             {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('signing_in')}
              </>
            ) : (
              t('sign_in')
            )}
          </Button>
          <Button variant="outline" className="w-full" type="button">
            {t('login_with_google')}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          {t('no_account')}{' '}
          <Link href="/signup" className="underline text-primary">
            {t('sign_up')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
