
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, CreditCard, History, User as UserIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('');
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-md bg-background pb-28 shadow-lg min-h-screen">
        <div className="p-4 pt-6 space-y-6">
           <Link href="/dashboard" className="flex items-center gap-2 text-primary font-semibold">
            <ArrowLeft className="size-5" />
            Back to Home
          </Link>
          
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-24 w-24">
              <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint="profile picture" />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            <Button variant="outline">Edit Profile</Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
                <div className="flex items-center p-4 cursor-pointer hover:bg-muted">
                    <UserIcon className="size-6 mr-4 text-primary" />
                    <div className="flex-1">
                        <p className="font-semibold">Account Info</p>
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground" />
                </div>
                <Separator />
                 <div className="flex items-center p-4 cursor-pointer hover:bg-muted">
                    <CreditCard className="size-6 mr-4 text-primary" />
                    <div className="flex-1">
                        <p className="font-semibold">Payment Methods</p>
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground" />
                </div>
                <Separator />
                 <Link href="/activity" className="flex items-center p-4 cursor-pointer hover:bg-muted">
                    <History className="size-6 mr-4 text-primary" />
                    <div className="flex-1">
                        <p className="font-semibold">Ride History</p>
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground" />
                </Link>
            </CardContent>
          </Card>

          <Button onClick={handleLogout} variant="destructive" className="w-full">
            Logout
          </Button>

        </div>
      </main>
    </div>
  );
}
