"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Inicio", path: "/dashboard" },
  { name: "Mis Vehículos", path: "/dashboard/vehicles" },
  { name: "Perfil", path: "/dashboard/profile" },
  { name: "Configuración", path: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4">
      <h1 className="text-xl font-bold mb-6">AutoCheck</h1>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`block px-3 py-2 rounded-md hover:bg-gray-100 ${
              pathname === item.path ? "bg-gray-100 font-semibold" : ""
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
