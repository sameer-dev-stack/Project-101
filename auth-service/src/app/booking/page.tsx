
'use client';

import Link from "next/link";
import { ArrowLeft, Car, Bike, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const rideOptions = [
  { name: "Bike", price: "৳150", time: "5:28 PM", icon: <Bike className="size-6" /> },
];

export default function BookingPage() {
  const { toast } = useToast();
  const router = useRouter();

  const handleConfirmBooking = () => {
    toast({
      title: "Booking Confirmed!",
      description: "Your ride is on the way.",
    });
    router.push('/');
  };


  return (
    <div className="min-h-screen">
       <main className="mx-auto max-w-md bg-background pb-28 shadow-lg min-h-screen">
        <div className="p-4 pt-6 space-y-4">
          <Link href="/" className="flex items-center gap-2 text-primary font-semibold">
            <ArrowLeft className="size-5" />
            Back
          </Link>
          <div className="space-y-2">
             <Input defaultValue="123 Main St, Anytown, USA" placeholder="Pickup location"/>
             <Input placeholder="Where to?" />
          </div>
        </div>
        <div className="relative h-64 w-full">
            <Image
                src="https://placehold.co/600x400.png"
                alt="Map placeholder"
                layout="fill"
                objectFit="cover"
                data-ai-hint="street map"
            />
        </div>
         <div className="p-4 space-y-4">
            <h2 className="text-lg font-semibold">Choose a ride</h2>
            <div className="space-y-3">
            {rideOptions.map((ride) => (
                <Card key={ride.name} className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted">
                    <div className="flex items-center gap-4">
                        {ride.icon}
                        <div>
                            <p className="font-bold">{ride.name}</p>
                            <p className="text-sm text-muted-foreground">{ride.time}</p>
                        </div>
                    </div>
                    <p className="font-semibold">{ride.price}</p>
                </Card>
            ))}
            </div>
            <Separator />
            <div className="flex items-center gap-4">
                <Calendar className="size-5 text-muted-foreground" />
                <p>Schedule for later</p>
            </div>
            <Button className="w-full" size="lg" onClick={handleConfirmBooking}>
                Confirm Booking
            </Button>
         </div>
      </main>
    </div>
  );
}
