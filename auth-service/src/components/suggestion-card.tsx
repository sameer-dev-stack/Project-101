"use client";

import type { ReactNode } from "react";
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface SuggestionCardProps {
  icon: ReactNode;
  label: string;
  className?: string;
}

export function SuggestionCard({ icon, label, className }: SuggestionCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push('/booking');
  };

  return (
    <Button 
      variant="ghost" 
      className={cn("h-auto p-2 flex-col gap-2 group", className)}
      onClick={handleClick}
    >
        <div className="flex size-16 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-primary/5">
            <div className="text-muted-foreground transition-colors group-hover:text-primary">
            {icon}
            </div>
        </div>
        <p className="text-sm font-semibold">{label}</p>
    </Button>
  );
}
