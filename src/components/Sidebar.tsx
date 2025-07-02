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
    // Obtiene el usuario actual al montar
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Escucha cambios en el estado de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Limpia la suscripción al desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/"); // Redirige a inicio tras logout
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/auth/login");
  };

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/auth/register");
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4">
      {/* SVG arriba del título */}
      <div className="mb-4 flex justify-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          role="img"
        >
          <path
            fill="#83bf4f"
            d="M58.4 0L23.6 38.3l-10.1-7.7H7.9l15.7 25.5L64 0z"
          ></path>
          <path
            d="M53.9 56.1c0 .6-.5 1.1-1.1 1.1H7.9c-.6 0-1.1-.5-1.1-1.1V11.2c0-.6.5-1.1 1.1-1.1h30.7l6.1-6.7H2.2C1 3.4 0 4.4 0 5.6v56.1C0 63 1 64 2.2 64h56.1c1.2 0 2.2-1 2.2-2.2V18.1l-6.7 9.4c.1 0 .1 28.6.1 28.6"
            fill="#3e4347"
          ></path>
        </svg>
      </div>

      <h1 className="text-xl font-bold mb-6 text-center">autochecar</h1>

      <nav className="space-y-2 mb-6">
        
        <Link
          href="/dashboard/reliability"
          className={`block px-3 py-2 rounded-md hover:bg-gray-100 ${
            pathname === "/dashboard/reliability" ? "bg-gray-100 font-semibold" : ""
          }`}
        >
          Fiabilidad
        </Link>


        {user && (
          <>
            <Link
              href="/dashboard/garage"
              className={`block px-3 py-2 rounded-md hover:bg-gray-100 ${
                pathname === "/dashboard/garage" ? "bg-gray-100 font-semibold" : ""
              }`}
            >
              Garaje
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
            <CustomButton
              text="Registrarse"
              onClick={handleRegisterClick}
              className="w-full"
            />
          </>
        )}
      </div>
    </aside>
  );
}
