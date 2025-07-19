
"use client";

import { Clock, MapPin } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Separator } from "@/components/ui/separator";
import { Button } from "./ui/button";

const recentLocations = [
  {
    icon: <Clock className="h-5 w-5 text-muted-foreground" />,
    name: "Home",
    address: "123 Main St, Anytown, USA",
  },
  {
    icon: <MapPin className="h-5 w-5 text-muted-foreground" />,
    name: "Office",
    address: "456 Business Ave, Downtown",
  },
];

export function RecentLocations() {
  const router = useRouter();

  const handleClick = (locationName: string) => {
    router.push('/booking');
  };

  return (
    <div className="space-y-4">
      {recentLocations.map((location, index) => (
        <div key={location.name}>
          <Button
            variant="ghost"
            className="group flex h-auto cursor-pointer items-center gap-4 p-0"
            onClick={() => handleClick(location.name)}
          >
            <div className="rounded-full bg-muted p-3">
              {location.icon}
            </div>
            <div className="text-left">
              <p className="font-semibold transition-colors group-hover:text-primary">{location.name}</p>
              <p className="text-sm text-muted-foreground">{location.address}</p>
            </div>
          </Button>
          {index < recentLocations.length - 1 && <Separator className="mt-4" />}
        </div>
      ))}
    </div>
  );
}
