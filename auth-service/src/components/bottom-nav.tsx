
"use client";

import Link from "next/link";
import { Home, LayoutGrid, List, User, Shield } from "lucide-react";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { LanguageToggle } from "./ui/LanguageToggle";
import { useTranslation } from "@/hooks/use-translation";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    { icon: <Home className="size-6" />, label: t("home"), href: "/dashboard" },
    { icon: <LayoutGrid className="size-6" />, label: t("services"), href: "/services" },
    { icon: <List className="size-6" />, label: t("activity"), href: "/activity" },
    { icon: <User className="size-6" />, label: t("account"), href: "/account" },
  ];
  
  const adminNavItem = { icon: <Shield className="size-6" />, label: t("admin"), href: "/admin" };


  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background border-t shadow-t-lg">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-1 transition-colors hover:text-primary",
              pathname === item.href ? "text-primary" : "text-muted-foreground"
            )}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
        {user?.role === 'admin' && (
           <Link
            key={adminNavItem.label}
            href={adminNavItem.href}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-1 transition-colors hover:text-primary",
              pathname.startsWith(adminNavItem.href) ? "text-primary" : "text-muted-foreground"
            )}
          >
            {adminNavItem.icon}
            <span className="text-xs font-medium">{adminNavItem.label}</span>
          </Link>
        )}
        <LanguageToggle />
      </div>
    </nav>
  );
}
