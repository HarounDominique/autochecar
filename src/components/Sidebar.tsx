"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import CustomButton from "@/components/ui/CustomButton";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
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
    // Refresca para que la app recargue estado
    window.location.reload();
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/auth/login");
    // Opcional: no hace falta reload aquí si login te redirige al dashboard y el sidebar se actualiza
  };

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/auth/register");
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
            <p className="text-sm text-gray-600 px-3">
              Sesión iniciada como
              <br />
              <span className="font-medium">{user.email}</span>
            </p>
            <Button onClick={handleLogout} className="w-full mt-2" variant="outline">
              Cerrar sesión
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleLoginClick} className="w-full" variant="outline">
              Iniciar sesión
            </Button>
            <CustomButton text="Registrarse" onClick={handleRegisterClick} className="w-full"/>
          </>
        )}
      </div>
    </aside>
  );
}