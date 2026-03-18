"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import RefreshBar from "@/components/layout/RefreshBar";
import { DashboardProvider } from "@/lib/DashboardContext";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="en">
      <body className="bg-amadeus-light min-h-screen">
        <DashboardProvider>
          <div className="flex min-h-screen">
            <Sidebar
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
            <main className="flex-1 flex flex-col min-h-screen">
              <RefreshBar onMenuClick={() => setSidebarOpen(true)} />
              <div className="flex-1 overflow-auto">{children}</div>
            </main>
          </div>
        </DashboardProvider>
      </body>
    </html>
  );
}
