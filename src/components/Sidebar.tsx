"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4">
      <h1 className="text-xl font-bold mb-6">autochecar</h1>

      <nav className="space-y-2 mb-6">
        <Link
          href="/dashboard"
          className={`block px-3 py-2 rounded-md hover:bg-gray-100 ${
            pathname === "/dashboard" ? "bg-gray-100 font-semibold" : ""
          }`}
        >
          Inicio
        </Link>

        {user && (
          <>
            <Link
              href="/dashboard/garage"
              className={`block px-3 py-2 rounded-md hover:bg-gray-100 ${
                pathname === "/dashboard/garage" ? "bg-gray-100 font-semibold" : ""
              }`}
            >
              Mi Garaje
            </Link>

            <Link
              href="/dashboard/profile"
              className={`block px-3 py-2 rounded-md hover:bg-gray-100 ${
                pathname === "/dashboard/profile" ? "bg-gray-100 font-semibold" : ""
              }`}
            >
              Perfil
            </Link>
          </>
        )}

        <Link
          href="/dashboard/settings"
          className={`block px-3 py-2 rounded-md hover:bg-gray-100 ${
            pathname === "/dashboard/settings" ? "bg-gray-100 font-semibold" : ""
          }`}
        >
          Configuración
        </Link>
      </nav>

      <div className="space-y-2">
        {user ? (
          <>
            <p className="text-sm text-gray-600 px-3">Sesión iniciada como<br /><span className="font-medium">{user.email}</span></p>
            <Button onClick={handleLogout} className="w-full mt-2" variant="outline">
              Cerrar sesión
            </Button>
          </>
        ) : (
          <>
            <Link href="/auth/login">
              <Button className="w-full" variant="outline">Iniciar sesión</Button>
            </Link>
            <Link href="/auth/register">
              <Button className="w-full">Registrarse</Button>
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
