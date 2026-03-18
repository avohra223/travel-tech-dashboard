"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StartupFundingRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/ai-tools");
  }, [router]);
  return (
    <div className="p-6 text-gray-400 text-sm">
      Redirecting to Startups & New Entrants...
    </div>
  );
}
