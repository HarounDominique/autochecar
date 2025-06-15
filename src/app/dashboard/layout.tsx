import React from "react";
import Sidebar from "@/components/Sidebar"; // ajusta la ruta si es necesario

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 20 }}>
        {children}
      </main>
    </div>
  );
}
