
import Link from "next/link";
import { ArrowLeft, Car, Utensils, KeyRound, CalendarClock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const services = [
  {
    icon: <Car className="size-8 text-primary" />,
    title: "Rides",
    description: "Reliable rides at a moment's notice.",
    href: "/booking"
  },
  {
    icon: <Utensils className="size-8 text-primary" />,
    title: "Eats",
    description: "Get your favorite meals delivered fast.",
    href: "#"
  },
  {
    icon: <KeyRound className="size-8 text-primary" />,
    title: "Rentals",
    description: "Rent a car for your next trip.",
    href: "#"
  },
  {
    icon: <CalendarClock className="size-8 text-primary" />,
    title: "Reserve",
    description: "Plan your trips in advance.",
    href: "/booking"
  }
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-md bg-background pb-28 shadow-lg min-h-screen">
        <div className="p-4 pt-6 space-y-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary font-semibold">
            <ArrowLeft className="size-5" />
            Back to Home
          </Link>
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Our Services</h1>
            <p className="text-muted-foreground">Choose from a variety of services to suit your needs.</p>
          </div>
           <div className="grid gap-4">
            {services.map((service) => (
              <Link href={service.href} key={service.title}>
                <Card className="hover:bg-muted transition-colors">
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    {service.icon}
                    <div>
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
