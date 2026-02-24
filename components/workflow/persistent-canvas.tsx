"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthDialog } from "@/components/auth/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { signOut, useSession } from "@/lib/auth-client";
import { WorkflowCanvas } from "./workflow-canvas";

export function PersistentCanvas() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [isVercelUser, setIsVercelUser] = useState<boolean | null>(null);

  // Show canvas on homepage and workflow pages
  const showCanvas = pathname === "/" || pathname.startsWith("/workflows/");

  useEffect(() => {
    let isMounted = true;

    if (!session?.user) {
      setIsVercelUser(false);
      return () => {
        isMounted = false;
      };
    }

    api.user
      .get()
      .then((user) => {
        if (!isMounted) {
          return;
        }
        setIsVercelUser(user.providerId === "vercel");
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }
        setIsVercelUser(false);
      });

    return () => {
      isMounted = false;
    };
  }, [session?.user]);

  if (!showCanvas) {
    return null;
  }

  if (isPending || (session?.user && isVercelUser === null)) {
    return null;
  }

  if (!session?.user || !isVercelUser) {
    return (
      <div className="fixed inset-0 z-10 flex items-center justify-center bg-background">
        <div className="flex w-full max-w-sm flex-col gap-3 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="font-semibold text-lg">Sign in with Vercel required</h2>
          <p className="text-muted-foreground text-sm">
            This app is gated. Continue with your Vercel account to use the
            workflow builder.
          </p>
          <div className="pt-1">
            <AuthDialog />
          </div>
          {session?.user && !isVercelUser && (
            <Button
              className="w-full"
              onClick={() => signOut()}
              type="button"
              variant="outline"
            >
              Log out and switch account
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0">
      <WorkflowCanvas />
    </div>
  );
}
