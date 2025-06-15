import React from "react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav style={{
        width: 250,
        backgroundColor: "#111",
        color: "white",
        padding: 20,
      }}>
        <h2>Menú</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li><Link href="/dashboard">Inicio</Link></li>
          <li><Link href="/dashboard/perfil">Perfil</Link></li>
          <li><Link href="/dashboard/configuracion">Configuración</Link></li>
        </ul>
      </nav>

      <main style={{ flex: 1, padding: 20 }}>
        {children}
      </main>
    </div>
  );
}
