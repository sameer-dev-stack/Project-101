
'use client';
import { Car } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { LocationSearch } from "@/components/location-search";
import { RecentLocations } from "@/components/recent-locations";
import { SuggestionCard } from "@/components/suggestion-card";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
        router.replace('/');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Loading...</p>
        </div>
        );
    }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-md bg-background pb-28 shadow-lg min-h-screen">
        <div className="p-4 pt-6 space-y-6">
          <LocationSearch />
          <RecentLocations />
          <div>
            <h2 className="text-lg font-semibold mb-3">Suggestions</h2>
            <div className="grid grid-cols-4 gap-4 text-center">
              <SuggestionCard icon={<Car className="size-7" />} label="Ride" />
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
