"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, AppUser } from "@/context/auth-context";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppUser["role"][];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (pathname === "/admin/login") {
        if (user && user.role === "admin") {
          router.push("/admin");
        } else {
          setIsAuthorized(true);
        }
        return;
      }

      if (!user) {
        // Not logged in
        if (pathname?.startsWith("/admin")) {
          router.push("/admin/login");
        } else {
          router.push("/store-partner");
        }
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Logged in but wrong role
        if (user.role === "admin") {
          router.push("/admin");
        } else if (user.role === "store_owner") {
          router.push("/store-owner/dashboard");
        } else {
          router.push("/");
        }
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, loading, router, pathname, allowedRoles]);

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
        <Loader2 className="w-10 h-10 animate-spin text-accent-blue" />
      </div>
    );
  }

  return <>{children}</>;
}
