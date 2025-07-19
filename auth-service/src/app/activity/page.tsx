
import Link from "next/link";
import { ArrowLeft, Car, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const pastRides = [
  {
    destination: "123 Main St, Anytown, USA",
    date: "July 15, 2024",
    price: "$14.50",
    rating: 5,
  },
  {
    destination: "456 Business Ave, Downtown",
    date: "July 12, 2024",
    price: "$22.00",
    rating: 4,
  },
   {
    destination: "789 Park Blvd, Uptown",
    date: "July 10, 2024",
    price: "$9.75",
    rating: 5,
  },
];

export default function ActivityPage() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-md bg-background pb-28 shadow-lg min-h-screen">
        <div className="p-4 pt-6 space-y-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary font-semibold">
            <ArrowLeft className="size-5" />
            Back to Home
          </Link>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">My Activity</h1>
            <p className="text-muted-foreground">View your past ride history.</p>
          </div>
           <div className="grid gap-4">
            {pastRides.map((ride, index) => (
               <Card key={index}>
                 <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2"><Car className="size-5" /> Ride</CardTitle>
                            <CardDescription>{ride.date}</CardDescription>
                        </div>
                        <p className="text-lg font-bold">{ride.price}</p>
                    </div>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <p>{ride.destination}</p>
                    <Separator />
                    <div className="flex items-center gap-2">
                       <div className="flex items-center gap-1">
                         {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`size-4 ${i < ride.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                         ))}
                       </div>
                       <p className="text-sm text-muted-foreground">You rated {ride.rating} stars</p>
                    </div>
                 </CardContent>
               </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
