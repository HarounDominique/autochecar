"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CustomButton from "@/components/ui/CustomButton";
import { FaCar, FaMotorcycle } from "react-icons/fa";

// Importa todas las marcas de simple-icons
import * as simpleIcons from "simple-icons";

type Vehicle = {
  id: number;
  brand: string;
  model: string;
  year?: number;
  type: "car" | "motorcycle" | string;
};

function MarcaIcon({ brand }: { brand: string }) {
  if (!brand) return null;

  // Normalizamos la marca para buscar en simple-icons (sin espacios, lowercase)
  const key = brand
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/\./g, ""); // Quitar puntos por ejemplo en marcas como "Land Rover"

  // Buscamos el icono: simple-icons exporta objetos con keys como 'siToyota'
  // El nombre de la constante es en formato camel case con prefijo 'si'
  // Ejemplo: 'siToyota', 'siVolkswagen', etc.

  // Buscamos por coincidencia insensible:
  // Hay que iterar sobre simpleIcons para buscar la marca correcta
  const iconEntry = Object.values(simpleIcons).find(
    (icon) =>
      typeof icon === "object" &&
      "title" in icon &&
      icon.title.toLowerCase() === brand.toLowerCase()
  );

  if (!iconEntry) {
    // No encontrado, fallback:
    return <span className="text-gray-400 text-2xl">🚗</span>;
  }

  // Icono encontrado: iconEntry.svg es el path SVG, iconEntry.hex el color
  const { hex, svg, title } = iconEntry as {
    hex: string;
    svg: string;
    title: string;
  };

  // El svg viene con la etiqueta <svg ...> completa, pero solo queremos el path
  // Para evitar duplicar svg, extraemos solo el path content
  // SVG viene tipo: <svg role="img" ...><title>Title</title><path d="..."/></svg>
  // Vamos a extraer la parte del path con regex simple

  const pathMatch = svg.match(/<path d="([^"]+)"\/>/);
  const pathData = pathMatch ? pathMatch[1] : "";

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={32}
      height={32}
      fill={`#${hex}`}
      className="flex-shrink-0"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={pathData} />
    </svg>
  );
}

export default function GaragePage() {
  const router = useRouter();
  const supabase = createClient();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error obteniendo usuario:", userError);
        setVehicles([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error obteniendo vehículos:", error);
        setVehicles([]);
      } else {
        setVehicles(data);
      }
      setLoading(false);
    };

    fetchVehicles();
  }, [supabase]);

  const handleAddVehicle = () => {
    router.push("/dashboard/garage/add");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Mi Garaje</h1>
        <CustomButton text="Añadir vehículo" onClick={handleAddVehicle} />
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando vehículos...</p>
      ) : vehicles.length === 0 ? (
        <p className="text-gray-500 italic">*sonido de grillos*</p>
      ) : (
        <div className="grid gap-4">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="border p-4 rounded-lg shadow-sm bg-white flex items-center gap-4"
            >
              {v.type === "car" ? (
                <FaCar className="text-2xl text-blue-600" />
              ) : v.type === "motorcycle" ? (
                <FaMotorcycle className="text-2xl text-green-600" />
              ) : (
                <span className="text-gray-400 text-2xl">🚗</span>
              )}

              <MarcaIcon brand={v.brand} />

              <div>
                <h2 className="text-lg font-semibold">
                  {v.brand} {v.model}
                </h2>
                {v.year && <p className="text-sm text-gray-600">Año: {v.year}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
